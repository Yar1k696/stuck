from django.contrib.auth import get_user_model
from django.core.files import File
from django.utils import timezone
import os
import datetime

# Получение модели пользователя
User = get_user_model()

# Путь к тестовым аватарам
avatar_path = 'media/avatars/'

test_users = [
    {
        "model": "core.User",
        "pk": 1,
        "fields": {
            "username": "ivan_pidpryiemets",
            "first_name": "Іван",
            "last_name": "Підприємець",
            "email": "ivan.pidpryiemets@example.com",
            "password": "password123",
            "is_superuser": False,
            "is_staff": False,
            "is_active": True,
            "date_joined": "2025-05-02T12:00:00Z",
            "last_login": None,
            "bio": "Розробник програмного забезпечення, захоплюється відкритими проєктами.",
            "avatar": "2.png"
        }
    },
    {
        "model": "core.User",
        "pk": 2,
        "fields": {
            "username": "olena_kovalenko",
            "first_name": "Олена",
            "last_name": "Коваленко",
            "email": "olena.kovalenko@example.com",
            "password": "password123",
            "is_superuser": False,
            "is_staff": True,
            "is_active": True,
            "date_joined": "2025-05-02T12:00:00Z",
            "last_login": None,
            "bio": "Менеджер проєктів з досвідом роботи 5 років.",
            "avatar": "avatars/3.png"
        }
    },
    {
        "model": "core.User",
        "pk": 3,
        "fields": {
            "username": "admin_mykhailo",
            "first_name": "Михайло",
            "last_name": "Шевченко",
            "email": "mykhailo.shevchenko@example.com",
            "password": "admin123",
            "is_superuser": True,
            "is_staff": True,
            "is_active": True,
            "date_joined": "2025-05-02T12:00:00Z",
            "last_login": None,
            "bio": "Системний адміністратор.",
            "avatar": "4.png"
        }
    },
    {
        "model": "core.User",
        "pk": 4,
        "fields": {
            "username": "sofia_melnyk",
            "first_name": "Софія",
            "last_name": "Мельник",
            "email": "sofia.melnyk@example.com",
            "password": "password123",
            "is_superuser": False,
            "is_staff": False,
            "is_active": True,
            "date_joined": "2025-05-02T12:00:00Z",
            "last_login": None,
            "bio": "Дизайнер інтерфейсів користувача.",
            "avatar": "5.png"
        }
    },
    {
        "model": "core.User",
        "pk": 5,
        "fields": {
            "username": "petro_bondarenko",
            "first_name": "Петро",
            "last_name": "Бондаренко",
            "email": "petro.bondarenko@example.com",
            "password": "password123",
            "is_superuser": False,
            "is_staff": False,
            "is_active": False,
            "date_joined": "2025-05-02T12:00:00Z",
            "last_login": None,
            "bio": "Неактивний акаунт для тестування.",
            "avatar": "6.png"
        }
    }
]

for user_data in test_users:
    fields = user_data['fields']
    if not User.objects.filter(username=fields['username']).exists():
        user = User.objects.create(
            username=fields['username'],
            first_name=fields['first_name'],
            last_name=fields['last_name'],
            email=fields['email'],
            is_superuser=fields['is_superuser'],
            is_staff=fields['is_staff'],
            is_active=fields['is_active'],
            bio=fields['bio'],
            date_joined=timezone.make_aware(
                datetime.datetime.strptime(fields['date_joined'], '%Y-%m-%dT%H:%M:%SZ')
            ),
        )
        user.set_password(fields['password'])
        if fields['avatar']:
            avatar_file_path = os.path.join(avatar_path, fields['avatar'])
            if os.path.exists(avatar_file_path):
                with open(avatar_file_path, 'rb') as f:
                    user.avatar.save(fields['avatar'], File(f), save=True)
            else:
                print(f"Avatar file not found: {avatar_file_path}")
        user.save()
        print(f"Створено користувача: {user.username}")
    else:
        print(f"Користувач {fields['username']} вже існує")