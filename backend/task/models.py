from django.db import models

class Task(models.Model):
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

    def __str__(self):
        return f"({self.project})"