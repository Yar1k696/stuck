"""
Models for the core application.

This module defines the User model (extending AbstractUser) and the MediaFile
model for storing user avatars and task-related media files.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Model representing a user, extending AbstractUser.

    Includes additional fields for avatar and bio.
    """
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)

    class Meta:
        """
        Metadata for User model.

        Defines the application label and verbose names.
        """
        app_label = 'core'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

class MediaFile(models.Model):
    """
    Model representing a media file associated with tasks.

    Includes file type, task association, and upload details.
    """
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
        """
        Metadata for MediaFile model.

        Defines the application label.
        """
        app_label = 'core'

    def __str__(self) -> str:
        """
        Return a string representation of the media file.

        Returns:
            str: The file type and name.
        """
        return f"{self.file_type} - {self.file.name}"