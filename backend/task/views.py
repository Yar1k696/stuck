"""
API views for managing tasks.

This module provides API endpoints for listing, creating, updating, and deleting
tasks, including integration with project members.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import TaskSerializer
from .models import Task
from project.models import Project
from project.views import members_add

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_list(request: object, project_id: int | None = None) -> Response:
    """
    Retrieve a list of tasks.

    Args:
        request: The HTTP request object.
        project_id (int, optional): The ID of the project to filter tasks by.

    Returns:
        Response: JSON response containing the list of tasks.
    """
    if project_id is not None:
        try:
            project = Project.objects.get(id=project_id)
            tasks = Task.objects.filter(project=project)
        except Project.DoesNotExist:
            return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        user_id = request.query_params.get('user', None)
        if user_id:
            tasks = Task.objects.filter(created_by__id=user_id)
        else:
            tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_detail(request: object, pk: int) -> Response:
    """
    Retrieve details of a specific task.

    Args:
        request: The HTTP request object.
        pk (int): The primary key of the task.

    Returns:
        Response: JSON response containing task details or error if not found.
    """
    try:
        task = Task.objects.get(pk=pk)
        serializer = TaskSerializer(task, context={'request': request})
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_add(request: object) -> Response:
    """
    Create a new task.

    Args:
        request: The HTTP request object containing task data.

    Returns:
        Response: JSON response with the created task data or validation errors.
    """
    serializer = TaskSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        task = serializer.save(created_by=request.user)
        project_id = request.data.get('project')
        if project_id:
            try:
                project = Project.objects.get(id=project_id)
                participant_ids = request.data.get('participants', [])
                if isinstance(participant_ids, (list, tuple)):
                    for user_id in participant_ids:
                        members_add(request._request, project_id, {'user': user_id, 'role': 'MEMBER'})
            except Project.DoesNotExist:
                return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def task_edit(request: object, pk: int) -> Response:
    """
    Update an existing task.

    Args:
        request: The HTTP request object containing updated task data.
        pk (int): The primary key of the task.

    Returns:
        Response: JSON response indicating success or error if not found.
    """
    try:
        task = Task.objects.get(pk=pk)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    data = request.data
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.assigned_to_id = data.get('assigned_to_id', task.assigned_to_id)
    task.due_date = data.get('due_date', task.due_date)
    task.save()
    return Response({'success': True})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def task_delete(request: object, pk: int) -> Response:
    """
    Delete a specific task.

    Args:
        request: The HTTP request object.
        pk (int): The primary key of the task.

    Returns:
        Response: JSON response indicating success or error if not found.
    """
    try:
        task = Task.objects.get(pk=pk)
        task.delete()
        return Response({'success': True})
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)