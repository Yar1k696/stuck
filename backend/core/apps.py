"""
Configuration for the core application.

This module defines the AppConfig for the core app, specifying the default
auto field and application name.
"""

from django.apps import AppConfig

class CoreConfig(AppConfig):
    """
    Configuration class for the core application.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'