"""
API views for managing comments.

This module provides API endpoints for listing, adding, and deleting comments
associated with tasks.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Comment
from task.models import Task

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def comment_list(request: object, task_id: int) -> Response:
    """
    Retrieve a list of comments for a specific task.

    Args:
        request: The HTTP request object.
        task_id (int): The ID of the task to filter comments by.

    Returns:
        Response: JSON response containing the list of comments.
    """
    comments = Comment.objects.filter(task_id=task_id)
    result = [
        {
            'id': comment.id,
            'author_id': comment.author.id,
            'author_username': comment.author.username,
            'text': comment.text,
            'created_at': comment.created_at,
            'updated_at': comment.updated_at,
        }
        for comment in comments
    ]
    return Response(result)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_add(request: object, task_id: int) -> Response:
    """
    Create a new comment for a specific task.

    Args:
        request: The HTTP request object containing comment data.
        task_id (int): The ID of the task to associate the comment with.

    Returns:
        Response: JSON response with the created comment ID or error if task not found.
    """
    try:
        task = Task.objects.get(pk=task_id)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    data = request.data
    comment = Comment.objects.create(
        task=task,
        author=request.user,
        text=data.get('text', '')
    )
    return Response({'id': comment.id}, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def comment_delete(request: object, pk: int) -> Response:
    """
    Delete a specific comment.

    Args:
        request: The HTTP request object.
        pk (int): The primary key of the comment to delete.

    Returns:
        Response: JSON response indicating success or error if permission denied or not found.
    """
    try:
        comment = Comment.objects.get(pk=pk)
        if comment.author != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response({'success': True})
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)