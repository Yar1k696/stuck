from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Comment
from task.models import Task

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def comment_list(request, task_id):
    comments = Comment.objects.filter(task_id=task_id)
    result = []
    for comment in comments:
        result.append({
            'id': comment.id,
            'author_id': comment.author.id,
            'author_username': comment.author.username,
            'text': comment.text,
            'created_at': comment.created_at,
            'updated_at': comment.updated_at,
        })
    return Response(result)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def comment_add(request, task_id):
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
def comment_delete(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
        if comment.author != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response({'success': True})
    except Comment.DoesNotExist:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
