from django.db import models
from django.utils import timezone
import json

class StaffRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin / Owner'
    MANAGER = 'MANAGER', 'General Manager'
    CASHIER = 'CASHIER', 'Head Cashier'
    WAITER = 'WAITER', 'Floor Captain / Waiter'
    CHEF = 'CHEF', 'Head Chef / Kitchen Staff'
    DRIVER = 'DRIVER', 'Logistics Courier'

class StaffMember(models.Model):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=20, choices=StaffRole.choices, default=StaffRole.CASHIER)
    pin_code = models.CharField(max_length=10, default='1234')
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=15.00)
    is_active = models.BooleanField(default=True)
    preferred_language = models.CharField(max_length=10, default='en')  # 'en' or 'ar'
    avatar_url = models.CharField(max_length=500, blank=True, default='')
    permissions = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role}) [{self.preferred_language}]"


class MenuCategory(models.Model):
    name = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100, blank=True, default='')
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='utensils')
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class KitchenStation(models.TextChoices):
    ALL = 'ALL', 'All Stations'
    PIZZA = 'PIZZA', 'Pizza'
    SANDWICH = 'SANDWICH', 'Sandwich & Burgers'
    GRILL = 'GRILL', 'Grill & Steaks'
    FRYER = 'FRYER', 'Fryer & Sides'
    BAR = 'BAR', 'Beverage & Bar'
    DESSERT = 'DESSERT', 'Dessert & Pastry'
    ASSEMBLY = 'ASSEMBLY', 'Pantry & Assembly'


