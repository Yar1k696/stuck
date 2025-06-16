"""
Configuration for the task application.

This module defines the AppConfig for the task app, specifying the default
auto field and application name.
"""

from django.apps import AppConfig

class TaskConfig(AppConfig):
    """
    Configuration class for the task application.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'task'