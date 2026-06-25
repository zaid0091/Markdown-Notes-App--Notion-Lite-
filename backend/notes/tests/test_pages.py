import pytest
from django.urls import reverse
from rest_framework import status
from notes.models import Page, Tag
from users.models import User

@pytest.mark.django_db
class TestPageAPI:

    def test_unauthenticated_access_denied(self, api_client):
        # Verify access is restricted by default
        url = reverse('notes:page-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_page_crud_operations(self, auth_client):
        # Create
        url = reverse('notes:page-list')
        data = {'title': 'My New Note', 'content': '# Header\nContent here.'}
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        page_id = response.data['id']
        assert response.data['title'] == 'My New Note'

        # Read (Detail)
        detail_url = reverse('notes:page-detail', kwargs={'pk': page_id})
        response = auth_client.get(detail_url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['content'] == '# Header\nContent here.'

        # Update
        update_data = {'title': 'Updated Note Title', 'content': 'Changed content.'}
        response = auth_client.put(detail_url, update_data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Note Title'

        # Archive (Soft-delete via PATCH)
        response = auth_client.patch(detail_url, {'is_archived': True})
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_archived'] is True

        # Permanent Delete (Allowed since is_archived is True)
        response = auth_client.delete(detail_url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Page.objects.filter(id=page_id).count() == 0

    def test_soft_delete_restriction(self, auth_client):
        # Creating active page
        page = Page.objects.create(title="Active Page", user=User.objects.get(username="testuser"))
        url = reverse('notes:page-detail', kwargs={'pk': page.id})
        
        # Trying to delete active page should be blocked (HTTP 400)
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Active notes cannot be permanently deleted" in response.data['detail']

        # Archive first
        page.is_archived = True
        page.save()

        # Delete should now succeed
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_workspace_isolation(self, api_client, test_user):
        # Create second user
        other_user = User.objects.create_user(
            email="otheruser@example.com",
            username="otheruser",
            password="password123"
        )
        
        # Create page for other user
        other_page = Page.objects.create(title="Other User Page", user=other_user)
        
        # Authenticate as first user
        api_client.force_authenticate(user=test_user)
        
        # Try to read other user's page -> Should return 404 Not Found
        url = reverse('notes:page-detail', kwargs={'pk': other_page.id})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_page_tree_structure(self, auth_client, test_user):
        # Create recursive tree structure
        parent = Page.objects.create(title="Root", user=test_user)
        child = Page.objects.create(title="Child", parent=parent, user=test_user)
        grandchild = Page.objects.create(title="Grandchild", parent=child, user=test_user)
        archived_child = Page.objects.create(title="Archived Child", parent=parent, is_archived=True, user=test_user)

        url = reverse('notes:page-tree')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK

        # Verify active pages structure
        tree = response.data
        assert len(tree) == 1  # Only "Root" should be a root-level node returned
        assert tree[0]['title'] == "Root"
        assert len(tree[0]['children']) == 1  # Only "Child" is active
        assert tree[0]['children'][0]['title'] == "Child"
        assert len(tree[0]['children'][0]['children']) == 1  # "Grandchild" is child of "Child"
        assert tree[0]['children'][0]['children'][0]['title'] == "Grandchild"

    def test_toggle_favorite(self, auth_client, test_user):
        page = Page.objects.create(title="Favorite Page", user=test_user)
        url = reverse('notes:page-toggle-favorite', kwargs={'pk': page.id})

        # Toggle True
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_favorite'] is True

        # Toggle False
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_favorite'] is False

    def test_cascading_archive_operations(self, auth_client, test_user):
        # Create hierarchy
        parent = Page.objects.create(title="Parent", user=test_user)
        child = Page.objects.create(title="Child", parent=parent, user=test_user)

        # Archive parent using custom action
        archive_url = reverse('notes:page-archive', kwargs={'pk': parent.id})
        response = auth_client.post(archive_url)
        assert response.status_code == status.HTTP_200_OK

        # Check in DB
        parent.refresh_from_db()
        child.refresh_from_db()
        assert parent.is_archived is True
        assert child.is_archived is True

        # Restore parent using custom action
        restore_url = reverse('notes:page-restore', kwargs={'pk': parent.id})
        response = auth_client.post(restore_url)
        assert response.status_code == status.HTTP_200_OK

        parent.refresh_from_db()
        child.refresh_from_db()
        assert parent.is_archived is False
        assert child.is_archived is False

    def test_pdf_export(self, auth_client, test_user):
        page = Page.objects.create(
            title="Export PDF",
            content="# Hello World\nThis is a testing document.",
            user=test_user
        )
        url = reverse('notes:page-export', kwargs={'pk': page.id})
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/pdf'
        assert response.content.startswith(b'%PDF-')

    def test_full_text_search(self, auth_client, test_user):
        # PostgreSQL trigger runs asynchronously or synchronously on commits,
        # but in test environment transaction, triggers execute on insertion/updates.
        page = Page.objects.create(
            title="Unique Search Keyword Example",
            content="This note contains search keywords inside it.",
            user=test_user
        )
        # Note: In SQLite, Django SearchVectorField won't throw an error if mock structures are handled,
        # but in PostgreSQL it executes full matches.
        url = f"{reverse('notes:page-search')}?q=Unique"
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # Check if the created page is in results
        matches = [r for r in response.data if r['id'] == str(page.id)]
        assert len(matches) == 1
        assert "Unique" in matches[0]['highlighted_title']