class MenuItem(models.Model):
    category = models.ForeignKey(MenuCategory, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    name_ar = models.CharField(max_length=150, blank=True, default='')
    description = models.TextField(blank=True, default='')
    description_ar = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    sku = models.CharField(max_length=50, blank=True, default='')
    prep_time_minutes = models.IntegerField(default=12)
    station = models.CharField(max_length=20, choices=KitchenStation.choices, default=KitchenStation.GRILL)
    image_url = models.CharField(max_length=500, blank=True, default='')
    is_available = models.BooleanField(default=True) # 86 toggle
    is_kiosk_featured = models.BooleanField(default=False)
    calories = models.IntegerField(default=0, blank=True)
    allergens = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (${self.price})"


class ModifierGroup(models.Model):
    name = models.CharField(max_length=100)
    min_selection = models.IntegerField(default=0)
    max_selection = models.IntegerField(default=1)
    is_required = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class ModifierItem(models.Model):
    group = models.ForeignKey(ModifierGroup, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    price_extra = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} (+${self.price_extra})"


class MenuItemModifierGroup(models.Model):
    menu_item = models.ForeignKey(MenuItem, related_name='modifier_groups', on_delete=models.CASCADE)
    modifier_group = models.ForeignKey(ModifierGroup, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('menu_item', 'modifier_group')


class FloorSection(models.Model):
    name = models.CharField(max_length=80)
    slug = models.SlugField(max_length=80, unique=True)
    description = models.CharField(max_length=200, blank=True, default='')
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class TableStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available'
    OCCUPIED = 'OCCUPIED', 'Occupied'
    RESERVED = 'RESERVED', 'Reserved'
    BILL_REQUESTED = 'BILL_REQUESTED', 'Bill Requested'


class DiningTable(models.Model):
    section = models.ForeignKey(FloorSection, related_name='tables', on_delete=models.CASCADE)
    table_number = models.CharField(max_length=20)
    capacity = models.IntegerField(default=4)
    shape = models.CharField(max_length=20, default='SQUARE') # SQUARE, ROUND, RECTANGLE
    pos_x = models.IntegerField(default=50) # Canvas coordinate X
    pos_y = models.IntegerField(default=50) # Canvas coordinate Y
    width = models.IntegerField(default=90)
    height = models.IntegerField(default=90)
    status = models.CharField(max_length=20, choices=TableStatus.choices, default=TableStatus.AVAILABLE)
    current_order_id = models.IntegerField(blank=True, null=True)
    seated_at = models.DateTimeField(blank=True, null=True)
    guest_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['table_number']

    def __str__(self):
        return f"Table {self.table_number} ({self.section.name})"


class CustomerTier(models.TextChoices):
    BRONZE = 'BRONZE', 'Bronze'
    SILVER = 'SILVER', 'Silver'
    GOLD = 'GOLD', 'Gold VIP'
    PLATINUM = 'PLATINUM', 'Platinum Elite'


class Customer(models.Model):
    customer_code = models.CharField(max_length=30, blank=True, null=True, unique=True)
    name = models.CharField(max_length=120)
    first_name = models.CharField(max_length=60, blank=True, default='')
    last_name = models.CharField(max_length=60, blank=True, default='')
    phone = models.CharField(max_length=40, unique=True, db_index=True)
    normalized_phone = models.CharField(max_length=40, blank=True, default='', db_index=True)
    secondary_phone = models.CharField(max_length=40, blank=True, default='')
    normalized_secondary_phone = models.CharField(max_length=40, blank=True, default='')
    email = models.EmailField(blank=True, null=True)
    vip_tier = models.CharField(max_length=20, choices=CustomerTier.choices, default=CustomerTier.BRONZE)
    loyalty_points = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    visit_count = models.IntegerField(default=0)
    notes = models.TextField(blank=True, default='')
    dietary_tags = models.CharField(max_length=200, blank=True, default='')
    last_visit = models.DateTimeField(default=timezone.now)
    last_order_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['normalized_phone']),
            models.Index(fields=['name']),
            models.Index(fields=['last_order_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.vip_tier}"


class CustomerAddress(models.Model):
    LABEL_CHOICES = [
        ('HOME', 'Home'),
        ('WORK', 'Work / Office'),
        ('FAMILY', 'Family / Parents'),
        ('OTHER', 'Other'),
    ]

    customer = models.ForeignKey(Customer, related_name='addresses', on_delete=models.CASCADE)
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='HOME')
    city = models.CharField(max_length=80, default='Cairo')
    area = models.CharField(max_length=100, default='New Cairo')
    street = models.CharField(max_length=150)
    building = models.CharField(max_length=50, blank=True, default='')
    floor = models.CharField(max_length=30, blank=True, default='')
    apartment = models.CharField(max_length=30, blank=True, default='')
    landmark = models.CharField(max_length=150, blank=True, default='')
    instructions = models.TextField(blank=True, default='')
    latitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.customer.name} - {self.label}: {self.area}, {self.street}"


class CustomerNote(models.Model):
    NOTE_TYPES = [
        ('DELIVERY', 'Delivery Note'),
        ('FOOD_PREFERENCE', 'Food & Dietary Preference'),
        ('VIP', 'VIP / Service Touchpoint'),
        ('ADDRESS', 'Address Guidance'),
        ('OTHER', 'Other Note'),
    ]

    customer = models.ForeignKey(Customer, related_name='customer_notes', on_delete=models.CASCADE)
    note_type = models.CharField(max_length=30, choices=NOTE_TYPES, default='DELIVERY')
    content = models.TextField()
    created_by = models.ForeignKey(StaffMember, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.note_type}] for {self.customer.name}"


class DeliveryZone(models.Model):
    name = models.CharField(max_length=100, unique=True)
    city = models.CharField(max_length=80, default='Cairo')
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=30.00)
    estimated_minutes = models.IntegerField(default=35)
    min_order_free_delivery = models.DecimalField(max_digits=8, decimal_places=2, default=500.00)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.city}) - Fee: ${self.delivery_fee}"



class OrderType(models.TextChoices):
    DINE_IN = 'DINE_IN', 'Dine-in'
    TAKEOUT = 'TAKEOUT', 'Takeout / Pickup'
    DELIVERY = 'DELIVERY', 'Home Delivery'
    KIOSK = 'KIOSK', 'Self Kiosk'


class OrderStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    PREPARING = 'PREPARING', 'In Kitchen'
    READY = 'READY', 'Ready for Serving'
    SERVED = 'SERVED', 'Served'
    COMPLETED = 'COMPLETED', 'Completed & Paid'
    CANCELLED = 'CANCELLED', 'Cancelled / Void'


class PaymentMethod(models.TextChoices):
    CASH = 'CASH', 'Cash'
    CARD = 'CARD', 'Credit / Debit Card'
    POINTS = 'POINTS', 'Loyalty Points'
    SPLIT = 'SPLIT', 'Split Bill'
    PENDING = 'PENDING', 'Pending Payment'


