from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile_picture')
        read_only_fields = ('id',)

    def validate_profile_picture(self, value):
        if value:
            # Enforce 5MB file size limit
            max_size_bytes = 5 * 1024 * 1024
            if value.size > max_size_bytes:
                raise serializers.ValidationError("Profile picture size must be under 5MB.")
            
            # Enforce allowed image file extensions
            import os
            ext = os.path.splitext(value.name)[1].lower()
            allowed_extensions = ['.png', '.jpg', '.jpeg', '.webp']
            if ext not in allowed_extensions:
                raise serializers.ValidationError("Only PNG, JPEG, and WEBP image formats are supported.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom SimpleJWT serializer to append user serialized profiles
    in the JSON response containing the AccessToken.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
