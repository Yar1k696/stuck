from django.urls import path
from . import views

urlpatterns = [
    path('', views.task_list, name='task-list'),
    path('<int:pk>', views.task_detail, name='task'),
    path('add/', views.task_add, name='task-add'),
    path('edit/<int:pk>/', views.task_edit, name='task-edit'),
    path('del/<int:pk>/', views.task_delete, name='task-delete'),
    path('by-project/<int:project_id>/', views.task_list, name='task-list-by-project'),
]