class PaymentStatus(models.TextChoices):
    UNPAID = 'UNPAID', 'Unpaid'
    PARTIAL = 'PARTIAL', 'Partially Paid'
    PAID = 'PAID', 'Paid'
    REFUNDED = 'REFUNDED', 'Refunded'


class Order(models.Model):
    order_number = models.CharField(max_length=30, unique=True)
    order_type = models.CharField(max_length=20, choices=OrderType.choices, default=OrderType.DINE_IN)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    table = models.ForeignKey(DiningTable, related_name='orders', on_delete=models.SET_NULL, null=True, blank=True)
    customer = models.ForeignKey(Customer, related_name='orders', on_delete=models.SET_NULL, null=True, blank=True)
    server = models.ForeignKey(StaffMember, related_name='served_orders', on_delete=models.SET_NULL, null=True, blank=True)
    guest_count = models.IntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tip_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)
    special_instructions = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} ({self.status}) - ${self.total_amount}"


class OrderItemStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    COOKING = 'COOKING', 'Cooking'
    READY = 'READY', 'Ready'
    SERVED = 'SERVED', 'Served'
    VOID = 'VOID', 'Voided'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=OrderItemStatus.choices, default=OrderItemStatus.PENDING)
    station = models.CharField(max_length=20, default=KitchenStation.GRILL)
    selected_modifiers = models.JSONField(default=list, blank=True) # list of { name, price_extra }
    notes = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} for Order #{self.order.order_number}"


class InventoryItem(models.Model):
    name = models.CharField(max_length=120)
    sku = models.CharField(max_length=60, unique=True)
    category = models.CharField(max_length=80, default='General Produce')
    unit = models.CharField(max_length=20, default='KG') # KG, G, L, ML, PCS, BOTTLE
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    minimum_stock = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    supplier_name = models.CharField(max_length=120, blank=True, default='Primary Wholesale')
    last_restocked = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.unit})"


class MovementType(models.TextChoices):
    PURCHASE = 'PURCHASE', 'Stock In / Purchase'
    USAGE = 'USAGE', 'Kitchen Usage'
    WASTE = 'WASTE', 'Spoilage / Wastage'
    ADJUSTMENT = 'ADJUSTMENT', 'Audit Adjustment'


class InventoryMovement(models.Model):
    item = models.ForeignKey(InventoryItem, related_name='movements', on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reason = models.CharField(max_length=255, blank=True, default='')
    logged_by = models.ForeignKey(StaffMember, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.movement_type} {self.quantity} {self.item.unit} of {self.item.name}"


class RecipeIngredient(models.Model):
    menu_item = models.ForeignKey(MenuItem, related_name='recipe_ingredients', on_delete=models.CASCADE)
    inventory_item = models.ForeignKey(InventoryItem, related_name='used_in_recipes', on_delete=models.CASCADE)
    quantity_required = models.DecimalField(max_digits=10, decimal_places=3, default=0.100)

    class Meta:
        unique_together = ('menu_item', 'inventory_item')


class DeliveryStatus(models.TextChoices):
    UNASSIGNED = 'UNASSIGNED', 'Pending Assignment'
    ASSIGNED = 'ASSIGNED', 'Assigned to Courier'
    PICKED_UP = 'PICKED_UP', 'Out for Delivery'
    DELIVERED = 'DELIVERED', 'Delivered'
    FAILED = 'FAILED', 'Failed / Returned'


class DeliveryOrder(models.Model):
    order = models.OneToOneField(Order, related_name='delivery_info', on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, related_name='delivery_orders', on_delete=models.SET_NULL, null=True, blank=True)
    customer_address = models.ForeignKey(CustomerAddress, related_name='delivery_orders', on_delete=models.SET_NULL, null=True, blank=True)
    delivery_zone = models.ForeignKey(DeliveryZone, related_name='delivery_orders', on_delete=models.SET_NULL, null=True, blank=True)
    driver = models.ForeignKey(StaffMember, related_name='deliveries', on_delete=models.SET_NULL, null=True, blank=True)
    delivery_address = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=40)
    customer_name = models.CharField(max_length=100, default='Guest')
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    delivery_status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.UNASSIGNED)
    estimated_minutes = models.IntegerField(default=30)
    delivery_note = models.TextField(blank=True, default='')
    driver_notes = models.TextField(blank=True, default='')
    dispatched_at = models.DateTimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return f"Delivery for #{self.order.order_number} ({self.delivery_status}) - Fee: ${self.delivery_fee}"


