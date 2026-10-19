"""
Authorization & Permissions for UNBUmi Detector.
Enforces authenticated access, role authorization, and object-level case isolation.
"""

from rest_framework import permissions
from django.conf import settings

class IsCaseAuthorized(permissions.BasePermission):
    """
    Object-level permission allowing access if:
    1. DEMO_MODE is True (development / evaluation sandbox), OR
    2. User is authenticated staff/superuser, OR
    3. User is assigned reviewer, supervisor, or creator of the case.
    In production (DEMO_MODE=False), anonymous users cannot access private case/report data.
    """

    def has_permission(self, request, view):
        if getattr(settings, 'DEMO_MODE', False):
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Retrieve target case
        case = getattr(obj, 'case', obj)

        if getattr(settings, 'DEMO_MODE', False):
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        # Staff or superuser has full access
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Check user profile role
        profile = getattr(request.user, 'profile', None)
        role = profile.role if profile else ''

        if role in ('reviewer', 'supervisor', 'admin', 'demo_reviewer', 'demo_supervisor', 'demo_admin'):
            return True

        # Check creator / assigned
        if case and hasattr(case, 'created_by') and case.created_by == request.user:
            return True
        if case and hasattr(case, 'assigned_to') and case.assigned_to == request.user:
            return True

        return False
