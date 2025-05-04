from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .forms import UserAvatarForm
from .serializers import UserSerializer, UserListSerializer

User = get_user_model()


@login_required
@require_http_methods(["POST"])
def upload_avatar(request):
    user = request.user
    form = UserAvatarForm(request.POST, request.FILES, instance=user)
    if form.is_valid():
        form.save()
        return JsonResponse({'success': True, 'avatar_url': user.avatar.url})
    else:
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(
        request.user,
        context={'request': request}
    )
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def user_list(request):
    queryset = User.objects.all().order_by('-date_joined')
    
    # Фильтрация по username если есть параметр
    username = request.query_params.get('username')
    if username:
        queryset = queryset.filter(username__icontains=username)
    
    serializer = UserListSerializer(
        queryset,
        many=True,
        context={'request': request}
    )
    return Response(serializer.data)


