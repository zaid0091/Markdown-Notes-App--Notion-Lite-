from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PageViewSet, TagViewSet

app_name = 'notes'

router = DefaultRouter()
router.register('pages', PageViewSet, basename='page')
router.register('tags', TagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
]
