from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StaffMemberViewSet, MenuCategoryViewSet, MenuItemViewSet,
    ModifierGroupViewSet, FloorSectionViewSet, DiningTableViewSet,
    CustomerViewSet, OrderViewSet, KDSViewSet, InventoryItemViewSet,
    DeliveryOrderViewSet, ReportViewSet, CashShiftViewSet, SystemSettingViewSet,
    BranchViewSet, PriceChangeRequestViewSet, SupplierViewSet, PurchaseOrderViewSet,
    MarketingCampaignViewSet, QRCodeSessionViewSet, WaitlistEntryViewSet,
    ReservationViewSet, StaffAttendanceViewSet, ApprovalRequestViewSet,
    RiskAlertViewSet, CustomerFeedbackViewSet, BusinessTargetViewSet,
    ExpenseRecordViewSet, AIRecommendationViewSet, CustomerAddressViewSet,
    CustomerNoteViewSet, DeliveryZoneViewSet, StationProfileViewSet,
    PrinterDeviceViewSet, PrinterRoutingRuleViewSet, KitchenPrintJobViewSet,
    BusinessConfigViewSet, BrandViewSet, CateringEventViewSet,
    MenuPricingRuleViewSet, KitchenExpoViewSet, SystemHealthObservabilityViewSet
)

router = DefaultRouter()
router.register(r'staff', StaffMemberViewSet, basename='staff')
router.register(r'categories', MenuCategoryViewSet, basename='categories')
router.register(r'menu', MenuItemViewSet, basename='menu')
router.register(r'modifiers', ModifierGroupViewSet, basename='modifiers')
router.register(r'sections', FloorSectionViewSet, basename='sections')
router.register(r'tables', DiningTableViewSet, basename='tables')
router.register(r'customers', CustomerViewSet, basename='customers')
router.register(r'customer-addresses', CustomerAddressViewSet, basename='customer-addresses')
router.register(r'customer-notes', CustomerNoteViewSet, basename='customer-notes')
router.register(r'delivery-zones', DeliveryZoneViewSet, basename='delivery-zones')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'kds', KDSViewSet, basename='kds')
router.register(r'inventory', InventoryItemViewSet, basename='inventory')
router.register(r'delivery', DeliveryOrderViewSet, basename='delivery')
router.register(r'reports', ReportViewSet, basename='reports')
router.register(r'shifts', CashShiftViewSet, basename='shifts')
router.register(r'settings', SystemSettingViewSet, basename='settings')

# Enterprise Intelligence Routers
router.register(r'branches', BranchViewSet, basename='branches')
router.register(r'pricing-requests', PriceChangeRequestViewSet, basename='pricing-requests')
router.register(r'suppliers', SupplierViewSet, basename='suppliers')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-orders')
router.register(r'campaigns', MarketingCampaignViewSet, basename='campaigns')
router.register(r'qr-sessions', QRCodeSessionViewSet, basename='qr-sessions')
router.register(r'waitlist', WaitlistEntryViewSet, basename='waitlist')
router.register(r'reservations', ReservationViewSet, basename='reservations')
router.register(r'attendance', StaffAttendanceViewSet, basename='attendance')
router.register(r'approvals', ApprovalRequestViewSet, basename='approvals')
router.register(r'risk-alerts', RiskAlertViewSet, basename='risk-alerts')
router.register(r'feedback', CustomerFeedbackViewSet, basename='feedback')
router.register(r'targets', BusinessTargetViewSet, basename='targets')
router.register(r'expenses', ExpenseRecordViewSet, basename='expenses')
router.register(r'recommendations', AIRecommendationViewSet, basename='recommendations')

# Kitchen Stations & Smart Printer Routing Routers
router.register(r'kitchen-stations', StationProfileViewSet, basename='kitchen-stations')
router.register(r'printers', PrinterDeviceViewSet, basename='printers')
router.register(r'printer-routing-rules', PrinterRoutingRuleViewSet, basename='printer-routing-rules')
router.register(r'print-jobs', KitchenPrintJobViewSet, basename='print-jobs')

# Universal Restaurant Operating System (UROS) Routers
router.register(r'business-config', BusinessConfigViewSet, basename='business-config')
router.register(r'brands', BrandViewSet, basename='brands')
router.register(r'catering-events', CateringEventViewSet, basename='catering-events')
router.register(r'menu-pricing-rules', MenuPricingRuleViewSet, basename='menu-pricing-rules')
router.register(r'kitchen-expo', KitchenExpoViewSet, basename='kitchen-expo')
router.register(r'system-health-observability', SystemHealthObservabilityViewSet, basename='system-health-observability')

urlpatterns = [
    path('', include(router.urls)),
]
