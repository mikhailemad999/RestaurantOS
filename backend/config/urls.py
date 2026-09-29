"""
RestaurantOS — Root URL Configuration
All API endpoints are mounted under /api/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    # ─── Admin ───────────────────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ─── API Documentation ───────────────────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # ─── API Endpoints ───────────────────────────────────────────────────
    path('api/auth/', include('apps.accounts.urls.auth_urls')),
    path('api/users/', include('apps.accounts.urls.user_urls')),
    path('api/roles/', include('apps.accounts.urls.role_urls')),
    path('api/permissions/', include('apps.accounts.urls.permission_urls')),
    path('api/restaurants/', include('apps.restaurant.urls')),
    path('api/menu/', include('apps.menu.urls')),
    path('api/tables/', include('apps.tables.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/kitchen/', include('apps.kitchen.urls')),
    path('api/delivery/', include('apps.delivery.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/promotions/', include('apps.promotions.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/audit-logs/', include('apps.audit.urls')),
    path('api/notifications/', include('apps.notifications.urls')),

    # ─── Health Check ────────────────────────────────────────────────────
    path('api/health/', include('apps.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
