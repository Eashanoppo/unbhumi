# UNBHUMI DETECTOR — TEST EXECUTION & VERIFICATION REPORT

**Document:** `docs/TESTING.md`  
**Test Date:** October 2026  
**Auditor / QA Engineer:** Automated Systems & E2E Validation

---

## 1. Test Execution Commands & Results

### 1.1 Backend Unit & Integration Tests
- **Command:**
  ```bash
  python backend/manage.py test tests
  ```
- **Output:**
  ```
  Found 12 test(s).
  Creating test database for alias 'default'...
  System check identified no issues (0 silenced).
  ............
  ----------------------------------------------------------------------
  Ran 12 tests in 13.485s

  OK
  Destroying test database for alias 'default'...
  ```
- **Result:** **12/12 PASSED (100% Success)**
- **Test Scenarios Exercised:**
  - `test_demo_login_reviewer`: Demo authentication token generation and permissions.
  - `test_seed_demo_service`: Successful seeding of 8 synthetic cases and parcel records.
  - `test_dashboard_summary_api`: Calculation of status and risk distributions.
  - `test_case_list_filtering`: Filtering cases by risk, status, and search query.
  - `test_case_detail_api`: Retrieving case metadata, parcel info, documents, and anomalies.
  - `test_rule_engine_clean_case`: Verifying `UB-2026-1001` evaluates with zero critical anomalies.
  - `test_double_sale_detected`: Verifying `UB-2026-1002` triggers `P001` (Potential double-selling).
  - `test_broken_chain_detected`: Verifying `UB-2026-1003` triggers `O001` (Broken title chain).
  - `test_deed_khatian_mismatch`: Verifying `UB-2026-1004` triggers `K001` (Seller vs owner mismatch).
  - `test_graph_construction`: Building and persisting NetworkX nodes, edges, and conflict paths.
  - `test_document_field_correction`: Reviewer manual correction of extracted OCR field.
  - `test_reviewer_disposition`: Submitting reviewer adjudications and logging audit events.

---

### 1.2 Frontend Production Build
- **Command:**
  ```bash
  npm run build
  ```
- **Output:**
  ```
  ▲ Next.js 16.4.2 (Turbopack)
  ✓ Running next.config.ts took 50ms
  Creating an optimized production build ...
  ✓ Compiled successfully in 1322ms
  Running TypeScript ...
  Finished TypeScript in 2.7s ...
  Collecting page data using 11 workers ...
  ✓ Generating static pages using 11 workers (18/18) in 674ms
  Finalizing page optimization ...

  Route (app)
  ┌ ○ /
  ├ ○ /_not-found
  ├ ○ /about
  ├ ○ /cases
  ├ ƒ /cases/[id]
  ├ ○ /dashboard
  ├ ○ /demo
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
- **Result:** **18/18 Routes Compiled Cleanly (0 TypeScript / Build Errors)**

---

### 1.3 Localization Quality & Parity Audit
- **Command:**
  ```bash
  node test_localization.js
  ```
- **Output:**
  ```
  ======================================================
   UNLEFT LANDGUARD (UNBUMI DETECTOR) - LOCALIZATION AUDIT
   Total translation keys identified: 444
  ======================================================

  ✔ PASS: All 444 keys possess verified Bangla ('bn') translations.
  ✔ PASS: All 444 keys possess verified English ('en') translations.
  ✔ PASS: Numeral conversion unit tests passed (0-9 -> ০-৯).

  ✔ SUCCESS: 100% Key Parity & Formatter Rules Confirmed!
  ```
- **Result:** **444 Keys Verified with 100% Parity across Bengali and English**

---

### 1.4 Browser End-to-End Workflow Verification
- **Target URL:** `http://localhost:3000/demo`
- **Actions Tested:**
  1. Loaded Interactive Demo Mode workspace.
  2. Verified scenario selector cards (`UB-2026-1001` through `1004`).
  3. Inspected Built-in Demo File Manager with sample synthetic land documents.
  4. Opened and closed Document Preview Modal displaying rendered deed sheet with non-judicial stamps and OCR bounding boxes.
  5. Tested bulk addition (`Add All to Workspace`) and workspace file removal.
  6. Triggered "Run Verification Pipeline" (`যাচাই পাইপলাইন চালু করুন`).
  7. Observed 6 stages executing sequentially (Intake $\to$ Hash $\to$ OCR $\to$ Normalization $\to$ Rule Engine $\to$ Graph).
  8. Clicked Stage Inspector on Stage 5 (Rule Engine) and Stage 6 (Graph) to verify raw JSON artifacts and algorithm provenance disclosures.
  9. Switched across result tabs: Anomalies, Ownership Graph, Extracted Fields, and Investigation Report.
  10. Tested scenario switching and clean demo reset.

---

## 2. Environmental Limitations & Disclosed Boundaries

1. **Government Land Registry Integration:**
   - Real-world verification against official servers (`land.gov.bd` / `minland.gov.bd`) requires confidential ministerial credentials and internal Bangladesh government intranet access not available in public competition sandboxes.
2. **Heavy GPU OCR Infrastructure:**
   - Deployed environment runs on CPU architecture. OCR extraction uses high-fidelity precomputed layout bounding boxes and confidence metrics for deterministic reproducibility while running cryptographic hashing and rule engine checks live.
