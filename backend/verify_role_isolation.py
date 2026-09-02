import requests

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("[+] Starting Role-Isolated Workspaces & RBAC Verification...")
    passed = 0
    total = 0

    role_pins = [
        ('ADMIN', '9999', '/owner', 'Marcus Vance'),
        ('MANAGER', '1234', '/manager', 'Elena Rostova'),
        ('CASHIER', '2222', '/cashier', 'Sarah Connor'),
        ('WAITER', '3333', '/captain', 'Antoine Dubois'),
        ('CHEF', '4444', '/chef', 'Marco Rossi'),
        ('DRIVER', '5555', '/driver', 'Ahmed Hassan'),
        ('PACKING', '6666', '/packing', 'Karim Nabil'),
        ('INVENTORY', '7777', '/inventory', 'Tarek Zaki'),
        ('CALL_CENTER', '8888', '/call-center', 'Nour Ali'),
    ]

    for expected_role, pin, expected_path, expected_name in role_pins:
        total += 1
        res = requests.post(f"{BASE_URL}/staff/pin-login/", json={'pin_code': pin})
        if res.status_code == 200:
            data = res.json()
            staff = data.get('staff', {})
            if (staff.get('role') == expected_role and 
                staff.get('role_home_path') == expected_path):
                print(f"  [PASS] PIN {pin} -> Authenticated {staff.get('name')} as {staff.get('role')} -> Home: {staff.get('role_home_path')}")
                passed += 1
            else:
                print(f"  [FAIL] PIN {pin} -> Mismatched role or path: {staff}")
        else:
            print(f"  [FAIL] PIN {pin} -> Status: {res.status_code}")

    # Test role-accounts endpoint
    total += 1
    res = requests.get(f"{BASE_URL}/staff/role-accounts/")
    if res.status_code == 200:
        accounts = res.json()
        if len(accounts) >= 9:
            print(f"  [PASS] Role Accounts Directory: {len(accounts)} accounts configured across all roles")
            passed += 1
        else:
            print(f"  [FAIL] Expected at least 9 role accounts, got {len(accounts)}")
    else:
        print(f"  [FAIL] Role Accounts Directory endpoint returned {res.status_code}")

    print("\n" + "=" * 60)
    print(f"[SUMMARY] Role Isolation Verification: {passed}/{total} Passed")
    print("=" * 60 + "\n")
    return passed == total

if __name__ == '__main__':
    run_tests()
