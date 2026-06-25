from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Page, Tag
from .serializers import PageSerializer, TagSerializer


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
