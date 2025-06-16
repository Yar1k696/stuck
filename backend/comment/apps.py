"""
Configuration for the comment application.

This module defines the AppConfig for the comment app, specifying the default
auto field and application name.
"""

from django.apps import AppConfig

class CommentConfig(AppConfig):
    """
    Configuration class for the comment application.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'comment'