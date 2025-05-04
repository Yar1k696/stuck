from rest_framework import serializers
from .models import Comment
from core.serializers import UserSerializer  # Предполагается, что UserSerializer в core

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'project', 'author', 'text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['author'] = request.user
        return super().create(validated_data)

    def validate_project(self, value):
        if not value:
            raise serializers.ValidationError("Project ID is required")
        return value

    def validate_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Comment text cannot be empty")
        return value