import pytest
from rest_framework.test import APIClient
from users.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        email="testuser@example.com",
        username="testuser",
        password="testpassword123"
    )

@pytest.fixture
def auth_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client
