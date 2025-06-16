"""
Serializers for Task model.

This module defines a serializer for the Task model, handling data validation
and conversion between model instances and JSON representations.
"""

from rest_framework import serializers
from .models import Task
from project.models import Project
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for the Task model.

    Handles serialization and deserialization of Task instances, including
    project and user assignments with optional fields.
    """
    project: serializers.PrimaryKeyRelatedField = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        allow_null=True,
        required=False
    )
    assigned_to: serializers.PrimaryKeyRelatedField = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False
    )
    created_by: serializers.PrimaryKeyRelatedField = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        """
        Metadata for TaskSerializer.

        Defines the model and fields to serialize, including read-only fields.
        """
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