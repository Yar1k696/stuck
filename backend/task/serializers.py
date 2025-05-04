from rest_framework import serializers
from .models import Task
from project.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        allow_null=True,
        required=False
    )
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False
    )
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'description',
            'project',
            'status',
            'assigned_to',
            'created_by',
            'due_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ('created_at', 'updated_at', 'created_by')