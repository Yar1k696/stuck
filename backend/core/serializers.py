# core/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar']
        read_only_fields = fields

    def get_avatar(self, obj):
        if hasattr(obj, 'avatar') and obj.avatar:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Серіалізатор для реєстрації нових користувачів.
    Включає перевірку співпадіння паролів.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

        extra_kwargs = {
            'password': {'write_only': True},
            'password2': {'write_only': True},
            'username': {'required': True},
            'email': {'required': True},
        }

    def validate(self, data):

        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': _('Два поля пароля не збігаються.')})

        if User.objects.filter(email=data['email']).exists():
             raise serializers.ValidationError({'email': _('Користувач з такою електронною поштою вже існує.')})

        return data

    def create(self, validated_data):

        validated_data.pop('password2')

        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, data):
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
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                 'avatar_url', 'bio', 'is_active', 'date_joined']
        read_only_fields = fields

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None