import urllib.request
import json
import sys

BASE = 'http://127.0.0.1:8000/api'

def req(endpoint, data=None, method='GET'):
    body = json.dumps(data).encode('utf-8') if data else None
    request = urllib.request.Request(f'{BASE}{endpoint}', data=body, headers={'Content-Type': 'application/json'})
    request.get_method = lambda: method
    try:
        res = urllib.request.urlopen(request)
        return res.status, json.loads(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def main():
    print("=" * 60)
    print("   RESTAURANTOS LIVE INTEGRATION VERIFICATION")
    print("=" * 60)

    # 1. Staff Authentication
    s, res = req('/staff/pin-login/', {'pin_code': '1234'}, 'POST')
    assert s == 200 and res['success'], "Staff PIN login failed"
    print(f"[PASS] 1. Staff RBAC PIN Auth (Authenticated: {res['staff']['name']} as {res['staff']['role']})")

    # 2. Category & Menu Management
    s, cats = req('/categories/')
    assert s == 200 and len(cats) >= 6, "Categories check failed"
    s, items = req('/menu/')
    assert s == 200 and len(items) >= 17, "Menu items check failed"
    first_item = items[0]
    print(f"[PASS] 2. Menu Catalog ({len(cats)} categories, {len(items)} dishes loaded)")

    # 3. 86 Out-of-Stock Toggle
    item_id = first_item['id']
    s, res = req(f'/menu/{item_id}/toggle-availability/', method='POST')
    assert s == 200, "Toggle out-of-stock failed"
    s, res = req(f'/menu/{item_id}/toggle-availability/', method='POST')
    assert s == 200, "Toggle in-stock failed"
    print(f"[PASS] 3. 86 / Out-of-Stock Toggle ({first_item['name']})")

    # 4. Floor Sections & Tables
    s, sections = req('/sections/')
    s, tables = req('/tables/')
    assert s == 200 and len(tables) >= 18, "Tables list failed"
    print(f"[PASS] 4. Floor Plan ({len(sections)} sections, {len(tables)} tables)")

    # 5. Table Lifecycle
    t_id = tables[0]['id']
    s, t_update = req(f'/tables/{t_id}/update-status/', {'status': 'OCCUPIED'}, 'POST')
    assert s == 200 and t_update['status'] == 'OCCUPIED', "Table seat failed"
    s, t_clear = req(f'/tables/{t_id}/clear/', method='POST')
    assert s == 200 and t_clear['status'] == 'AVAILABLE', "Table clear failed"
    print(f"[PASS] 5. Table State Transitions (Table {tables[0]['table_number']})")

    # 6. POS Order Creation & Settlement
    order_payload = {
        'order_type': 'DINE_IN',
        'table_id': t_id,
        'guest_count': 2,
        'payment_method': 'CARD',
        'payment_status': 'PAID',
        'items': [{
            'menu_item_id': first_item['id'],
            'quantity': 1,
            'selected_modifiers': []
        }]
    }
    s, new_order = req('/orders/create-pos-order/', order_payload, 'POST')
    assert s == 201, f"POS order placement failed: {new_order}"
    print(f"[PASS] 6. POS Order Creation & Payment (Order #{new_order['order_number']})")

    # 7. KDS Queue & Station Routing
    s, kds = req('/kds/')
    assert s == 200 and len(kds) > 0, "KDS queue check failed"
    print(f"[PASS] 7. Kitchen Display System ({len(kds)} active tickets in queue)")

    # 8. Inventory & Stock Auditing
    s, inv = req('/inventory/')
    assert s == 200 and len(inv) >= 10, "Inventory check failed"
    inv_id = inv[0]['id']
    s, adj = req(f'/inventory/{inv_id}/adjust-stock/', {'adjustment': 50.0}, 'POST')
    assert s == 200, "Stock adjustment failed"
    print(f"[PASS] 8. Stock Control ({len(inv)} raw items, adjusted {inv[0]['name']})")

    # 9. Waste Logging
    s, waste = req('/inventory/log-waste/', {'item_id': inv_id, 'quantity': 5.0, 'reason': 'Audit Waste'}, 'POST')
    assert s == 200 and waste['success'], "Waste logging failed"
    print(f"[PASS] 9. Kitchen Wastage Logging (Recorded 5.0 {inv[0]['unit']})")

    # 10. Delivery Dispatching
    s, deliveries = req('/delivery/')
    assert s == 200, "Delivery check failed"
    print(f"[PASS] 10. Delivery Dispatch Board ({len(deliveries)} dispatches)")

    # 11. Customer Loyalty CRM
    s, crm = req('/customers/')
    assert s == 200 and len(crm) >= 5, "CRM check failed"
    print(f"[PASS] 11. VIP Customer Loyalty CRM ({len(crm)} customer profiles)")

    # 12. Executive BI Dashboard & Financials
    s, bi = req('/reports/bi-summary/')
    s, fin = req('/reports/financial-analytics/')
    assert s == 200 and 'today_revenue' in bi and 'category_sales' in fin, "BI check failed"
    print(f"[PASS] 12. Executive BI & Financial Accounting (Revenue: ${bi['today_revenue']:.2f})")

    print("=" * 60)
    print("   ALL 12 RESTAURANTOS VERIFICATIONS PASSED (100%)")
    print("=" * 60)

if __name__ == '__main__':
    main()