class CashShift(models.Model):
    staff = models.ForeignKey(StaffMember, related_name='shifts', on_delete=models.CASCADE)
    opening_cash = models.DecimalField(max_digits=10, decimal_places=2, default=300.00)
    closing_cash = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_cash_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_card_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='OPEN') # OPEN, CLOSED
    opened_at = models.DateTimeField(default=timezone.now)
    closed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Shift #{self.id} by {self.staff.name} ({self.status})"


class SystemSetting(models.Model):
    key = models.CharField(max_length=80, unique=True)
    value_json = models.JSONField(default=dict)
    description = models.CharField(max_length=200, blank=True, default='')

    def __str__(self):
        return self.key


# ============================================================
# ENTERPRISE & BUSINESS INTELLIGENCE EXTENSIONS
# ============================================================

class Branch(models.Model):
    name = models.CharField(max_length=120)
    code = models.CharField(max_length=20, unique=True)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=40, blank=True, default='')
    is_main = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class BranchMenuOverride(models.Model):
    branch = models.ForeignKey(Branch, related_name='menu_overrides', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, related_name='branch_overrides', on_delete=models.CASCADE)
    custom_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('branch', 'menu_item')

    def __str__(self):
        return f"{self.branch.name} - {self.menu_item.name} (${self.custom_price or self.menu_item.price})"


class PriceChangeRequest(models.Model):
    menu_item = models.ForeignKey(MenuItem, related_name='price_requests', on_delete=models.CASCADE)
    old_price = models.DecimalField(max_digits=10, decimal_places=2)
    new_price = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    requested_by = models.ForeignKey(StaffMember, related_name='requested_price_changes', on_delete=models.SET_NULL, null=True)
    approved_by = models.ForeignKey(StaffMember, related_name='approved_price_changes', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, default='PENDING')  # PENDING, APPROVED, REJECTED
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Price Change: {self.menu_item.name} (${self.old_price} -> ${self.new_price})"


class Supplier(models.Model):
    name = models.CharField(max_length=150)
    contact_name = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=40, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    lead_time_days = models.IntegerField(default=2)
    quality_score = models.IntegerField(default=95)  # 0-100
    on_time_rate = models.DecimalField(max_digits=5, decimal_places=2, default=98.00)
    total_purchased = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Score: {self.quality_score})"


class PurchaseOrder(models.Model):
    po_number = models.CharField(max_length=50, unique=True)
    supplier = models.ForeignKey(Supplier, related_name='purchase_orders', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='DRAFT')  # DRAFT, SUBMITTED, RECEIVED, REJECTED
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    expected_delivery = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(StaffMember, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PO #{self.po_number} - {self.supplier.name} (${self.total_amount})"


class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, related_name='items', on_delete=models.CASCADE)
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} {self.inventory_item.unit} of {self.inventory_item.name}"


class MarketingCampaign(models.Model):
    name = models.CharField(max_length=150)
    campaign_type = models.CharField(max_length=40, default='WIN_BACK')  # WIN_BACK, VIP, FLASH_SALE, HAPPY_HOUR
    channel = models.CharField(max_length=20, default='SMS')  # SMS, EMAIL, WHATSAPP, PUSH
    target_segment = models.CharField(max_length=40, default='AT_RISK')  # ALL, VIP, AT_RISK, NEW
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=200.00)
    messages_sent = models.IntegerField(default=0)
    redeemed_count = models.IntegerField(default=0)
    revenue_generated = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    profit_generated = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='ACTIVE')  # DRAFT, ACTIVE, COMPLETED
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Campaign: {self.name} ({self.channel})"


class QRCodeTableSession(models.Model):
    table = models.ForeignKey(DiningTable, related_name='qr_sessions', on_delete=models.CASCADE)
    session_token = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    waiter_requested = models.BooleanField(default=False)
    bill_requested = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"QR Session for Table {self.table.table_number}"


