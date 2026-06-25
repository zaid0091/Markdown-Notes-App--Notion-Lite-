from django.conf import settings
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response_data = serializer.validated_data
        refresh_token = response_data.pop('refresh')  # Remove refresh token from response body

        response = Response(response_data, status=status.HTTP_200_OK)

        # Set refresh token in HttpOnly cookie
        cookie_settings = settings.SIMPLE_JWT
        response.set_cookie(
            key=cookie_settings['AUTH_COOKIE'],
            value=refresh_token,
            path=cookie_settings['AUTH_COOKIE_PATH'],
            expires=None,  # Session cookie, or map to lifetime
            secure=cookie_settings['AUTH_COOKIE_SECURE'],
            httponly=cookie_settings['AUTH_COOKIE_HTTP_ONLY'],
            samesite=cookie_settings['AUTH_COOKIE_SAME_SITE']
        )
        return response


class CustomTokenRefreshView(TokenRefreshView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        # Extract refresh token from HttpOnly cookie
        cookie_settings = settings.SIMPLE_JWT
        refresh_token = request.COOKIES.get(cookie_settings['AUTH_COOKIE'])

        if not refresh_token:
            return Response(
                {"detail": "Refresh token cookie is missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Inject refresh token into request data for the SimpleJWT serializer
        serializer = self.get_serializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        response_data = serializer.validated_data

        # If refresh token rotation is enabled, write the new refresh token back into cookie
        new_refresh = response_data.pop('refresh', None)
        response = Response(response_data, status=status.HTTP_200_OK)

        if new_refresh:
            response.set_cookie(
                key=cookie_settings['AUTH_COOKIE'],
                value=new_refresh,
                path=cookie_settings['AUTH_COOKIE_PATH'],
                expires=None,
                secure=cookie_settings['AUTH_COOKIE_SECURE'],
                httponly=cookie_settings['AUTH_COOKIE_HTTP_ONLY'],
                samesite=cookie_settings['AUTH_COOKIE_SAME_SITE']
            )
        return response


class LogoutView(views.APIView):
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        cookie_settings = settings.SIMPLE_JWT
        refresh_token = request.COOKIES.get(cookie_settings['AUTH_COOKIE'])

        response = Response(
            {"detail": "Successfully logged out."},
            status=status.HTTP_200_OK
        )

        # Delete cookie from client browser
        response.delete_cookie(
            key=cookie_settings['AUTH_COOKIE'],
            path=cookie_settings['AUTH_COOKIE_PATH']
        )

        # Blacklist the refresh token server-side if it exists
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                # Token might be expired or already blacklisted; proceed with logout
                pass

        return response


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user
