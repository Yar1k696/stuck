"""
Serializers for project, project members, and comments.

This module defines serializers for the Project, ProjectMember, and Comment models,
including nested representations and custom fields.
"""

from rest_framework import serializers
from .models import Project, ProjectMember, User
from comment.models import Comment

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user data.

    Handles serialization of user fields for nested use in other serializers.
    """
    class Meta:
        """
        Metadata for UserSerializer.

        Defines the model and fields to serialize.
        """
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'avatar']

class ProjectMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for project member data.

    Includes nested user data and human-readable role display.
    """
    user = UserSerializer(read_only=True)
    role = serializers.CharField(source='get_role_display')

    class Meta:
        """
        Metadata for ProjectMemberSerializer.

        Defines the model and fields to serialize.
        """
        model = ProjectMember
        fields = ['id', 'user', 'role']

class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for project data.

    Includes custom fields for creator details, user role, member count, and nested members.
    """
    created_by = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    members = ProjectMemberSerializer(many=True, source='projectmember_set')

    class Meta:
        """
        Metadata for ProjectSerializer.

        Defines the model and fields to serialize.
        """
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
            'members'
        ]

    def get_created_by(self, obj: Project) -> dict | None:
        """
        Get the creator's ID and username.

        Args:
            obj (Project): The project instance.

        Returns:
            dict or None: Dictionary with creator's ID and username, or None if no creator.
        """
        if obj.created_by:
            return {'id': obj.created_by.id, 'username': obj.created_by.username}
        return None

    def get_user_role(self, obj: Project) -> str | None:
        """
        Get the role of the requesting user in the project.

        Args:
            obj (Project): The project instance.

        Returns:
            str or None: The user's role or None if not a member.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = ProjectMember.objects.filter(project=obj, user=request.user).first()
            return member.role if member else None
        return None

    def get_members_count(self, obj: Project) -> int:
        """
        Get the number of members in the project.

        Args:
            obj (Project): The project instance.

        Returns:
            int: The count of project members.
        """
        return obj.members.count()

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for comment data.

    Includes nested author data and validation for project and text fields.
    """
    author = UserSerializer(read_only=True)

    class Meta:
        """
        Metadata for CommentSerializer.

        Defines the model and fields to serialize, including read-only fields.
        """
        model = Comment
        fields = ['id', 'project', 'author', 'text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data: dict) -> Comment:
        """
        Create a new comment instance.

        Args:
            validated_data (dict): Validated data for the comment.

        Returns:
            Comment: The created comment instance.
        """
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)

    def validate_project(self, value: Project) -> Project:
        """
        Validate the project field.

        Args:
            value (Project): The project value to validate.

        Returns:
            Project: The validated project value.

        Raises:
            serializers.ValidationError: If the project ID is missing.
        """
        if not value:
            raise serializers.ValidationError("Project ID is required")
        return value

    def validate_text(self, value: str) -> str:
        """
        Validate the text field.

        Args:
            value (str): The text value to validate.

        Returns:
            str: The validated text value.

        Raises:
            serializers.ValidationError: If the text is empty or only whitespace.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Comment text cannot be empty")
        return value