"""
Serializers for user-related data.

This module defines serializers for user registration, login, profile data,
and user listing, including custom fields and validation logic.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.

    Handles serialization of user data, including a custom avatar URL.
    """
    avatar = serializers.SerializerMethodField()

    class Meta:
        """
        Metadata for UserSerializer.

        Defines the model and fields to serialize, all of which are read-only.
        """
        model = User
        fields = ['id', 'username', 'email', 'avatar']
        read_only_fields = fields

    def get_avatar(self, obj: User) -> str | None:
        """
        Get the absolute or relative URL of the user's avatar.

        Args:
            obj (User): The user instance.

        Returns:
            str or None: The avatar URL or None if no avatar exists.
        """
        if hasattr(obj, 'avatar') and obj.avatar:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.

    Includes password confirmation and validation for registration data.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        """
        Metadata for UserRegistrationSerializer.

        Defines the model and fields for registration, with password fields as write-only.
        """
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {
            'password': {'write_only': True},
            'password2': {'write_only': True},
            'username': {'required': True},
            'email': {'required': True},
        }

    def validate(self, data: dict) -> dict:
        """
        Validate registration data, including password match and email uniqueness.

        Args:
            data (dict): The input data to validate.

        Returns:
            dict: The validated data.

        Raises:
            serializers.ValidationError: If passwords don't match or email exists.
        """
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': _('Два поля пароля не збігаються.')})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': _('Користувач з такою електронною поштою вже існує.')})
        return data

    def create(self, validated_data: dict) -> User:
        """
        Create a new user instance.

        Args:
            validated_data (dict): The validated data for the user.

        Returns:
            User: The created user instance.
        """
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.

    Validates email and password for authentication.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, data: dict) -> dict:
        """
        Validate login credentials.

        Args:
            data (dict): The input data containing email and password.

        Returns:
            dict: The validated data with the user object.

        Raises:
            serializers.ValidationError: If credentials are invalid or missing.
        """
        email = data.get('email')
        password = data.get('password')
        if email and password:
            try:
                user = User.objects.get(email=email)
                if not user.check_password(password):
                    raise serializers.ValidationError(_('Неправильні облікові дані.'))
            except User.DoesNotExist:
                raise serializers.ValidationError(_('Неправильні облікові дані.'))
            data['user'] = user
        else:
            raise serializers.ValidationError(_('Необхідно вказати як email, так і пароль.'))
        return data

class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users.

    Includes a custom avatar URL field for user listing.
    """
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        """
        Metadata for UserListSerializer.

        Defines the model and fields to serialize, all of which are read-only.
        """
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url', 'bio', 'is_active', 'date_joined']
        read_only_fields = fields

    def get_avatar_url(self, obj: User) -> str | None:
        """
        Get the absolute or relative URL of the user's avatar.

        Args:
            obj (User): The user instance.

        Returns:
            str or None: The avatar URL or None if no avatar exists.
        """
        if obj.avatar and hasattr(obj.avatar, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None