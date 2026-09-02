from rest_framework import serializers
from .models import (
    StaffMember, MenuCategory, MenuItem, ModifierGroup, ModifierItem,
    FloorSection, DiningTable, Customer, CustomerAddress, CustomerNote, DeliveryZone,
    Order, OrderItem, InventoryItem, InventoryMovement, RecipeIngredient, DeliveryOrder,
    CashShift, SystemSetting, Branch, BranchMenuOverride, PriceChangeRequest,
    Supplier, PurchaseOrder, PurchaseOrderItem, MarketingCampaign,
    QRCodeTableSession, WaitlistEntry, Reservation, StaffAttendance,
    ApprovalRequest, RiskAlert, CustomerFeedback, BusinessTarget,
    ExpenseRecord, AIRecommendation, StationProfile, PrinterDevice,
    PrinterRoutingRule, KitchenPrintJob, BusinessConfig, Brand,
    CateringEvent, MenuPricingRule
)

class StaffMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffMember
        fields = '__all__'


class ModifierItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModifierItem
        fields = '__all__'


class ModifierGroupSerializer(serializers.ModelSerializer):
    items = ModifierItemSerializer(many=True, read_only=True)

    class Meta:
        model = ModifierGroup
        fields = '__all__'


class RecipeIngredientSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.ReadOnlyField(source='inventory_item.name')
    inventory_unit = serializers.ReadOnlyField(source='inventory_item.unit')

    class Meta:
        model = RecipeIngredient
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    recipe_ingredients = RecipeIngredientSerializer(many=True, read_only=True)

    class Meta:
        model = MenuItem
        fields = '__all__'


class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = '__all__'


class DiningTableSerializer(serializers.ModelSerializer):
    section_name = serializers.ReadOnlyField(source='section.name')

    class Meta:
        model = DiningTable
        fields = '__all__'


class FloorSectionSerializer(serializers.ModelSerializer):
    tables = DiningTableSerializer(many=True, read_only=True)

    class Meta:
        model = FloorSection
        fields = '__all__'


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = '__all__'


class CustomerNoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.name')

    class Meta:
        model = CustomerNote
        fields = '__all__'


class CustomerSerializer(serializers.ModelSerializer):
    addresses = CustomerAddressSerializer(many=True, read_only=True)
    customer_notes = CustomerNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name')
    menu_item_image = serializers.ReadOnlyField(source='menu_item.image_url')

    class Meta:
        model = OrderItem
        fields = '__all__'


class DeliveryOrderSerializer(serializers.ModelSerializer):
    driver_name = serializers.ReadOnlyField(source='driver.name')
    zone_name = serializers.ReadOnlyField(source='delivery_zone.name')

    class Meta:
        model = DeliveryOrder
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.ReadOnlyField(source='table.table_number')
    section_name = serializers.ReadOnlyField(source='table.section.name')
    customer_name = serializers.ReadOnlyField(source='customer.name')
    customer_phone = serializers.ReadOnlyField(source='customer.phone')
    server_name = serializers.ReadOnlyField(source='server.name')
    delivery_info = DeliveryOrderSerializer(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class InventoryMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.ReadOnlyField(source='item.name')
    logged_by_name = serializers.ReadOnlyField(source='logged_by.name')

    class Meta:
        model = InventoryMovement
        fields = '__all__'


class InventoryItemSerializer(serializers.ModelSerializer):
    movements = InventoryMovementSerializer(many=True, read_only=True)

    class Meta:
        model = InventoryItem
        fields = '__all__'


class CashShiftSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source='staff.name')

    class Meta:
        model = CashShift
        fields = '__all__'


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'


# ============================================================
# ENTERPRISE & ANALYTICS SERIALIZERS
# ============================================================

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'


class BranchMenuOverrideSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name')
    branch_name = serializers.ReadOnlyField(source='branch.name')

    class Meta:
        model = BranchMenuOverride
        fields = '__all__'


class PriceChangeRequestSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name')
    requested_by_name = serializers.ReadOnlyField(source='requested_by.name')
    approved_by_name = serializers.ReadOnlyField(source='approved_by.name')

    class Meta:
        model = PriceChangeRequest
        fields = '__all__'


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.ReadOnlyField(source='inventory_item.name')
    inventory_unit = serializers.ReadOnlyField(source='inventory_item.unit')

    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.name')
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    created_by_name = serializers.ReadOnlyField(source='created_by.name')

    class Meta:
        model = PurchaseOrder
        fields = '__all__'


class MarketingCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingCampaign
        fields = '__all__'


class QRCodeTableSessionSerializer(serializers.ModelSerializer):
    table_number = serializers.ReadOnlyField(source='table.table_number')
    section_name = serializers.ReadOnlyField(source='table.section.name')

    class Meta:
        model = QRCodeTableSession
        fields = '__all__'


class WaitlistEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WaitlistEntry
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    table_number = serializers.ReadOnlyField(source='table.table_number')

    class Meta:
        model = Reservation
        fields = '__all__'


class StaffAttendanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.ReadOnlyField(source='staff.name')
    staff_role = serializers.ReadOnlyField(source='staff.role')

    class Meta:
        model = StaffAttendance
        fields = '__all__'


class ApprovalRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.name')
    approver_name = serializers.ReadOnlyField(source='approver.name')

    class Meta:
        model = ApprovalRequest
        fields = '__all__'


class RiskAlertSerializer(serializers.ModelSerializer):
    related_staff_name = serializers.ReadOnlyField(source='related_staff.name')

    class Meta:
        model = RiskAlert
        fields = '__all__'


class CustomerFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerFeedback
        fields = '__all__'


class BusinessTargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessTarget
        fields = '__all__'


class ExpenseRecordSerializer(serializers.ModelSerializer):
    branch_name = serializers.ReadOnlyField(source='branch.name')

    class Meta:
        model = ExpenseRecord
        fields = '__all__'


class AIRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIRecommendation
        fields = '__all__'


class StationProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StationProfile
        fields = '__all__'


class PrinterDeviceSerializer(serializers.ModelSerializer):
    station_name = serializers.ReadOnlyField(source='station.name_en')
    backup_printer_name = serializers.ReadOnlyField(source='backup_printer.name')
    pending_jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = PrinterDevice
        fields = '__all__'

    def get_pending_jobs_count(self, obj):
        return obj.jobs.filter(status__in=['QUEUED', 'PRINTING', 'RETRYING']).count()


class PrinterRoutingRuleSerializer(serializers.ModelSerializer):
    primary_printer_name = serializers.ReadOnlyField(source='primary_printer.name')
    backup_printer_name = serializers.ReadOnlyField(source='backup_printer.name')
    menu_item_name = serializers.ReadOnlyField(source='menu_item.name')
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = PrinterRoutingRule
        fields = '__all__'


class KitchenPrintJobSerializer(serializers.ModelSerializer):
    printer_name = serializers.ReadOnlyField(source='printer.name')
    order_number = serializers.ReadOnlyField(source='order.order_number')

    class Meta:
        model = KitchenPrintJob
        fields = '__all__'


class BusinessConfigSerializer(serializers.ModelSerializer):
    business_mode_display = serializers.CharField(source='get_business_mode_display', read_only=True)

    class Meta:
        model = BusinessConfig
        fields = '__all__'


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = '__all__'


class CateringEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CateringEvent
        fields = '__all__'


class MenuPricingRuleSerializer(serializers.ModelSerializer):
    item_name = serializers.ReadOnlyField(source='item.name')
    item_category = serializers.ReadOnlyField(source='item.category.name')

    class Meta:
        model = MenuPricingRule
        fields = '__all__'



