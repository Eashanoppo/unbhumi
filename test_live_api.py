import urllib.request
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
BASE_URL = "http://127.0.0.1:8000/api/v1"

def request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        error_content = e.read().decode("utf-8")
        try:
            parsed = json.loads(error_content)
        except Exception:
            parsed = {"raw": error_content}
        return e.code, parsed

def main():
    print("=== LIVE API VERIFICATION BATTERY ===")
    
    # 1. Health Check
    status, res = request("/health/")
    print(f"[1] Health Check: status={status}, db={res.get('database')}, service={res.get('service')}")
    assert status == 200, f"Expected 200, got {status}"
    
    # 2. Demo Login (Positive)
    status, res = request("/auth/demo-login/", method="POST", data={"role": "demo_reviewer"})
    print(f"[2] Demo Login: status={status}, success={res.get('success')}, user={res.get('user', {}).get('username')}")
    assert status == 200 and res.get("success"), "Login failed"
    token = res.get("token")
    
    # 3. Demo Login (Negative/Invalid role test)
    status, res = request("/auth/demo-login/", method="POST", data={"role": "invalid_unknown_role"})
    print(f"[3] Negative Login Test: status={status}, error={res.get('error')}")
    assert status == 400, f"Expected 400 Bad Request, got {status}"
    
    # 4. Auth Me
    status, res = request("/me/", token=token)
    user_info = res.get("user", {})
    print(f"[4] Auth Me: status={status}, authenticated={res.get('authenticated')}, username={user_info.get('username')}")
    assert status == 200 and res.get("authenticated") is True
    
    # 5. Dashboard Summary
    status, res = request("/dashboard/summary/", token=token)
    metrics = res.get("metrics", {})
    print(f"[5] Dashboard Summary: status={status}, total_cases={metrics.get('total_cases')}, flagged_cases={metrics.get('flagged_cases')}")
    assert status == 200 and metrics.get("total_cases", 0) > 0
    
    # 6. Case List
    status, cases = request("/cases/", token=token)
    print(f"[6] Case List: status={status}, count={len(cases)}")
    assert status == 200 and len(cases) >= 8
    
    # 7. Case Detail UB-2026-1002 (Potential Double-Selling)
    status, c2 = request("/cases/UB-2026-1002/", token=token)
    anomalies = c2.get("anomalies", [])
    print(f"[7] Case Detail UB-2026-1002: status={status}, risk_level={c2.get('risk_level')}, score={c2.get('risk_score')}, findings={len(anomalies)}")
    assert status == 200 and len(anomalies) >= 1
    
    # 8. Case Run Checks
    status, run_res = request("/cases/UB-2026-1002/run-checks/", method="POST", token=token)
    case_data = run_res.get("case", {})
    anomalies_data = run_res.get("anomalies", [])
    print(f"[8] Run Checks UB-2026-1002: status={status}, findings_count={len(anomalies_data)}, score={case_data.get('risk_score')}")
    assert status == 200 and len(anomalies_data) >= 1
    
    # 9. Case Graph UB-2026-1002 (Double Selling Graph with Competing Paths)
    status, graph2 = request("/cases/UB-2026-1002/graph/", token=token)
    has_conflicting = graph2.get("metrics", {}).get("has_conflicting_paths")
    conflict_edges = graph2.get("metrics", {}).get("conflict_edges")
    print(f"[9] Graph UB-2026-1002: status={status}, nodes={len(graph2.get('nodes', []))}, edges={len(graph2.get('edges', []))}, has_conflicting={has_conflicting}, conflict_edges={conflict_edges}")
    assert status == 200 and has_conflicting is True and conflict_edges >= 1
    
    # 10. Case Detail UB-2026-1003 (Broken Ownership Chain)
    status, c3 = request("/cases/UB-2026-1003/", token=token)
    print(f"[10] Case Detail UB-2026-1003: status={status}, risk_level={c3.get('risk_level')}, score={c3.get('risk_score')}, findings={len(c3.get('anomalies', []))}")
    assert status == 200 and len(c3.get("anomalies", [])) >= 1
    
    # 11. Documents List
    status, docs = request("/documents/", token=token)
    print(f"[11] Documents List: status={status}, count={len(docs)}")
    assert status == 200 and len(docs) >= 8
    
    # 12. Document Detail
    doc_id = docs[0]["id"]
    status, doc = request(f"/documents/{doc_id}/", token=token)
    fields = doc.get("extracted_fields", [])
    print(f"[12] Document Detail #{doc_id}: status={status}, title={doc.get('title')}, fields={len(fields)}")
    assert status == 200
    
    # 13. Extracted Field Correction (PATCH)
    if fields:
        field_key = fields[0]["field_key"]
        status, edit_res = request(f"/documents/{doc_id}/fields/", method="PATCH", data={
            "field_key": field_key,
            "corrected_value": "আকবর আলী (সংশোধিত)"
        }, token=token)
        print(f"[13] Field Correction: status={status}, field_key={edit_res.get('field_key')}, corrected_val={edit_res.get('corrected_value')}")
        assert status == 200 and edit_res.get("status") == "corrected"
    
    # 14. Rules Catalogue
    status, rules = request("/rules/", token=token)
    print(f"[14] Rules Catalogue: status={status}, count={len(rules)}")
    assert status == 200 and len(rules) == 12
    
    # 15. Alerts Queue
    status, alerts = request("/alerts/", token=token)
    print(f"[15] Alerts Queue: status={status}, count={len(alerts)}")
    assert status == 200 and len(alerts) >= 1
    
    # 16. Alert Reviewer Disposition
    first_alert = alerts[0]
    status, disp_res = request(f"/alerts/{first_alert['id']}/disposition/", method="POST", data={
        "decision": "confirmed_inconsistency",
        "reason_bn": "নিরীক্ষক কর্তৃক দলিল ও খতিয়ানের তথ্যের অমিল যাচাইকৃত।"
    }, token=token)
    updated_finding = disp_res.get("finding", {})
    print(f"[16] Alert Disposition: status={status}, updated_status={updated_finding.get('status')}, decision_id={disp_res.get('decision_id')}")
    assert status == 200 and updated_finding.get("status") == "confirmed_inconsistency"
    
    # 17. Report Generation Endpoint
    status, rep = request("/cases/UB-2026-1002/report/", token=token)
    print(f"[17] Case Report UB-2026-1002: status={status}, report_id={rep.get('report_id')}, disclaimer_present={'disclaimer' in rep}")
    assert status == 200 and "disclaimer" in rep and rep.get("report_id") == "REP-UB-2026-1002"
    
    print("\n>>> ALL 17 ENDPOINTS VERIFIED AND PASSING WITH ACTUAL HTTP RESPONSES! <<<")

if __name__ == "__main__":
    main()
