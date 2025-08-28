"""
API views for managing projects and members.

This module provides API endpoints for listing, creating, updating, and deleting
projects, and managing project members.
"""

from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_list(request: object) -> Response:
    """Retrieve a list of projects, filtered by user if specified."""
    user_id = request.query_params.get('user')
    queryset = Project.objects.all()
    if user_id:
        queryset = queryset.filter(
            Q(created_by_id=user_id) | Q(projectmember__user_id=user_id)
        ).distinct()
    else:
        queryset = queryset.filter(
            Q(created_by=request.user) | Q(projectmember__user=request.user)
        ).distinct()
    queryset = queryset.select_related('created_by').prefetch_related('members')
    serializer = ProjectSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project(request: object, pk: int) -> Response:
    """Retrieve details of a specific project."""
    try:
        project = Project.objects.get(pk=pk)
        serializer = ProjectSerializer(project, context={'request': request})
        return Response(serializer.data)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def project_add(request: object) -> Response:
    """Create a new project."""
    data = request.data
    if not data.get('title'):
        return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
    project = Project.objects.create(
        title=data.get('title'),
        description=data.get('description', ''),
        created_by=request.user
    )
    return Response({'id': project.id}, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def project_edit(request: object, pk: int) -> Response:
    """Update an existing project."""
    try:
        project = Project.objects.get(pk=pk)
        if project.created_by != request.user:
            return Response({'error': 'You do not have permission to edit this project'},
                            status=status.HTTP_403_FORBIDDEN)
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    project.title = data.get('title', project.title)
    project.description = data.get('description', project.description)
    project.save()
    return Response({'success': True})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def project_delete(request: object, pk: int) -> Response:
    """Delete a specific project."""
    try:
        project = Project.objects.get(pk=pk)
        if project.created_by != request.user:
            return Response({'error': 'You do not have permission to delete this project'},
                            status=status.HTTP_403_FORBIDDEN)

        project.delete()
        return Response({'success': True})
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def members_list(request: object, pk: int) -> Response:
    """Retrieve a list of members for a specific project."""
    try:
        project = Project.objects.get(pk=pk)
        members = project.projectmember_set.all()
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def members_add(request: object, pk: int) -> Response:
    """Add a new member to a project."""
    try:
        project = Project.objects.get(pk=pk)
        data = request.data
        if not data.get('user') or not data.get('role'):
            return Response({"error": "User ID and role are required"}, status=status.HTTP_400_BAD_REQUEST)

        user_id = data.get('user')
        role = data.get('role')

        if ProjectMember.objects.filter(project=project, user_id=user_id).exists():
            return Response({"error": "User is already a member of this project"}, status=status.HTTP_400_BAD_REQUEST)

        if role not in dict(ProjectMember.ROLE_CHOICES).keys():
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)

        ProjectMember.objects.create(project=project, user_id=user_id, role=role)
        members = project.projectmember_set.all()
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def members_remove(request: object, pk: int, member_pk: int) -> Response:
    """Remove a member from a project."""
    try:
        project = Project.objects.get(pk=pk)
        member = ProjectMember.objects.get(pk=member_pk, project=project)
        if project.created_by != request.user and member.role != 'OWNER':
            return Response({"error": "You do not have permission to remove this member"},
                            status=status.HTTP_403_FORBIDDEN)
        member.delete()
        members = project.projectmember_set.all()
        serializer = ProjectMemberSerializer(members, many=True)
        return Response(serializer.data)
    except Project.DoesNotExist:
        return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
    except ProjectMember.DoesNotExist:
        return Response({"error": "Member not found"}, status=status.HTTP_404_NOT_FOUND)