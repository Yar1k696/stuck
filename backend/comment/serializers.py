"""
Serializers for Comment model.

This module defines a serializer for the Comment model, including author details
and custom validation logic.
"""

from rest_framework import serializers
from .models import Comment
from core.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Comment model.

    Handles serialization and deserialization of Comment instances, including
    author details and custom validation.
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

    def validate_project(self, value: object) -> object:
        """
        Validate the project field.

        Args:
            value: The project value to validate.

        Returns:
            object: The validated project value.

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