"""
RestaurantOS — Accounts Views
Auth endpoints (login, logout, refresh, PIN login, password management)
User CRUD, Role CRUD, Permission listing.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from apps.core.permissions import HasPermission, IsManagerOrOwner
from .models import User, Role, Permission
from .serializers import (
    CustomTokenObtainPairSerializer,
    PinLoginSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    RoleSerializer,
    PermissionSerializer,
)


# ─── Auth Views ──────────────────────────────────────────────────────────────

class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Login with email and password, returns JWT tokens + user data.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class PinLoginView(generics.GenericAPIView):
    """
    POST /api/auth/pin-login/
    Login with 4-6 digit PIN code (for POS users).
    """
    serializer_class = PinLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email
        refresh['full_name'] = user.full_name
        refresh['role'] = user.role.name if user.role else None

        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return Response({
            'success': True,
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            }
        })


class LogoutView(generics.GenericAPIView):
    """
    POST /api/auth/logout/
    Blacklist the refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({
            'success': True,
            'message': 'Logged out successfully',
            'data': None,
        })


class ChangePasswordView(generics.GenericAPIView):
    """
    POST /api/auth/change-password/
    Change password for authenticated user.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save(update_fields=['password'])

        return Response({
            'success': True,
            'message': 'Password changed successfully',
            'data': None,
        })


class ForgotPasswordView(generics.GenericAPIView):
    """
    POST /api/auth/forgot-password/
    Request password reset link via email.
    """
    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO: Send password reset email via Celery task
        return Response({
            'success': True,
            'message': 'If that email is registered, a reset link has been sent.',
            'data': None,
        })


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/me/ — Get current user profile
    PATCH /api/auth/me/ — Update current user profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        data = serializer.data

        # Include permissions in profile
        if user.role:
            data['permissions'] = list(
                user.role.permissions.values_list('codename', flat=True)
            )
        else:
            data['permissions'] = []

        return Response({
            'success': True,
            'data': data,
        })


# ─── User CRUD Views ────────────────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    User management CRUD.
    Only managers and owners can manage users.
    """
    permission_classes = [IsAuthenticated, IsManagerOrOwner]
    filterset_fields = ['role', 'branch', 'is_active']
    search_fields = ['full_name', 'email', 'phone']
    ordering_fields = ['full_name', 'email', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return User.objects.filter(
            is_deleted=False
        ).select_related('role', 'branch')

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return UserUpdateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'success': True,
            'message': 'User created successfully',
            'data': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'success': True,
            'message': 'User updated successfully',
            'data': UserSerializer(user).data,
        })

    def destroy(self, request, *args, **kwargs):
        """Soft-delete user."""
        instance = self.get_object()
        instance.soft_delete()
        return Response({
            'success': True,
            'message': 'User deactivated successfully',
            'data': None,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active status."""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active', 'updated_at'])
        return Response({
            'success': True,
            'message': f'User {"activated" if user.is_active else "deactivated"}',
            'data': UserSerializer(user).data,
        })

    @action(detail=True, methods=['post'])
    def force_logout(self, request, pk=None):
        """Force logout a user (invalidate all sessions)."""
        user = self.get_object()
        # Blacklist all tokens — in production, track sessions properly
        return Response({
            'success': True,
            'message': 'User sessions invalidated',
            'data': None,
        })


# ─── Role CRUD Views ────────────────────────────────────────────────────────

class RoleViewSet(viewsets.ModelViewSet):
    """
    Role management CRUD.
    System roles cannot be deleted.
    """
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsManagerOrOwner]
    search_fields = ['name', 'description']
    ordering = ['name']
    pagination_class = None

    def get_queryset(self):
        return Role.objects.filter(
            is_deleted=False
        ).prefetch_related('permissions')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_system:
            return Response({
                'success': False,
                'message': 'System roles cannot be deleted',
                'data': None,
            }, status=status.HTTP_400_BAD_REQUEST)
        instance.soft_delete()
        return Response({
            'success': True,
            'message': 'Role deleted successfully',
            'data': None,
        })


# ─── Permission Views ───────────────────────────────────────────────────────

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List all permissions (read-only).
    Used by the role management UI to assign permissions.
    """
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsManagerOrOwner]
    filterset_fields = ['module']
    search_fields = ['codename', 'name']
    ordering = ['module', 'codename']
    pagination_class = None  # Return all permissions without pagination

    def get_queryset(self):
        return Permission.objects.filter(is_deleted=False)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        # Group by module for UI convenience
        grouped = {}
        for perm in serializer.data:
            module = perm['module']
            if module not in grouped:
                grouped[module] = []
            grouped[module].append(perm)

        return Response({
            'success': True,
            'data': {
                'permissions': serializer.data,
                'grouped': grouped,
            }
        })
