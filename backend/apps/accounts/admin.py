from django.contrib import admin
from .models import User, Role, Permission


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'role', 'branch', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'branch']
    search_fields = ['email', 'full_name', 'phone']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_login']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_system', 'is_custom', 'created_at']
    filter_horizontal = ['permissions']


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['codename', 'name', 'module']
    list_filter = ['module']
    search_fields = ['codename', 'name']
