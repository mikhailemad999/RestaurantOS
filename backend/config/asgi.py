"""
RestaurantOS — ASGI Configuration
Supports both HTTP and WebSocket protocols via Django Channels.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

django_asgi_app = get_asgi_application()

# WebSocket URL patterns will be imported after Django setup
from apps.kitchen.routing import websocket_urlpatterns as kitchen_ws  # noqa: E402
from apps.notifications.routing import websocket_urlpatterns as notification_ws  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            kitchen_ws + notification_ws
        )
    ),
})
