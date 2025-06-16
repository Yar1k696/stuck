"""
API views for user authentication and profile management.

This module provides API endpoints for CSRF token retrieval, user registration,
login, logout, and retrieving current user data.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.middleware.csrf import get_token
from .serializers import UserRegistrationSerializer, LoginSerializer, UserSerializer

User = get_user_model()

class CSRFTokenView(APIView):
    """
    View to retrieve CSRF token.

    Allows all users to obtain a CSRF token, required for session authentication
    and non-GET requests (POST, PUT, PATCH, DELETE) in a React frontend.
    """
    permission_classes = [AllowAny]

    def get(self, request: object, *args: tuple, **kwargs: dict) -> Response:
        """
        Handle GET request to retrieve CSRF token.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: JSON response with the CSRF token.
        """
        token = get_token(request)
        return Response({'csrfToken': token}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    """
    View for user registration.

    Allows unauthenticated users to register and optionally logs them in.
    """
    permission_classes = [AllowAny]

    def post(self, request: object, *args: tuple, **kwargs: dict) -> Response:
        """
        Handle POST request to register a new user.

        Args:
            request: The HTTP request object containing registration data.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: JSON response with user data on success or validation errors.
        """
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    View for user login.

    Authenticates users and sets session cookies upon success.
    """
    permission_classes = [AllowAny]

    def post(self, request: object, *args: tuple, **kwargs: dict) -> Response:
        """
        Handle POST request to authenticate a user.

        Args:
            request: The HTTP request object containing login data.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: JSON response with user data on success or validation errors.
        """
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """
    View for user logout.

    Ends the current user session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: object, *args: tuple, **kwargs: dict) -> Response:
        """
        Handle POST request to log out the current user.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: JSON response indicating successful logout.
        """
        logout(request)
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)

class UserView(APIView):
    """
    View to retrieve data of the current authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: object, *args: tuple, **kwargs: dict) -> Response:
        """
        Handle GET request to retrieve current user data.

        Args:
            request: The HTTP request object.
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        Returns:
            Response: JSON response with user data.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)