class WaitlistEntry(models.Model):
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=40)
    party_size = models.IntegerField(default=2)
    preferred_section = models.CharField(max_length=60, default='Any')
    estimated_wait_minutes = models.IntegerField(default=15)
    status = models.CharField(max_length=20, default='WAITING')  # WAITING, SEATED, NO_SHOW, CANCELLED
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Waitlist: {self.customer_name} ({self.party_size}p) - {self.status}"


class Reservation(models.Model):
    customer = models.ForeignKey(Customer, related_name='reservations', on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=40)
    table = models.ForeignKey(DiningTable, related_name='reservations', on_delete=models.SET_NULL, null=True, blank=True)
    reservation_time = models.DateTimeField()
    party_size = models.IntegerField(default=2)
    deposit_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='CONFIRMED')  # CONFIRMED, SEATED, CANCELLED, NO_SHOW
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reservation: {self.customer_name} on {self.reservation_time}"


class StaffAttendance(models.Model):
    staff = models.ForeignKey(StaffMember, related_name='attendances', on_delete=models.CASCADE)
    clock_in = models.DateTimeField(default=timezone.now)
    clock_out = models.DateTimeField(null=True, blank=True)
    break_minutes = models.IntegerField(default=0)
    status = models.CharField(max_length=20, default='ON_TIME')  # ON_TIME, LATE, OVERTIME
    notes = models.CharField(max_length=200, blank=True, default='')

    def __str__(self):
        return f"{self.staff.name} Shift ({self.status})"


class ApprovalRequest(models.Model):
    request_type = models.CharField(max_length=40)  # REFUND, VOID, PRICE_CHANGE, LARGE_DISCOUNT, INVENTORY_ADJUSTMENT
    requester = models.ForeignKey(StaffMember, related_name='requested_approvals', on_delete=models.CASCADE)
    approver = models.ForeignKey(StaffMember, related_name='resolved_approvals', on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reason = models.TextField()
    status = models.CharField(max_length=20, default='PENDING')  # PENDING, APPROVED, REJECTED
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Approval: {self.request_type} (${self.amount}) - {self.status}"


class RiskAlert(models.Model):
    alert_type = models.CharField(max_length=40)  # VOID_SPIKE, REFUND_SPIKE, CASH_VARIANCE, FOOD_COST_SPIKE, LATE_TICKET
    severity = models.CharField(max_length=20, default='MEDIUM')  # LOW, MEDIUM, HIGH, CRITICAL
    description = models.TextField()
    related_staff = models.ForeignKey(StaffMember, on_delete=models.SET_NULL, null=True, blank=True)
    related_order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(StaffMember, related_name='resolved_risk_alerts', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Risk [{self.severity}]: {self.alert_type}"


class CustomerFeedback(models.Model):
    order = models.ForeignKey(Order, related_name='feedbacks', on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=100, default='Guest')
    rating_overall = models.IntegerField(default=5)  # 1-5
    rating_food = models.IntegerField(default=5)
    rating_service = models.IntegerField(default=5)
    rating_speed = models.IntegerField(default=5)
    comment = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, default='NEW')  # NEW, REVIEWING, RESPONDED, RESOLVED
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback: {self.rating_overall}★ from {self.customer_name}"


class BusinessTarget(models.Model):
    metric_name = models.CharField(max_length=80)  # DAILY_SALES, FOOD_COST_PCT, TABLE_TURNOVER, CUSTOMER_RETENTION
    target_value = models.DecimalField(max_digits=12, decimal_places=2)
    actual_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    period = models.CharField(max_length=20, default='MONTHLY')  # DAILY, WEEKLY, MONTHLY
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return f"Target: {self.metric_name} ({self.actual_value}/{self.target_value})"


class ExpenseRecord(models.Model):
    category = models.CharField(max_length=50)  # RENT, UTILITIES, SALARIES, MARKETING, MAINTENANCE, SOFTWARE, SUPPLIES
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    expense_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Expense: {self.category} (${self.amount})"


class AIRecommendation(models.Model):
    category = models.CharField(max_length=40)  # PRICING, INVENTORY, MENU, MARKETING, STAFFING, WASTE
    title = models.CharField(max_length=150)
    recommendation = models.TextField()
    reason = models.TextField()
    supporting_metrics = models.JSONField(default=dict, blank=True)
    confidence = models.IntegerField(default=92)  # 0-100%
    expected_impact = models.CharField(max_length=100, default='+$1,200 Monthly Profit')
    status = models.CharField(max_length=20, default='NEW')  # NEW, ACCEPTED, DISMISSED
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Recommendation [{self.category}]: {self.title}"


# ============================================================
# KITCHEN STATIONS & SMART PRINTER ROUTING EXTENSIONS
# ============================================================

class StationProfile(models.Model):
    code = models.CharField(max_length=30, unique=True)
    name_en = models.CharField(max_length=80)
    name_ar = models.CharField(max_length=80, blank=True, default='')
    sla_minutes = models.IntegerField(default=12)
    display_color = models.CharField(max_length=30, default='#f2ca50')
    priority_level = models.CharField(max_length=20, default='NORMAL')  # HIGH, NORMAL, LOW
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    screen_route = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return f"{self.name_en} ({self.code})"


class PrinterDevice(models.Model):
    name = models.CharField(max_length=80)
    display_name = models.CharField(max_length=100, blank=True, default='')
    printer_type = models.CharField(max_length=30, default='KITCHEN')  # KITCHEN, CASHIER, PIZZA, SANDWICH, GRILL, FRYER, BAR, DESSERT, DELIVERY
    station = models.ForeignKey(StationProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='printers')
    connection_type = models.CharField(max_length=30, default='NETWORK')  # NETWORK, USB, WINDOWS_SHARED, BLUETOOTH
    ip_address = models.CharField(max_length=45, default='192.168.1.100')
    port = models.IntegerField(default=9100)
    paper_width = models.CharField(max_length=10, default='80MM')  # 80MM, 58MM, A4
    status = models.CharField(max_length=20, default='ONLINE')  # ONLINE, OFFLINE, PRINTING, WARNING, ERROR
    is_active = models.BooleanField(default=True)
    auto_print = models.BooleanField(default=True)
    copies = models.IntegerField(default=1)
    backup_printer = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='failover_for')
    bilingual_mode = models.BooleanField(default=True)
    header_text = models.CharField(max_length=200, blank=True, default='L\'ETOILE HAUTE CUISINE')
    footer_text = models.CharField(max_length=200, blank=True, default='Master Kitchen - Culinary Precision')
    last_ping = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.ip_address}:{self.port}) [{self.status}]"


