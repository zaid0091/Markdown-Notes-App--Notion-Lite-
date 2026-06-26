import pytest
import io
from PIL import Image
from django.urls import reverse
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import User

def get_temp_image(filename="avatar.png", format="PNG", size=(1, 1), compress_level=None):
    """Helper to generate a valid image file in memory."""
    file_obj = io.BytesIO()
    image = Image.new("RGBA", size=size, color=(255, 0, 0))
    save_kwargs = {}
    if format == "PNG" and compress_level is not None:
        save_kwargs["compress_level"] = compress_level
    image.save(file_obj, format=format, **save_kwargs)
    file_obj.seek(0)
    return SimpleUploadedFile(filename, file_obj.read(), content_type=f"image/{format.lower()}")

@pytest.mark.django_db
class TestProfileAPI:

    def test_get_profile_unauthenticated(self, api_client):
        url = reverse('users:profile')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_profile_authenticated(self, auth_client, test_user):
        url = reverse('users:profile')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == test_user.username
        assert response.data['email'] == test_user.email
        assert response.data['profile_picture'] is None

    def test_update_profile_basic_info(self, auth_client, test_user):
        url = reverse('users:profile')
        data = {
            'username': 'newusername',
            'email': 'newemail@example.com'
        }
        response = auth_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'newusername'
        assert response.data['email'] == 'newemail@example.com'

        # Verify database update
        test_user.refresh_from_db()
        assert test_user.username == 'newusername'
        assert test_user.email == 'newemail@example.com'

    def test_upload_valid_profile_picture(self, auth_client, test_user):
        url = reverse('users:profile')
        photo = get_temp_image("avatar.png", "PNG")
        data = {
            'username': test_user.username,
            'email': test_user.email,
            'profile_picture': photo
        }
        response = auth_client.patch(url, data, format='multipart')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['profile_picture'] is not None
        assert 'avatar' in response.data['profile_picture']

        test_user.refresh_from_db()
        assert test_user.profile_picture.name.startswith('profile_pics/avatar')

    def test_upload_oversized_profile_picture(self, auth_client, test_user):
        url = reverse('users:profile')
        # Create a valid 1200x1200px uncompressed PNG image (approx 5.76 MB on the wire)
        photo = get_temp_image("avatar.png", "PNG", size=(1200, 1200), compress_level=0)
        
        data = {
            'username': test_user.username,
            'email': test_user.email,
            'profile_picture': photo
        }
        response = auth_client.patch(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'profile_picture' in response.data
        assert 'size must be under 5MB' in str(response.data['profile_picture'])

    def test_upload_invalid_file_extension(self, auth_client, test_user):
        url = reverse('users:profile')
        # GIF is a valid image format, but we explicitly excluded it from allowed_extensions in UserSerializer
        photo = get_temp_image("avatar.gif", "GIF")
        data = {
            'username': test_user.username,
            'email': test_user.email,
            'profile_picture': photo
        }
        response = auth_client.patch(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'profile_picture' in response.data
        assert 'formats are supported' in str(response.data['profile_picture'])

    def test_remove_profile_picture(self, auth_client, test_user):
        # Set profile picture first
        photo = get_temp_image("avatar.png", "PNG")
        test_user.profile_picture = photo
        test_user.save()

        assert test_user.profile_picture.name != ''

        url = reverse('users:profile')
        # Setting profile_picture field to empty/null via patch clears it
        data = {
            'username': test_user.username,
            'email': test_user.email,
            'profile_picture': ''
        }
        response = auth_client.patch(url, data, format='multipart')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['profile_picture'] is None

        test_user.refresh_from_db()
        assert not test_user.profile_picture
