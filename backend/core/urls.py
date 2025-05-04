from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from .views import upload_avatar, current_user, user_list
from . import views_auth

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/csrf/', views_auth.CSRFTokenView.as_view(), name='csrf_token'), # Ендпоінт для отримання CSRF
    path('api/auth/register/', views_auth.RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', views_auth.LoginView.as_view(), name='auth_login'),
    path('api/auth/logout/', views_auth.LogoutView.as_view(), name='auth_logout'),
    path('api/auth/user/', views_auth.UserView.as_view(), name='auth_user'), # Ендпоінт для отримання даних поточного користувача

    path('', TemplateView.as_view(template_name='index.html')),
    path('api/tasks/', include('task.urls')),
    path('api/projects/', include('project.urls')),
    path('api/user/avatar/', upload_avatar, name='avatar-upload'),
    path('api/user/me/', current_user, name='current_user'),
    path('api/users/', user_list, name='users'),
    re_path(r'^(?!api/|media/|assets/|static/).*$', TemplateView.as_view(template_name='index.html'), name='react_app')
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
