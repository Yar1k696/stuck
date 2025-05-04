from django.urls import path
from . import views

urlpatterns = [
    path('<int:task_id>/', views.comment_list, name='comment-list'),
    path('<int:task_id>/add/', views.comment_add, name='comment-add'),
    path('del/<int:pk>/', views.comment_delete, name='comment-delete'),
]
