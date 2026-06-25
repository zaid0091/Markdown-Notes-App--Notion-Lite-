from rest_framework import serializers
from .models import Page, Tag


class TagSerializer(serializers.ModelSerializer):
    pages = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Page.objects.all(),
        required=False
    )
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Tag
        fields = ('id', 'name', 'color', 'pages', 'user', 'created_at')
        read_only_fields = ('id', 'created_at', 'user')

    def validate_pages(self, value):
        user = self.context['request'].user
        for page in value:
            if page.user != user:
                raise serializers.ValidationError(
                    f"Page with ID {page.id} does not belong to your workspace."
                )
        return value


class PageSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        required=False
    )
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Page
        fields = (
            'id', 'title', 'content', 'parent', 'icon', 'cover_image',
            'is_favorite', 'is_archived', 'created_at', 'updated_at',
            'user', 'tags'
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')

    def validate_parent(self, value):
        if value is not None:
            user = self.context['request'].user
            if value.user != user:
                raise serializers.ValidationError(
                    "The selected parent page does not belong to your workspace."
                )
            
            # Prevent circular reference if updating an existing page
            if self.instance and (value == self.instance or value.is_descendant_of(self.instance)):
                raise serializers.ValidationError(
                    "A page cannot be its own parent or a parent of its descendants."
                )
        return value

    def validate_tags(self, value):
        user = self.context['request'].user
        for tag in value:
            if tag.user != user:
                raise serializers.ValidationError(
                    f"Tag with ID {tag.id} does not belong to your workspace."
                )
        return value

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        page = Page.objects.create(**validated_data)
        
        # Save tag associations (Tag is the owner of the ManyToMany relation)
        for tag in tags:
            tag.pages.add(page)
            
        return page

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        page = super().update(instance, validated_data)
        
        if tags is not None:
            # Clear existing tag relationships for this page and apply new ones
            page.tags.clear()
            for tag in tags:
                tag.pages.add(page)
                
        return page
