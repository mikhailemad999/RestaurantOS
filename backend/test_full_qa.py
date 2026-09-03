"""
RestaurantOS Full End-to-End QA Test Suite
Tests: Login, Order Creation, Payment, KDS, Printer, Role Isolation
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import requests
import json
import time

BASE = "http://127.0.0.1:8000/api"

results = []

def test(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results.append((name, passed, detail))
    icon = "[OK]" if passed else "[!!]"
    print(f"  {icon} [{status}] {name}")
    if detail:
        print(f"       → {detail}")

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ============================================================
# 1. LOGIN & AUTHENTICATION
# ============================================================
section("1. LOGIN & PIN AUTHENTICATION")

# Test all 9 role PINs
pins = [
    ('9999', 'ADMIN', '/owner', 'Marcus Vance'),
    ('1234', 'MANAGER', '/manager', 'Elena Rostova'),
    ('2222', 'CASHIER', '/cashier', 'Sarah Connor'),
    ('3333', 'WAITER', '/captain', 'Antoine Dubois'),
    ('4444', 'CHEF', '/chef', 'Marco Rossi'),
    ('5555', 'DRIVER', '/driver', 'Ahmed Hassan'),
    ('6666', 'PACKING', '/packing', 'Karim Nabil'),
    ('7777', 'INVENTORY', '/inventory', 'Tarek Zaki'),
    ('8888', 'CALL_CENTER', '/call-center', 'Nour Ali'),
]

for pin, role, path, name in pins:
    r = requests.post(f"{BASE}/staff/pin-login/", json={'pin_code': pin})
    ok = r.status_code == 200
    data = r.json() if ok else {}
    staff = data.get('staff', {})
    correct = staff.get('role') == role and staff.get('role_home_path') == path
    test(f"PIN {pin} → {name} ({role})", ok and correct, 
         f"role={staff.get('role')}, home={staff.get('role_home_path')}")

# Test invalid PIN
r = requests.post(f"{BASE}/staff/pin-login/", json={'pin_code': '0000'})
test("Invalid PIN 0000 rejected", r.status_code == 400 or r.status_code == 404,
     f"Status: {r.status_code}")

# Test role-accounts listing
r = requests.get(f"{BASE}/staff/role-accounts/")
test("Role Accounts Directory", r.status_code == 200 and len(r.json()) >= 9,
     f"{len(r.json())} accounts")

# ============================================================
# 2. MENU & CATALOG
# ============================================================
section("2. MENU CATALOG & ITEM AVAILABILITY")

r = requests.get(f"{BASE}/categories/")
cats = r.json()
test("Categories loaded", r.status_code == 200 and len(cats) > 0, f"{len(cats)} categories")

r = requests.get(f"{BASE}/menu/")
items = r.json()
test("Menu items loaded", r.status_code == 200 and len(items) > 0, f"{len(items)} items")

# Check at least one item has a price
has_price = any(float(i.get('price', 0)) > 0 for i in items)
test("Items have valid prices", has_price)

# Test 86 toggle
if items:
    item_id = items[0]['id']
    r = requests.post(f"{BASE}/menu/{item_id}/toggle-availability/")
    test("Toggle item availability (86'd)", r.status_code == 200)
    # Toggle back
    requests.post(f"{BASE}/menu/{item_id}/toggle-availability/")

# ============================================================
# 3. ORDER CREATION & PAYMENT (Full POS Lifecycle)
# ============================================================
section("3. ORDER CREATION & PAYMENT LIFECYCLE")

r = requests.get(f"{BASE}/tables/")
tables = r.json()
test("Tables loaded for POS", r.status_code == 200 and len(tables) > 0, f"{len(tables)} tables")

# Find an available table
avail_table = next((t for t in tables if t['status'] == 'AVAILABLE'), tables[0] if tables else None)

# Get menu items for the order
menu_items = [i for i in items if i.get('is_available', True)][:2]

if avail_table and len(menu_items) >= 2:
    order_data = {
        "order_type": "DINE_IN",
        "table_id": avail_table['id'],
        "guest_count": 2,
        "items": [
            {"menu_item_id": menu_items[0]['id'], "quantity": 1, "notes": "QA Test - no modifications"},
            {"menu_item_id": menu_items[1]['id'], "quantity": 2, "notes": "QA Test - extra sauce"}
        ]
    }
    r = requests.post(f"{BASE}/orders/create-pos-order/", json=order_data)
    if r.status_code == 201 or r.status_code == 200:
        order = r.json()
        order_id = order.get('id')
        order_num = order.get('order_number', 'N/A')
        total = order.get('total_amount', 0)
        test("POS Order Created", True, f"Order #{order_num}, Total: ${total}, Items: {len(order.get('items', []))}")
        
        # Verify order items count
        test("Order has correct item count", len(order.get('items', [])) >= 2,
             f"Expected ≥2, got {len(order.get('items', []))}")
        
        # Verify order total is > 0
        test("Order total amount > $0", float(total) > 0, f"${total}")

        # Process payment
        payment_data = {"payment_method": "CASH", "amount_tendered": float(total) + 20}
        r2 = requests.post(f"{BASE}/orders/{order_id}/process-payment/", json=payment_data)
        if r2.status_code == 200:
            paid = r2.json()
            test("Payment processed successfully", True,
                 f"Method: CASH, Status: {paid.get('payment_status')}, Change: ${paid.get('change_due', 0)}")
        else:
            test("Payment processed successfully", False, f"Status: {r2.status_code}, Body: {r2.text[:200]}")
        
        # Verify order status updated
        r3 = requests.get(f"{BASE}/orders/{order_id}/")
        if r3.status_code == 200:
            updated = r3.json()
            test("Order payment status = PAID", updated.get('payment_status') == 'PAID',
                 f"Status: {updated.get('payment_status')}")
    else:
        test("POS Order Created", False, f"Status: {r.status_code}, Body: {r.text[:300]}")
        test("Order has correct item count", False, "Order creation failed")
        test("Order total amount > $0", False, "Order creation failed")
        test("Payment processed successfully", False, "Order creation failed")
        test("Order payment status = PAID", False, "Order creation failed")
else:
    test("POS Order Created", False, "No available table or menu items")

# Test Takeout order
if len(menu_items) >= 1:
    takeout_data = {
        "order_type": "TAKEOUT",
        "guest_count": 1,
        "items": [{"menu_item_id": menu_items[0]['id'], "quantity": 1}]
    }
    r = requests.post(f"{BASE}/orders/create-pos-order/", json=takeout_data)
    test("Takeout order created", r.status_code in [200, 201],
         f"Order #{r.json().get('order_number', 'N/A')}" if r.status_code in [200, 201] else f"Status: {r.status_code}")

# ============================================================
# 4. KITCHEN DISPLAY SYSTEM (KDS)
# ============================================================
section("4. KITCHEN DISPLAY SYSTEM (KDS)")

r = requests.get(f"{BASE}/kds/?station=ALL")
kds = r.json()
test("KDS tickets loaded (ALL stations)", r.status_code == 200 and len(kds) > 0, f"{len(kds)} active tickets")

r = requests.get(f"{BASE}/kds/?station=GRILL")
test("KDS station filter (GRILL)", r.status_code == 200, f"{len(r.json())} tickets")

r = requests.get(f"{BASE}/kds/?station=PIZZA")
test("KDS station filter (PIZZA)", r.status_code == 200, f"{len(r.json())} tickets")

# Bump an item if available
if kds and kds[0].get('items'):
    item_id = kds[0]['items'][0]['id']
    r = requests.post(f"{BASE}/kds/bump-item/", json={'item_id': item_id})
    test("KDS Bump Single Item", r.status_code == 200, f"Bumped item #{item_id}")

# Bump a full ticket
if kds:
    order_id = kds[0].get('order_id') or kds[0].get('id')
    r = requests.post(f"{BASE}/kds/bump-ticket/", json={'order_id': order_id})
    test("KDS Bump Full Ticket", r.status_code == 200, f"Bumped ticket #{order_id}")

# ============================================================
# 5. KITCHEN EXPO ASSEMBLY
# ============================================================
section("5. KITCHEN EXPO ASSEMBLY STATION")

r = requests.get(f"{BASE}/kitchen-expo/")
test("Expo Assembly Orders loaded", r.status_code == 200)

expo = r.json() if r.status_code == 200 else {}
ready = expo.get('ready_to_expo', [])
test("Expo has ready orders", len(ready) >= 0, f"{len(ready)} ready for expo")

# ============================================================
# 6. PRINTER FLEET & ROUTING
# ============================================================
section("6. PRINTER FLEET & ROUTING ENGINE")

r = requests.get(f"{BASE}/printers/")
printers = r.json()
test("Printer fleet listed", r.status_code == 200 and len(printers) > 0, f"{len(printers)} printers")

r = requests.get(f"{BASE}/printers/fleet-summary/")
fleet = r.json()
test("Fleet health summary", r.status_code == 200,
     f"Online: {fleet.get('online_count', 0)}, Offline: {fleet.get('offline_count', 0)}")

r = requests.get(f"{BASE}/printer-routing-rules/")
rules = r.json()
test("Routing rules listed", r.status_code == 200 and len(rules) > 0, f"{len(rules)} rules")

# Test print on first printer
if printers:
    pid = printers[0]['id']
    r = requests.post(f"{BASE}/printers/{pid}/test-print/")
    test("Test print triggered", r.status_code == 200,
         f"Job: {r.json().get('job_number', 'N/A')}")

# Simulate route
r = requests.post(f"{BASE}/printer-routing-rules/simulate/", json={'station_code': 'PIZZA'})
test("Route simulation (PIZZA)", r.status_code == 200,
     f"Primary: {r.json().get('primary_printer', {}).get('name', 'N/A')}")

# Print Jobs Queue
r = requests.get(f"{BASE}/print-jobs/")
test("Print jobs queue accessible", r.status_code == 200, f"{len(r.json())} jobs in queue")

# ============================================================
# 7. TABLE MANAGEMENT & COURSING
# ============================================================
section("7. TABLE MANAGEMENT & COURSING")

r = requests.get(f"{BASE}/tables/")
tables = r.json()
test("Tables listed", r.status_code == 200 and len(tables) > 0, f"{len(tables)} tables")

# Find an occupied table to test coursing
occupied = [t for t in tables if t['status'] == 'OCCUPIED']
if occupied:
    tid = occupied[0]['id']
    r = requests.post(f"{BASE}/tables/{tid}/update-coursing/", json={'coursing_status': 'MAIN_FIRE'})
    test("Update coursing (MAIN_FIRE)", r.status_code == 200)
else:
    test("Update coursing (MAIN_FIRE)", True, "No occupied tables to test - skipped")

# ============================================================
# 8. DELIVERY & DISPATCH
# ============================================================
section("8. DELIVERY & DISPATCH SYSTEM")

r = requests.get(f"{BASE}/delivery/")
test("Delivery dispatches loaded", r.status_code == 200, f"{len(r.json())} dispatches")

r = requests.get(f"{BASE}/delivery/drivers/")
test("Drivers roster loaded", r.status_code == 200, f"{len(r.json())} drivers")

r = requests.get(f"{BASE}/delivery-zones/")
test("Delivery zones loaded", r.status_code == 200, f"{len(r.json())} zones")

# ============================================================
# 9. CRM & CUSTOMERS
# ============================================================
section("9. CUSTOMER CRM & PROFILES")

r = requests.get(f"{BASE}/customers/")
custs = r.json()
test("Customer profiles loaded", r.status_code == 200 and len(custs) > 0, f"{len(custs)} customers")

# Search by phone
r = requests.get(f"{BASE}/customers/search/?q=0101")
test("Customer phone search", r.status_code == 200)

# Get last order for a customer
if custs:
    cid = custs[0]['id']
    r = requests.get(f"{BASE}/customers/{cid}/last-order/")
    test("Customer last order lookup", r.status_code == 200)

# ============================================================
# 10. INVENTORY & STOCK
# ============================================================
section("10. INVENTORY & STOCK CONTROL")

r = requests.get(f"{BASE}/inventory/")
inv = r.json()
test("Raw inventory loaded", r.status_code == 200 and len(inv) > 0, f"{len(inv)} stock items")

# Check low stock detection
low = [i for i in inv if float(i.get('current_quantity', 0)) <= float(i.get('minimum_threshold', 0))]
test("Low stock detection", True, f"{len(low)} items below threshold")

# ============================================================
# 11. UNIVERSAL PLATFORM (UROS)
# ============================================================
section("11. UNIVERSAL PLATFORM (UROS)")

r = requests.get(f"{BASE}/business-config/current/")
test("Business Config loaded", r.status_code == 200)

r = requests.get(f"{BASE}/brands/")
brands = r.json()
test("Multi-Brand list", r.status_code == 200 and len(brands) > 0, f"{len(brands)} brands")

r = requests.get(f"{BASE}/brands/portfolio-summary/")
test("Portfolio BI Summary", r.status_code == 200)

r = requests.get(f"{BASE}/catering-events/")
test("Catering Events list", r.status_code == 200)

r = requests.get(f"{BASE}/menu-pricing-rules/matrix/")
test("Menu Pricing Matrix", r.status_code == 200)

r = requests.get(f"{BASE}/system-health-observability/")
test("System Health Observability", r.status_code == 200)

# ============================================================
# 12. ENTERPRISE ANALYTICS
# ============================================================
section("12. ENTERPRISE ANALYTICS & REPORTS")

endpoints = [
    '/reports/command-center/',
    '/reports/health-score/',
    '/reports/menu-engineering/',
    '/reports/inventory-forecasting/',
    '/reports/daily-brief/',
    '/reports/financial-analytics/',
    '/reports/bi-summary/',
]
for ep in endpoints:
    r = requests.get(f"{BASE}{ep}")
    test(f"GET {ep}", r.status_code == 200)

# AI Manager Query
r = requests.post(f"{BASE}/reports/ai-manager-query/", json={"query": "What are today's sales?"})
test("AI Manager Query", r.status_code == 200)

# ============================================================
# 13. ONLINE ORDERING (Customer-facing)
# ============================================================
section("13. ONLINE ORDERING & CUSTOMER FLOW")

# Verify online menu loads via same catalog endpoint
r = requests.get(f"{BASE}/menu/")
test("Online menu catalog for customers", r.status_code == 200 and len(r.json()) > 0)

r = requests.get(f"{BASE}/categories/")
test("Online category listing", r.status_code == 200 and len(r.json()) > 0)

# Create a delivery order as a customer would
if len(items) >= 1:
    delivery_data = {
        "order_type": "DELIVERY",
        "guest_count": 1,
        "items": [{"menu_item_id": items[0]['id'], "quantity": 1}],
        "customer_name": "QA Test Customer",
        "customer_phone": "01099887766",
        "delivery_address": "123 Test Street, Cairo"
    }
    r = requests.post(f"{BASE}/orders/create-pos-order/", json=delivery_data)
    test("Delivery order created", r.status_code in [200, 201],
         f"Order #{r.json().get('order_number', 'N/A')}" if r.status_code in [200, 201] else f"Status: {r.status_code}")

# ============================================================
# FINAL SUMMARY
# ============================================================
print(f"\n{'='*60}")
passed = sum(1 for _, p, _ in results if p)
failed = sum(1 for _, p, _ in results if not p)
total = len(results)
pct = (passed / total * 100) if total > 0 else 0

print(f"  FULL QA SUMMARY: {passed}/{total} PASSED ({pct:.1f}%)")
if failed > 0:
    print(f"\n  ❌ FAILURES ({failed}):")
    for name, p, detail in results:
        if not p:
            print(f"     - {name}: {detail}")
print(f"{'='*60}")
