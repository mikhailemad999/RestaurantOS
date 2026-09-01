import urllib.request
import urllib.parse
import json
import sys

BASE_URL = 'http://127.0.0.1:8000/api'

def check(endpoint, method='GET', payload=None, expected_status=200):
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(payload).encode('utf-8') if payload else None
    headers = {'Content-Type': 'application/json'} if payload else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = json.loads(resp.read().decode('utf-8'))
            if status == expected_status:
                print(f"  [PASS] {method} {endpoint} -> Status {status}")
                return body
            else:
                print(f"  [FAIL] {method} {endpoint} -> Status {status} != {expected_status}")
                return None
    except Exception as e:
        print(f"  [FAIL] {method} {endpoint} -> Exception: {e}")
        return None

def verify_all_enterprise():
    print("=" * 65)
    print("RESTAURANTOS ENTERPRISE & ANALYTICS VERIFICATION SUITE")
    print("=" * 65)

    passed = 0
    total = 0

    endpoints = [
        ('/reports/command-center/', 'GET', None, 200),
        ('/reports/health-score/', 'GET', None, 200),
        ('/reports/menu-engineering/', 'GET', None, 200),
        ('/reports/inventory-forecasting/', 'GET', None, 200),
        ('/reports/daily-brief/', 'GET', None, 200),
        ('/reports/ai-manager-query/', 'POST', {'query': 'What is today food cost?'}, 200),
        ('/branches/', 'GET', None, 200),
        ('/pricing-requests/', 'GET', None, 200),
        ('/suppliers/', 'GET', None, 200),
        ('/purchase-orders/', 'GET', None, 200),
        ('/campaigns/', 'GET', None, 200),
        ('/waitlist/', 'GET', None, 200),
        ('/reservations/', 'GET', None, 200),
        ('/attendance/', 'GET', None, 200),
        ('/approvals/', 'GET', None, 200),
        ('/risk-alerts/', 'GET', None, 200),
        ('/feedback/', 'GET', None, 200),
        ('/targets/', 'GET', None, 200),
        ('/expenses/', 'GET', None, 200),
        ('/recommendations/', 'GET', None, 200),
    ]

    for ep, mth, data, exp in endpoints:
        total += 1
        res = check(ep, method=mth, payload=data, expected_status=exp)
        if res is not None:
            passed += 1

    print("=" * 65)
    print(f"RESULTS: {passed}/{total} Enterprise Endpoints Verified Successfully ({(passed/total)*100:.1f}%)")
    print("=" * 65)
    return passed == total

if __name__ == '__main__':
    ok = verify_all_enterprise()
    sys.exit(0 if ok else 1)
