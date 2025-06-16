"""
URL configuration for the project application.

This module defines URL patterns for managing projects and their members.
"""

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
]