"""
Configuration for the project application.

This module defines the AppConfig for the project app, specifying the default
auto field and application name.
"""

from django.apps import AppConfig

class ProjectConfig(AppConfig):
    """
    Configuration class for the project application.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'project'