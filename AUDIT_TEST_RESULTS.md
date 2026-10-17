# UNBUMI DETECTOR — ACTUAL TEST EXECUTION RESULTS

**Product:** UNBUmi Detector (UNLEFT LandGuard)  
**Track:** P3 — Catch Fraud & Double-Selling  
**Audit Date:** October 17, 2026  
**Operating Environment:** Windows 11 (64-bit), Python 3.14.2, Node.js v24.13.0, npm 11.6.2  

---

## Command Execution Summary

| # | Command Executed | Working Directory | Exit Code | Observed Output Summary | Verification Status |
|---|---|---|---|---|---|
| 1 | `python manage.py check` | `d:\UnBhumi` | `0` | System check identified no issues (0 silenced). | **PASS** |
| 2 | `python manage.py seed_demo` | `d:\UnBhumi` | `0` | Initialized 12 rules, 8 cases (`UB-2026-1001` - `1008`), 16 documents. | **PASS** |
| 3 | `python manage.py test tests` | `d:\UnBhumi` | `0` | Ran 12 automated unit/integration tests in 11.514s; all tests passed. | **PASS** |
| 4 | `python test_live_api.py` | `d:\UnBhumi` | `0` | 17 live REST API endpoints verified over HTTP with token auth. | **PASS** |
| 5 | `npm run build` | `d:\UnBhumi\frontend` | `0` | Next.js 16.4.2 compiled 17 static & dynamic routes in 1097ms; TS pass. | **PASS** |
| 6 | Frontend Route Battery (Python HTTP) | `d:\UnBhumi` | `0` | 14 public & authenticated routes + dynamic `/cases/[id]` returned HTTP 200. | **PASS** |
| 7 | Browser Subagent E2E Visual Verification | Browser Session | `0` | Verified landing, dashboard, case detail, graph SVG, theme, mobile. | **PASS** |

---

## Detailed Command Logs & Traces

### 1. Django System Checks
- **Command:** `python manage.py check`
- **Working Directory:** `d:\UnBhumi`
- **Exit Code:** `0`
- **Output:**
  ```text
  System check identified no issues (0 silenced).
  ```

---

### 2. Database Seeding Execution
- **Command:** `python manage.py seed_demo`
- **Working Directory:** `d:\UnBhumi`
- **Exit Code:** `0`
- **Output Trace:**
  ```text
  [SeedService] Rules catalogue verified: 12 rules active.
  [SeedService] Case UB-2026-1001 (Clean Transfer) initialized.
  [SeedService] Case UB-2026-1002 (Potential Double-Selling) initialized.
  [SeedService] Case UB-2026-1003 (Broken Ownership Chain) initialized.
  [SeedService] Case UB-2026-1004 (Deed-Khatian Record Contradiction) initialized.
  [SeedService] Case UB-2026-1005 (Sold Area Exceeds Recorded Area) initialized.
  [SeedService] Case UB-2026-1006 (Duplicate Digital File Hash) initialized.
  [SeedService] Case UB-2026-1007 (Boundary & Map Description Contradiction) initialized.
  [SeedService] Case UB-2026-1008 (Low OCR Extraction Quality Safeguard) initialized.
  Successfully seeded 8 cases, 16 documents, and 12 rules.
  ```

---

### 3. Automated Backend Test Suite
- **Command:** `python manage.py test tests`
- **Working Directory:** `d:\UnBhumi`
- **Exit Code:** `0`
- **Execution Time:** 11.514 seconds
- **Output Trace:**
  ```text
  Found 12 test(s).
  Creating test database for alias 'default'...
  System check identified no issues (0 silenced).
  ............
  ----------------------------------------------------------------------
  Ran 12 tests in 11.514s

  OK
  Destroying test database for alias 'default'...
  ```
- **Tests Executed:**
  1. `test_health_check`: Validates `/api/v1/health/` returns `status=healthy`, `database=connected`.
  2. `test_demo_login_success`: Validates `/api/v1/auth/demo-login/` returns token and user payload.
  3. `test_demo_login_invalid_role`: Validates unknown roles return HTTP 400 Bad Request.
  4. `test_auth_me_with_token`: Validates authenticated token header retrieves active session.
  5. `test_dashboard_summary`: Validates metrics payload (total cases = 8, total docs >= 8).
  6. `test_case_list_and_filter`: Validates case listing and `?risk=high` filtering.
  7. `test_case_detail_and_graph`: Validates case detail, anomaly presence, and NetworkX graph generation.
  8. `test_run_checks_endpoint`: Validates `/run-checks/` re-evaluates all 12 deterministic rules.
  9. `test_field_correction_patch`: Validates `PATCH /documents/{id}/fields/` updates field value and audit event.
  10. `test_alert_disposition`: Validates reviewer disposition recording and status update.
  11. `test_rules_catalogue`: Validates 12 rules present in `/api/v1/rules/`.
  12. `test_case_report_export`: Validates report generation with metadata, anomalies, and disclaimer.

---

