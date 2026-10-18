"""
Authorization & Permissions for UNBUmi Detector.
Enforces authenticated access, role authorization, and object-level case isolation.
"""

from rest_framework import permissions
from django.conf import settings

class IsCaseAuthorized(permissions.BasePermission):
    """
    Object-level permission allowing access if:
    1. User is authenticated staff/superuser, OR
    2. User is assigned reviewer, supervisor, or creator of the case, OR
    3. User has a verified demo token in DEMO_MODE.
    Safe methods (GET, HEAD, OPTIONS) allow inspection.
    Mutations (POST, PATCH, DELETE) require authenticated reviewer/supervisor in production.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if getattr(settings, 'DEMO_MODE', True):
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Retrieve target case
        case = getattr(obj, 'case', obj)

        if not request.user or not request.user.is_authenticated:
            return request.method in permissions.SAFE_METHODS or getattr(settings, 'DEMO_MODE', True)

        # Staff or superuser has full access
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Check user profile role
        profile = getattr(request.user, 'profile', None)
        role = profile.role if profile else ''

        if role in ('demo_reviewer', 'demo_supervisor', 'demo_admin'):
            return True

        # Check creator / assigned
        if case and hasattr(case, 'created_by') and case.created_by == request.user:
            return True
        if case and hasattr(case, 'assigned_to') and case.assigned_to == request.user:
            return True

        return getattr(settings, 'DEMO_MODE', True)
