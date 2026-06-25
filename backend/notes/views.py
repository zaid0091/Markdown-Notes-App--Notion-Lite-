from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchHeadline

from .models import Page, Tag
from .serializers import PageSerializer, TagSerializer, PageTreeSerializer
from .pdf_generator import generate_pdf


class PageViewSet(viewsets.ModelViewSet):
    serializer_class = PageSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('tags', 'is_favorite', 'is_archived')

    def get_queryset(self):
        # Enforce strict user workspace isolation
        return Page.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the request user as the workspace page owner
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        old_is_archived = instance.is_archived
        
        # Save updated instance
        page = serializer.save()
        
        # Cascade archive status to descendants if it changed
        if old_is_archived != page.is_archived:
            from django.db import transaction
            with transaction.atomic():
                page.get_descendants().update(is_archived=page.is_archived)

    def destroy(self, request, *args, **kwargs):
        # Prevent accidental data loss: pages must be soft-deleted (archived) first before deletion
        page = self.get_object()
        if not page.is_archived:
            return Response(
                {"detail": "Active notes cannot be permanently deleted. Archive the page first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        page = self.get_object()
        page.is_favorite = not page.is_favorite
        page.save()
        return Response(
            {
                "status": "favorite toggled",
                "is_favorite": page.is_favorite
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def tree(self, request):
        # Fetch all active notes for the requesting user ordered by django-mptt defaults
        pages = self.get_queryset().filter(is_archived=False).order_by('tree_id', 'lft')
        
        # Serialize database entries
        serialized = {
            str(p.id): {
                'id': str(p.id),
                'title': p.title,
                'icon': p.icon,
                'is_favorite': p.is_favorite,
                'parent': str(p.parent_id) if p.parent_id else None,
                'children': []
            }
            for p in pages
        }
        
        root_nodes = []
        for p in pages:
            node_id = str(p.id)
            node = serialized[node_id]
            parent_id = node['parent']
            if parent_id and parent_id in serialized:
                serialized[parent_id]['children'].append(node)
            else:
                # If parent does not exist or is archived, treat as root node
                root_nodes.append(node)
                
        return Response(root_nodes, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='upload-cover')
    def upload_cover(self, request, pk=None):
        page = self.get_object()
        file_obj = request.FILES.get('cover_image')
        
        if not file_obj:
            return Response(
                {"detail": "No image file provided in key 'cover_image'."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Enforce file size limit: 5MB
        if file_obj.size > 5 * 1024 * 1024:
            return Response(
                {"detail": "File size exceeds limit of 5MB."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Enforce file format whitelist: JPEG, PNG, WEBP
        content_type = file_obj.content_type
        if content_type not in ['image/jpeg', 'image/png', 'image/webp']:
            return Response(
                {"detail": "Only JPEG, PNG, and WEBP image formats are supported."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Clean up previous cover image to prevent media files accumulation
        if page.cover_image:
            page.cover_image.delete(save=False)
            
        page.cover_image = file_obj
        page.save()
        
        serializer = self.get_serializer(page)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        query_str = request.query_params.get('q', '').strip()
        if not query_str:
            return Response([], status=status.HTTP_200_OK)

        # Build PostgreSQL Full-Text Search structures
        search_query = SearchQuery(query_str, config='english')
        
        # Query search matches using trigger-synchronized index and calculate ranking
        queryset = self.get_queryset().filter(
            is_archived=False,
            search_vector=search_query
        ).annotate(
            rank=SearchRank('search_vector', search_query)
        )

        # Generate HTML-styled highlight annotations for matching text snippets
        queryset = queryset.annotate(
            headline_title=SearchHeadline(
                'title',
                search_query,
                start_sel='<mark class="highlight">',
                stop_sel='</mark>',
                highlight_all=True
            ),
            headline_content=SearchHeadline(
                'content',
                search_query,
                start_sel='<mark class="highlight">',
                stop_sel='</mark>',
                max_words=35,
                min_words=15
            )
        ).order_by('-rank')

        # Map results with highlights
        results = []
        for page in queryset:
            results.append({
                'id': str(page.id),
                'title': page.title,
                'icon': page.icon,
                'cover_image': page.cover_image.url if page.cover_image else None,
                'is_favorite': page.is_favorite,
                'created_at': page.created_at,
                'updated_at': page.updated_at,
                'highlighted_title': page.headline_title,
                'highlighted_content': page.headline_content,
                'rank': page.rank,
            })

        return Response(results, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        page = self.get_object()
        try:
            pdf_bytes = generate_pdf(page)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            # Escape double quotes in filename to prevent header injection or parsing issues
            filename = f"{page.title or 'Untitled'}.pdf".replace('"', '\\"')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response(
                {"detail": f"Failed to generate PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        page = self.get_object()
        if page.is_archived:
            return Response({"detail": "Page is already archived."}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.db import transaction
        with transaction.atomic():
            page.is_archived = True
            page.save()
            page.get_descendants().update(is_archived=True)
            
        return Response({"status": "page and descendants archived"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        page = self.get_object()
        if not page.is_archived:
            return Response({"detail": "Page is not archived."}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.db import transaction
        with transaction.atomic():
            page.is_archived = False
            page.save()
            page.get_descendants().update(is_archived=False)
            
        return Response({"status": "page and descendants restored"}, status=status.HTTP_200_OK)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('name',)

    def get_queryset(self):
        # Enforce strict user workspace isolation
        return Tag.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign the request user as the tag owner
        serializer.save(user=self.request.user)
