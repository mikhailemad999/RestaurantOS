"""
RestaurantOS — RBAC Permission Engine
DRF permission classes that check user role permissions against required codenames.
"""
from rest_framework.permissions import BasePermission


class HasPermission(BasePermission):
    """
    Check if the authenticated user's role has ALL the required permissions.

    Usage in views:
        permission_classes = [IsAuthenticated, HasPermission]
        required_permissions = ['orders.create', 'orders.view']
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Owner role has all permissions
        if hasattr(user, 'role') and user.role and user.role.name == 'Owner':
            return True

        # Get required permissions from the view
        required_permissions = getattr(view, 'required_permissions', [])

        if not required_permissions:
            return True  # No specific permission required

        # Get user's permission codenames
        if not hasattr(user, 'role') or not user.role:
            return False

        user_permissions = set(
            user.role.permissions.values_list('codename', flat=True)
        )

        return all(perm in user_permissions for perm in required_permissions)


class IsOwnerRole(BasePermission):
    """Only allow users with the Owner role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'role')
            and request.user.role
            and request.user.role.name == 'Owner'
        )


class IsManagerOrOwner(BasePermission):
    """Allow users with Manager or Owner role."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if not hasattr(request.user, 'role') or not request.user.role:
            return False

        return request.user.role.name in ('Owner', 'Manager')


class IsSameUserOrManager(BasePermission):
    """
    Allow users to access their own data, or managers/owners to access anyone's.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Check if the object belongs to the user
        if hasattr(obj, 'user_id') and obj.user_id == user.id:
            return True
        if hasattr(obj, 'id') and obj.id == user.id:
            return True

        # Manager or Owner can access anyone's data
        if hasattr(user, 'role') and user.role:
            return user.role.name in ('Owner', 'Manager')

        return False
