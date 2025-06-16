"""
Models for the project application.

This module defines the Project and ProjectMember models, representing projects
and their associated members with roles.
"""

from django.db import models
from core.models import User

class Project(models.Model):
    """
    Model representing a project.

    Includes fields for title, description, creator, members, and timestamps.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_projects'
    )
    members = models.ManyToManyField(
        User,
        related_name='projects',
        through='ProjectMember'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        """
        Return a string representation of the project.

        Returns:
            str: The project title.
        """
        return self.title

class ProjectMember(models.Model):
    """
    Model representing a project member.

    Defines the relationship between a user and a project with a specific role.
    """
    ROLE_CHOICES = [
        ('OWNER', 'Owner'),
        ('ADMIN', 'Admin'),
        ('MEMBER', 'Member'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """
        Metadata for ProjectMember model.

        Ensures unique user-project combinations and defines verbose names.
        """
        unique_together = ('user', 'project')
        verbose_name = 'Project Member'
        verbose_name_plural = 'Project Members'

    def __str__(self) -> str:
        """
        Return a string representation of the project member.

        Returns:
            str: The username, project title, and role.
        """
        return f"{self.user.username} - {self.project.title} ({self.role})"