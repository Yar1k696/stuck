"""
Models for the task application.

This module defines the Task model, representing tasks with statuses and
associations to projects and users.
"""

from django.db import models

class Task(models.Model):
    """
    Model representing a task.

    Includes fields for task description, project assignment, creator, assignee,
    status, due date, and timestamps.
    """
    STATUS_CHOICES = [
        ('TODO', 'Готові до виконання'),
        ('IN_PROGRESS', 'В процесі'),
        ('NEEDS_REVIEW', 'Потребують перевірки'),
        ('DONE', 'Виконано'),
    ]

    description = models.TextField()
    project = models.ForeignKey(
        'project.Project',
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='created_tasks'
    )
    assigned_to = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='TODO'
    )
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        """
        Return a string representation of the task.

        Returns:
            str: The project name associated with the task.
        """
        return f"({self.project})"