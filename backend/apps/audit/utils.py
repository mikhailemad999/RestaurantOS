from apps.audit.models import AuditLog

def log_action(user, action, module, description, ip_address=None, metadata=None):
    try:
        AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            module=module,
            description=description,
            ip_address=ip_address,
            metadata=metadata or {}
        )
    except Exception:
        pass
