from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import TaskSerializer
from .models import Task
from project.models import Project

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_list(request, project_id=None):

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
def task_detail(request, pk):
    try:
        task = Task.objects.get(pk=pk)
        serializer = TaskSerializer(task, context={'request': request})
        return Response(serializer.data)
    except Task.DoesNotExist:
        return Response(
            {'error': 'Task not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_add(request):
    serializer = TaskSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        task = serializer.save(created_by=request.user)
        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def task_edit(request, pk):
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
def task_delete(request, pk):
    try:
        task = Task.objects.get(pk=pk)
        task.delete()
        return Response({'success': True})
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)