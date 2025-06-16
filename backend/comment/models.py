"""
Models for the comment application.

This module defines the Comment model, representing comments associated with
projects and authored by users.
"""

from django.db import models
from core.models import User

class Comment(models.Model):
    """
    Model representing a comment.

    Includes fields for project association, author, text, and timestamps with
    ordering by creation date in descending order.
    """
    project = models.ForeignKey(
        'project.Project',
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """
        Metadata for Comment model.

        Defines ordering of comments by creation date in descending order.
        """
        ordering = ['-created_at']

    def __str__(self) -> str:
        """
        Return a string representation of the comment.

        Returns:
            str: The comment author and project title.
        """
        return f"Comment by {self.author.username} on {self.project.title}"