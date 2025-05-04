from django.urls import path
from . import views

urlpatterns = [
    path('', views.project_list, name='project-list'),
    path('add/', views.project_add, name='project-add'),
    path('<int:pk>/', views.project, name='project'),
    path('edit/<int:pk>/', views.project_edit, name='project-edit'),
    path('del/<int:pk>/', views.project_delete, name='project-delete'),
    path('<int:pk>/members/', views.members_list, name='members-list'),
    path('<int:pk>/members/add/', views.members_add, name='members-add'),
    path('<int:pk>/members/remove/<int:member_pk>/', views.members_remove, name='members-remove'),
    # path('<int:pk>/comments/', views.comments_list, name='comments-list'),
    # path('<int:pk>/comments/add/', views.members_add, name='comments-add'),
    # path('<int:pk>/comments/remove/<int:comment_pk>/', views.comments_remove, name='comments-remove'),
]
