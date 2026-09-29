from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.audit.models import AuditLog
from apps.audit.serializers import AuditLogSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.filter(is_deleted=False).select_related('user', 'user__role').order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        module = self.request.query_params.get('module')
        if module:
            qs = qs.filter(module__iexact=module)
        action_param = self.request.query_params.get('action')
        if action_param:
            qs = qs.filter(action__iexact=action_param)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(description__icontains=search)
        return qs

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        total_count = AuditLog.objects.filter(is_deleted=False).count()
        actions = {}
        for row in AuditLog.objects.filter(is_deleted=False).values('action'):
            act = row['action']
            actions[act] = actions.get(act, 0) + 1

        modules = {}
        for row in AuditLog.objects.filter(is_deleted=False).values('module'):
            mod = row['module']
            modules[mod] = modules.get(mod, 0) + 1

        return Response({
            'total_logs': total_count,
            'actions': actions,
            'modules': modules
        })
