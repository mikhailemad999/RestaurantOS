"""
RestaurantOS — Accounts Serializers
JWT auth, user CRUD, role management, permission listing.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, Role, Permission


# ─── Permission Serializers ──────────────────────────────────────────────────

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name', 'module', 'description']
        read_only_fields = ['id']


class PermissionMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name', 'module']


# ─── Role Serializers ────────────────────────────────────────────────────────

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionMinimalSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        write_only=True,
        source='permissions',
        required=False,
    )
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'description', 'is_system', 'is_custom',
            'permissions', 'permission_ids', 'user_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'is_system', 'created_at', 'updated_at']

    def get_user_count(self, obj):
        return obj.users.filter(is_deleted=False, is_active=True).count()

    def create(self, validated_data):
        permissions = validated_data.pop('permissions', [])
        role = Role.objects.create(is_custom=True, **validated_data)
        if permissions:
            role.permissions.set(permissions)
        return role

    def update(self, instance, validated_data):
        permissions = validated_data.pop('permissions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if permissions is not None:
            instance.permissions.set(permissions)
        return instance


class RoleMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


# ─── User Serializers ────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    role = RoleMinimalSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        write_only=True,
        source='role',
        required=False,
    )
    branch_name = serializers.CharField(source='branch.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'full_name', 'avatar',
            'pin_code', 'role', 'role_id', 'branch', 'branch_name',
            'is_active', 'last_login', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {
            'pin_code': {'write_only': True},
        }


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='role',
    )

    class Meta:
        model = User
        fields = [
            'email', 'phone', 'full_name', 'password',
            'pin_code', 'role_id', 'branch', 'is_active',
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='role',
        required=False,
    )

    class Meta:
        model = User
        fields = [
            'email', 'phone', 'full_name', 'avatar',
            'pin_code', 'role_id', 'branch', 'is_active',
        ]
        extra_kwargs = {
            'email': {'required': False},
            'full_name': {'required': False},
        }


# ─── Auth Serializers ────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT login with additional user data in response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['full_name'] = user.full_name
        token['role'] = user.role.name if user.role else None
        return token

    def validate(self, attrs):
        # Check if account is locked
        try:
            user = User.objects.get(email=attrs.get('email', ''))
            if user.is_locked:
                raise serializers.ValidationError(
                    'Account is locked. Please try again later or contact your manager.'
                )
        except User.DoesNotExist:
            pass

        try:
            data = super().validate(attrs)
        except Exception:
            # Increment failed login on failure
            try:
                user = User.objects.get(email=attrs.get('email', ''))
                user.increment_failed_login()
            except User.DoesNotExist:
                pass
            raise

        # Reset failed login on success
        self.user.reset_failed_login()

        # Add user info to response
        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'full_name': self.user.full_name,
            'phone': self.user.phone,
            'avatar': self.user.avatar.url if self.user.avatar else None,
            'role': {
                'id': str(self.user.role.id),
                'name': self.user.role.name,
            } if self.user.role else None,
            'branch': {
                'id': str(self.user.branch.id),
                'name': self.user.branch.name,
            } if self.user.branch else None,
            'permissions': list(
                self.user.role.permissions.values_list('codename', flat=True)
            ) if self.user.role else [],
        }
        return data


class PinLoginSerializer(serializers.Serializer):
    """Login with PIN code (for POS users)."""
    pin_code = serializers.CharField(min_length=4, max_length=6)

    def validate_pin_code(self, value):
        try:
            user = User.objects.get(pin_code=value, is_active=True, is_deleted=False)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid PIN code')
        except User.MultipleObjectsReturned:
            raise serializers.ValidationError('PIN code conflict. Contact your manager.')

        if user.is_locked:
            raise serializers.ValidationError('Account is locked')

        self.user = user
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Change password for authenticated user."""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect')
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    """Request password reset via email."""
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            # Don't reveal if email exists or not
            pass
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Reset password with token."""
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
