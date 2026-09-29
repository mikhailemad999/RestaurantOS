from rest_framework.routers import DefaultRouter
from apps.accounts.views import RoleViewSet

router = DefaultRouter()
router.register('', RoleViewSet, basename='roles')

urlpatterns = router.urls
