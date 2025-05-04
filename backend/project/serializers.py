from rest_framework import serializers
from .models import Project, ProjectMember, User
from comment.models import Comment

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'avatar']

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role = serializers.CharField(source='get_role_display')

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role']

class ProjectSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    members = ProjectMemberSerializer(many=True, source='projectmember_set')

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
            'members'
        ]

    def get_created_by(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username
            }
        return None

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            member = ProjectMember.objects.filter(
                project=obj,
                user=request.user
            ).first()
            return member.role if member else None
        return None

    def get_members_count(self, obj):
        return obj.members.count()

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