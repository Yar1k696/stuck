from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    
    class Meta:
        app_label = 'core'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class MediaFile(models.Model):
    FILE_TYPES = [
        ('IMAGE', 'Image'),
    ]

    file = models.FileField(upload_to='task_media/%Y/%m/%d/')
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    task = models.ForeignKey(
        'task.Task',
        on_delete=models.CASCADE,
        related_name='media_files',
        null=True,
        blank=True
    )
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='uploaded_files'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'core'
    
    def __str__(self):
        return f"{self.file_type} - {self.file.name}"