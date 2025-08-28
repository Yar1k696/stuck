"""
Serializers for project and project members.

This module defines serializers for the Project, ProjectMember, and Task models,
including nested representations and custom fields.
"""

from rest_framework import serializers
from .models import Project, ProjectMember, User  # Импорт из project.models
from task.models import Task  # Импорт Task из task.models

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data."""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'avatar']


class ProjectMemberSerializer(serializers.ModelSerializer):
    """Serializer for project member data."""
    user = UserSerializer(read_only=True)
    role = serializers.CharField(source='get_role_display')

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role']


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for task data."""
    assigned_to = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'description', 'project', 'status', 'assigned_to', 'created_by', 'due_date', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for project data.

    Includes custom fields for creator details, user role, member count,
    nested members, and executors (unique assigned_to users from tasks).
    """
    created_by = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    members = ProjectMemberSerializer(many=True, source='projectmember_set')
    executors = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'created_by',
            'created_at',
            'updated_at',
            'user_role',
            'members_count',
            'members',
            'executors'
        ]

    def get_created_by(self, obj: Project) -> dict | None:
        if obj.created_by:
            return {'id': obj.created_by.id, 'username': obj.created_by.username}
        return None

    def get_user_role(self, obj: Project) -> str | None:
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = ProjectMember.objects.filter(project=obj, user=request.user).first()
            return member.role if member else None
        return None

    def get_members_count(self, obj: Project) -> int:
        return obj.members.count()

    def get_executors(self, obj: Project) -> list:
        """Return a list of unique users assigned to tasks of the project."""
        assigned_users = Task.objects.filter(project=obj).values_list('assigned_to_id', flat=True).distinct()
        users = User.objects.filter(id__in=assigned_users).exclude(id__isnull=True)
        return UserSerializer(users, many=True).data