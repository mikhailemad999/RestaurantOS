from rest_framework.routers import DefaultRouter
from apps.accounts.views import PermissionViewSet

router = DefaultRouter()
router.register('', PermissionViewSet, basename='permissions')

urlpatterns = router.urls
