from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Enforce unique email addresses for registration and login
    email = models.EmailField(unique=True)
    
    # Store user profile picture files in media folder
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    # Use email as the primary login identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
