import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("[+] Starting Smart Printer Routing & Station Screen Verification...")
    tests_passed = 0
    total_tests = 0

    def test(name, url, method="GET", payload=None):
        nonlocal tests_passed, total_tests
        total_tests += 1
        try:
            headers = {"Content-Type": "application/json"}
            data = json.dumps(payload).encode("utf-8") if payload is not None else None
            req = urllib.request.Request(f"{BASE_URL}{url}", data=data, headers=headers, method=method)
            with urllib.request.urlopen(req) as resp:
                status = resp.status
                body = json.loads(resp.read().decode("utf-8"))
                if status in (200, 201):
                    print(f"  [PASS] {name} (Status: {status})")
                    tests_passed += 1
                    return body
                else:
                    print(f"  [FAIL] {name} (Unexpected status: {status})")
        except Exception as e:
            print(f"  [FAIL] {name}: {str(e)}")
        return None

    # Test 1: Kitchen Stations
    stations = test("1. List Kitchen Stations", "/kitchen-stations/")
    assert stations and len(stations) >= 6, f"Expected at least 6 stations, got {len(stations) if stations else 0}"

    # Test 2: Station Tickets
    tix = test("2. Get Active Station Tickets (ALL)", "/kitchen-stations/tickets/?station=ALL")
    assert isinstance(tix, list), "Expected list of tickets"

    # Test 3: Specific Station Tickets
    grill_tix = test("3. Get Station Tickets for GRILL", "/kitchen-stations/tickets/?station=GRILL")
    assert isinstance(grill_tix, list), "Expected list of tickets"

    # Test 4: Printers Fleet
    printers = test("4. List Printers Fleet", "/printers/")
    assert printers and len(printers) >= 5, f"Expected at least 5 printers, got {len(printers) if printers else 0}"

    # Test 5: Fleet Summary
    summary = test("5. Fleet Health Summary", "/printers/fleet-summary/")
    assert summary and "total_printers" in summary, "Expected fleet summary metrics"

    # Test 6: Routing Rules
    rules = test("6. List Printer Routing Rules", "/printer-routing-rules/")
    assert rules and len(rules) >= 5, f"Expected at least 5 routing rules, got {len(rules) if rules else 0}"

    # Test 7: Route Simulation (Station Level)
    sim_station = test("7. Simulate Station Route (PIZZA)", "/printer-routing-rules/simulate/", method="POST", payload={"station_code": "PIZZA"})
    assert sim_station and sim_station.get("primary_printer"), "Expected resolved primary printer for PIZZA"
    print(f"     -> Resolved Primary: {sim_station['primary_printer']['name']}")

    # Test 8: Route Simulation (Grill Station)
    sim_grill = test("8. Simulate Station Route (GRILL)", "/printer-routing-rules/simulate/", method="POST", payload={"station_code": "GRILL"})
    assert sim_grill and sim_grill.get("primary_printer"), "Expected resolved primary printer for GRILL"
    print(f"     -> Resolved Primary: {sim_grill['primary_printer']['name']}")

    # Test 9: Test Print Sequence
    printer_id = printers[0]["id"]
    test_print = test(f"9. Trigger Test Print (Printer #{printer_id})", f"/printers/{printer_id}/test-print/", method="POST", payload={})
    assert test_print and test_print.get("success"), "Expected successful test print response"
    print(f"     -> Job Number: {test_print['job_number']}")

    # Test 10: Toggle Printer Status
    toggled = test(f"10. Toggle Printer Status (#{printer_id})", f"/printers/{printer_id}/toggle-status/", method="POST", payload={"status": "OFFLINE"})
    assert toggled and toggled.get("status") == "OFFLINE", "Expected printer status to be OFFLINE"

    # Re-enable printer to keep system healthy
    test(f"10b. Restore Printer Status (#{printer_id})", f"/printers/{printer_id}/toggle-status/", method="POST", payload={"status": "ONLINE"})

    # Test 11: Print Jobs Queue
    jobs = test("11. List Print Jobs Queue", "/print-jobs/")
    assert isinstance(jobs, list) or (isinstance(jobs, dict) and "results" in jobs), "Expected print jobs list"

    print("\n" + "="*60)
    print(f"[SUMMARY] Verification Complete: {tests_passed}/{total_tests} Tests Passed")
    print("="*60)

    if tests_passed == total_tests:
        return 0
    return 1

if __name__ == "__main__":
    sys.exit(run_tests())
