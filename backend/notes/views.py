from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Page, Tag
from .serializers import PageSerializer, TagSerializer, PageTreeSerializer


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
