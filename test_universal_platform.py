import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoint(name, url, method="GET", json_data=None):
    try:
        if method == "GET":
            res = requests.get(url, timeout=5)
        elif method == "POST":
            res = requests.post(url, json=json_data, timeout=5)
        
        if res.status_code in [200, 201]:
            print(f"  [PASS] {name} (Status: {res.status_code})")
            return True, res.json()
        else:
            print(f"  [FAIL] {name} (Status: {res.status_code}) -> {res.text[:100]}")
            return False, None
    except Exception as e:
        print(f"  [ERR] {name} -> {e}")
        return False, None

def run_suite():
    print("[+] Starting UROS Platform API Verification...")
    passed = 0
    total = 0

    # 1. Business Config
    total += 1
    ok, data = test_endpoint("Get Current Business Config", f"{BASE_URL}/business-config/current/")
    if ok and data.get('business_mode'):
        passed += 1

    # 2. Update Feature Flags
    total += 1
    ok, data = test_endpoint("Update Feature Flags", f"{BASE_URL}/business-config/update-flags/", method="POST", json_data={"feature_flags": {"enable_catering": True}})
    if ok and data.get('feature_flags', {}).get('enable_catering') is True:
        passed += 1

    # 3. List Brands
    total += 1
    ok, data = test_endpoint("List Brands", f"{BASE_URL}/brands/")
    if ok and len(data) >= 3:
        passed += 1

    # 4. Brand Portfolio Summary
    total += 1
    ok, data = test_endpoint("Portfolio BI Summary", f"{BASE_URL}/brands/portfolio-summary/")
    if ok and data.get('gross_revenue'):
        passed += 1

    # 5. Catering Events
    total += 1
    ok, data = test_endpoint("List Catering Events", f"{BASE_URL}/catering-events/")
    if ok and len(data) >= 3:
        passed += 1

    # 6. Catering Calendar Stats
    total += 1
    ok, data = test_endpoint("Catering Calendar Stats", f"{BASE_URL}/catering-events/calendar-stats/")
    if ok and data.get('total_events_month'):
        passed += 1

    # 7. Menu Pricing Matrix
    total += 1
    ok, data = test_endpoint("Menu Pricing Matrix", f"{BASE_URL}/menu-pricing-rules/matrix/")
    if ok and len(data) > 0:
        passed += 1

    # 8. Kitchen Expo Assembly
    total += 1
    ok, data = test_endpoint("Kitchen Expo Assembly Orders", f"{BASE_URL}/kitchen-expo/")
    if ok and 'awaiting_items' in data:
        passed += 1

    # 9. System Health Observability
    total += 1
    ok, data = test_endpoint("System Health Observability Telemetry", f"{BASE_URL}/system-health-observability/")
    if ok and data.get('status') == 'HEALTHY':
        passed += 1

    # 10. Universal Tables with Zones & Coursing
    total += 1
    ok, data = test_endpoint("Universal Dining Tables", f"{BASE_URL}/tables/")
    if ok and len(data) > 0 and 'zone' in data[0]:
        passed += 1

    print("\n" + "="*60)
    print(f"[SUMMARY] UROS API Verification: {passed}/{total} Passed")
    print("="*60 + "\n")

if __name__ == '__main__':
    run_suite()
