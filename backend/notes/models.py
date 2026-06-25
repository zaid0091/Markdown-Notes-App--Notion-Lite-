import uuid
from django.db import models
from django.conf import settings
from mptt.models import MPTTModel, MPTTForeignKey
from django.contrib.postgres.search import SearchVectorField


class Page(MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True, default="Untitled")
    content = models.TextField(blank=True, default="")
    
    # MPTT Recursive self-relationship
    parent = MPTTForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children',
        db_index=True
    )
    
    # Visual Customizations
    icon = models.CharField(max_length=50, blank=True, null=True)  # Emoji unicode / character
    cover_image = models.ImageField(upload_to='covers/', blank=True, null=True)
    
    # State flags
    is_favorite = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    # System Audits
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Ownership
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pages'
    )
    
    # PostgreSQL full-text search vector, managed via triggers (non-editable by ORM)
    search_vector = SearchVectorField(null=True, blank=True, editable=False)

    class MPTTMeta:
        order_insertion_by = ['created_at']

    def __str__(self):
        return self.title or "Untitled"
