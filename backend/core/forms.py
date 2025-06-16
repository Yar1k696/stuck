"""
Forms for user profile management.

This module defines a form for updating a user's avatar based on the User model.
"""

from django import forms
from .models import User

class UserAvatarForm(forms.ModelForm):
    """
    Form for updating a user's avatar.

    Allows users to upload and update their avatar image.
    """
    class Meta:
        """
        Metadata for UserAvatarForm.

        Defines the model and fields to include in the form.
        """
        model = User
        fields = ['avatar']