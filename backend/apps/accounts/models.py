"""
RestaurantOS — Accounts Models
Custom User model with UUID, Role-based access control, and Permission system.
"""
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone
from apps.core.models import BaseModel


class Permission(BaseModel):
    """
    Granular permission that can be assigned to roles.
    Permissions are organized by module (e.g. 'orders.create', 'menu.edit').
    """
    codename = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    module = models.CharField(max_length=50, db_index=True)
    description = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['module', 'codename']
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'

    def __str__(self):
        return f'{self.module}.{self.codename}'


class Role(BaseModel):
    """
    Role with a set of permissions.
    System roles (Owner, Manager, etc.) cannot be deleted.
    Custom roles can be created by managers.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    is_system = models.BooleanField(default=False)
    is_custom = models.BooleanField(default=False)
    permissions = models.ManyToManyField(
        Permission,
        related_name='roles',
        blank=True,
    )

    class Meta:
        ordering = ['name']
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    """Custom user manager supporting email-based authentication."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    """
    Custom User model with UUID primary key.
    Supports email login and PIN-based POS login.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    full_name = models.CharField(max_length=200)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # POS PIN login (4-6 digits)
    pin_code = models.CharField(max_length=6, blank=True, default='')

    # Role-based access
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
    )

    # Branch assignment
    branch = models.ForeignKey(
        'restaurant.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='staff',
    )

    # Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Security
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f'{self.full_name} ({self.email})'

    @property
    def is_locked(self):
        """Check if the account is currently locked."""
        if self.locked_until and self.locked_until > timezone.now():
            return True
        return False

    def increment_failed_login(self):
        """Increment failed login counter and lock if threshold exceeded."""
        from django.conf import settings
        self.failed_login_attempts += 1
        max_attempts = getattr(settings, 'ACCOUNT_MAX_FAILED_ATTEMPTS', 5)
        lockout_minutes = getattr(settings, 'ACCOUNT_LOCKOUT_DURATION_MINUTES', 30)

        if self.failed_login_attempts >= max_attempts:
            self.locked_until = timezone.now() + timezone.timedelta(minutes=lockout_minutes)

        self.save(update_fields=['failed_login_attempts', 'locked_until'])

    def reset_failed_login(self):
        """Reset failed login counter after successful login."""
        self.failed_login_attempts = 0
        self.locked_until = None
        self.save(update_fields=['failed_login_attempts', 'locked_until'])

    def has_perm(self, perm, obj=None):
        """Check if user has a specific permission."""
        if self.is_superuser:
            return True
        if self.role and self.role.name == 'Owner':
            return True
        if self.role:
            return self.role.permissions.filter(codename=perm).exists()
        return False

    def has_module_perms(self, app_label):
        return self.is_superuser or self.is_staff

    def soft_delete(self):
        """Soft-delete user."""
        self.is_deleted = True
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'is_active', 'deleted_at', 'updated_at'])
