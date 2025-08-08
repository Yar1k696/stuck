"""
Views for user-related API endpoints.

This module provides API views for uploading user avatars, retrieving the
current user, and listing users.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .forms import UserAvatarForm
from .serializers import UserSerializer, UserListSerializer
import logging

User = get_user_model()

@login_required
@require_http_methods(["POST"])
def upload_avatar(request: object) -> JsonResponse:
    """
    Handle avatar upload for the authenticated user.

    Args:
        request: The HTTP request object containing avatar file data.

    Returns:
        JsonResponse: Response indicating success or validation errors.
    """
    user = request.user
    form = UserAvatarForm(request.POST, request.FILES, instance=user)
    if form.is_valid():
        form.save()
        return JsonResponse({'success': True, 'avatar_url': user.avatar.url})
    return JsonResponse({'success': False, 'errors': form.errors}, status=400)

logger = logging.getLogger(__name__)

@api_view(['GET'])
@csrf_exempt
@ensure_csrf_cookie
@permission_classes([AllowAny])
def current_user(request: object) -> Response:
    """
    Retrieve the current authenticated user's data and CSRF token.

    Args:
        request: The HTTP request object.

    Returns:
        Response: JSON response with user data and CSRF token.
    """
    logger.info(f"Request received: {request.method}, User authenticated: {request.user.is_authenticated}")
    csrf_token = get_token(request)
    logger.info(f"CSRF token generated: {csrf_token}")
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user, context={'request': request})
        return Response({'user': serializer.data, 'csrf_token': csrf_token})
    return Response({'user': None, 'csrf_token': csrf_token})

@api_view(['GET'])
@permission_classes([AllowAny])
def user_list(request: object) -> Response:
    """
    Retrieve a list of users with optional username filtering.

    Args:
        request: The HTTP request object with optional 'username' query parameter.

    Returns:
        Response: JSON response containing the list of users.
    """
    queryset = User.objects.all().order_by('-date_joined')
    username = request.query_params.get('username')
    if username:
        queryset = queryset.filter(username__icontains=username)
    serializer = UserListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)