class PrinterRoutingRule(models.Model):
    name = models.CharField(max_length=120)
    rule_level = models.CharField(max_length=20, default='STATION')  # ITEM, CATEGORY, STATION, ORDER_TYPE, GLOBAL
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, null=True, blank=True, related_name='printer_rules')
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, null=True, blank=True, related_name='printer_rules')
    station_code = models.CharField(max_length=30, blank=True, default='GRILL')
    order_type = models.CharField(max_length=20, blank=True, default='')  # DINE_IN, TAKEOUT, DELIVERY
    primary_printer = models.ForeignKey(PrinterDevice, on_delete=models.CASCADE, related_name='primary_rules')
    backup_printer = models.ForeignKey(PrinterDevice, on_delete=models.SET_NULL, null=True, blank=True, related_name='backup_rules')
    priority = models.IntegerField(default=10)  # Lower number = higher priority
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Rule: {self.name} [{self.rule_level}] -> {self.primary_printer.name}"


class KitchenPrintJob(models.Model):
    job_number = models.CharField(max_length=40, unique=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='print_jobs')
    printer = models.ForeignKey(PrinterDevice, on_delete=models.CASCADE, related_name='jobs')
    station_code = models.CharField(max_length=30, default='KITCHEN')
    ticket_type = models.CharField(max_length=30, default='KITCHEN_TICKET')  # KITCHEN_TICKET, CASHIER_RECEIPT, DELIVERY_TICKET, BAR_TICKET
    items_payload = models.JSONField(default=list)
    rendered_text_en = models.TextField(blank=True, default='')
    rendered_text_ar = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, default='QUEUED')  # QUEUED, PRINTING, PRINTED, FAILED, RETRYING, CANCELLED
    retry_count = models.IntegerField(default=0)
    error_message = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"PrintJob {self.job_number} for Order #{self.order.order_number} [{self.status}]"