### 4. Live REST API Verification Battery (`test_live_api.py`)
- **Command:** `python test_live_api.py`
- **Target Server:** `http://127.0.0.1:8000/api/v1`
- **Exit Code:** `0`
- **Actual Output:**
  ```text
  === LIVE API VERIFICATION BATTERY ===
  [1] Health Check: status=200, db=connected, service=UNBUmi Detector API
  [2] Demo Login: status=200, success=True, user=reviewer
  [3] Negative Login Test: status=400, error=অকার্যকর ভূমিকা (Invalid demo role: invalid_unknown_role). অনুমোদিত ভূমিকা: demo_reviewer, demo_supervisor, demo_admin
  [4] Auth Me: status=200, authenticated=True, username=reviewer
  [5] Dashboard Summary: status=200, total_cases=8, flagged_cases=None
  [6] Case List: status=200, count=8
  [7] Case Detail UB-2026-1002: status=200, risk_level=review, score=40, findings=1
  [8] Run Checks UB-2026-1002: status=200, findings_count=1, score=40
  [9] Graph UB-2026-1002: status=200, nodes=8, edges=8, has_conflicting=True, conflict_edges=2
  [10] Case Detail UB-2026-1003: status=200, risk_level=high, score=55, findings=2
  [11] Documents List: status=200, count=16
  [12] Document Detail #90: status=200, title=আরএস খতিয়ান (দাগ ১৮০), fields=1
  [13] Field Correction: status=200, field_key=recorded_owner, corrected_val=আকবর আলী (সংশোধিত)
  [14] Rules Catalogue: status=200, count=12
  [15] Alerts Queue: status=200, count=11
  [16] Alert Disposition: status=200, updated_status=confirmed_inconsistency, decision_id=3
  [17] Case Report UB-2026-1002: status=200, report_id=REP-UB-2026-1002, disclaimer_present=True

  >>> ALL 17 ENDPOINTS VERIFIED AND PASSING WITH ACTUAL HTTP RESPONSES! <<<
  ```

---

### 5. Frontend Production Build & Type Check
- **Command:** `npm run build`
- **Working Directory:** `d:\UnBhumi\frontend`
- **Exit Code:** `0`
- **Actual Output:**
  ```text
  > frontend@0.1.0 build
  > next build

  ▲ Next.js 16.4.2 (Turbopack)
  ✓ Running next.config.ts took 44ms

    Creating an optimized production build ...
  ✓ Compiled successfully in 1097ms
    Running TypeScript ...
    Finished TypeScript in 2.3s ...
    Collecting page data using 11 workers ...
    Generating static pages using 11 workers (0/17) ...
    Generating static pages using 11 workers (4/17) 
    Generating static pages using 11 workers (8/17) 
    Generating static pages using 11 workers (12/17) 
  ✓ Generating static pages using 11 workers (17/17) in 618ms
    Finalizing page optimization ...

  Route (app)
  ┌ ○ /
  ├ ○ /_not-found
  ├ ○ /about
  ├ ○ /cases
  ├ ƒ /cases/[id]
  ├ ○ /dashboard
  ├ ○ /documents
  ├ ○ /documents/new
  ├ ○ /login
  ├ ○ /methodology
  ├ ○ /ownership-graph
  ├ ○ /privacy
  ├ ○ /reports
  ├ ○ /review-queue
  ├ ○ /settings
  └ ○ /terms

  ○  (Static)   prerendered as static content
  ƒ  (Dynamic)  server-rendered on demand
  ```

---

### 6. Frontend Route Availability Check
- **Target Server:** `http://localhost:3000`
- **Exit Code:** `0`
- **Route Statuses:**
  - `GET /` -> HTTP 200 (58,677 bytes)
  - `GET /dashboard` -> HTTP 200 (29,403 bytes)
  - `GET /cases` -> HTTP 200 (32,800 bytes)
  - `GET /cases/UB-2026-1002` -> HTTP 200 (30,112 bytes)
  - `GET /documents` -> HTTP 200 (31,873 bytes)
  - `GET /documents/new` -> HTTP 200 (41,921 bytes)
  - `GET /review-queue` -> HTTP 200 (30,561 bytes)
  - `GET /ownership-graph` -> HTTP 200 (33,178 bytes)
  - `GET /reports` -> HTTP 200 (28,557 bytes)
  - `GET /settings` -> HTTP 200 (41,355 bytes)
  - `GET /about` -> HTTP 200 (37,110 bytes)
  - `GET /methodology` -> HTTP 200 (42,533 bytes)
  - `GET /login` -> HTTP 200 (33,708 bytes)
  - `GET /privacy` -> HTTP 200 (32,957 bytes)
  - `GET /terms` -> HTTP 200 (32,760 bytes)

---

### 7. Browser Subagent Visual & Responsive Audit
- **Artifacts Recorded:**
  - Recording Video: `unbhumi_audit_browser_1792251710096.webp`
  - Screenshots:
    1. `landing_page_1792251721442.png` (Bangla default landing page, cream & parrot green)
    2. `english_landing_1792251726861.png` (English toggle verification)
    3. `dark_mode_landing_1792251732109.png` (Dark theme verification)
    4. `dashboard_page_1792251741973.png` (Dashboard metrics & cases table)
    5. `case_detail_page_1792251753831.png` (Case detail, findings & risk badges)
    6. `case_ownership_graph_1792251759489.png` (Interactive SVG graph & table)
    7. `case_document_preview_1792251765804.png` (Document preview & OCR confidence)
    8. `mobile_viewport_case_1792251772319.png` (390px mobile responsiveness)

---

## Skipped or Blocked Tests (Documented Environment Constraints)
1. **Google OAuth 2.0 Live Sign-In:** Skipped because live Google Cloud OAuth credentials and redirect URIs require a public internet domain. Local tests use the verified `DemoTokenAuthentication` mechanism with role-based identities.
2. **Supabase pgvector Remote Extension:** Skipped live cloud round-trip because local testing is isolated from external cloud databases. The application runs against local SQLite with dual-database abstraction verifying all schemas and relationships.
3. **Kaggle GPU Inference Runner:** Skipped live notebook runtime because production architecture utilizes exported model artifacts and local deterministic rule evaluation rather than requiring a cloud GPU connection during inference.
