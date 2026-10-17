# UNBUMI DETECTOR — DETAILED AUDIT FINDINGS

**Product:** UNBUmi Detector (UNLEFT LandGuard)  
**Track:** P3 — Catch Fraud & Double-Selling  
**Audit Date:** October 17, 2026  
**Auditor:** Principal Software Engineer, QA Automation Engineer & AppSec Auditor  

---

## Findings Index

| Finding ID | Severity | Category | Title | Status |
|---|---|---|---|---|
| FND-001 | `HIGH` | Authentication | Premature Token Deletion Invalidating Concurrent Sessions | **RESOLVED** |
| FND-002 | `HIGH` | Authentication | Unvalidated Demo Login Role Defaulting to Reviewer | **RESOLVED** |
| FND-003 | `MEDIUM` | Routing & UX | Missing Dedicated `/settings` Authenticated Route | **RESOLVED** |
| FND-004 | `MEDIUM` | Testing & API | Method Mismatch on Field Correction Endpoint (`POST` vs `PATCH`) | **RESOLVED** |
| FND-005 | `MEDIUM` | Build & Prerender | Next.js 16 Client-side Dynamic Prerendering on Case Detail | **RESOLVED** |
| FND-006 | `LOW` | Rule Engine | Seed Transaction Document Association Causing False Anomaly on Clean Case | **RESOLVED** |
| FND-007 | `INFORMATIONAL` | Infrastructure | Local SQLite vs Production Supabase pgvector Architecture Boundary | **DOCUMENTED** |
| FND-008 | `INFORMATIONAL` | Infrastructure | Kaggle Trained Model Artifact Inference Boundary | **DOCUMENTED** |

---

## Detailed Findings & Resolutions

### FND-001: Premature Token Deletion Invalidating Concurrent Sessions
- **Finding ID:** `FND-001`
- **Severity:** `HIGH`
- **Requirement / Component Affected:** `REQ-AUT-01` (`backend/apps/accounts/models.py`)
- **Reproduction Steps:**
  1. Authenticate user A via `/api/v1/auth/demo-login/` on Tab 1; obtain `token_1`.
  2. Open Tab 2 or another client; authenticate user A again; obtain `token_2`.
  3. Attempt an authenticated request with `token_1` to `/api/v1/me/`.
- **Expected Behavior:** Concurrent browser tabs or sessions for the same reviewer remain valid without forcing an immediate logout of the first session.
- **Actual Behavior:** `DemoToken.generate_token_for_user()` executed `cls.objects.filter(user=user).delete()`, invalidating `token_1` immediately and returning `HTTP 403 Forbidden` (`Invalid or expired demo authentication token`).
- **Root Cause:** Token generation was designed as a single-token singleton rather than allowing multiple active tokens per user.
- **Fix Applied:** Modified `DemoToken.generate_token_for_user()` to issue new token keys without deleting unexpired existing tokens.
- **Retest Result:** **PASS**. Multiple tokens can now be generated and verified concurrently. Retested in `test_live_api.py` and `test_api.py`.

---

### FND-002: Unvalidated Demo Login Role Defaulting to Reviewer
- **Finding ID:** `FND-002`
- **Severity:** `HIGH`
- **Requirement / Component Affected:** `REQ-AUT-02` (`backend/apps/accounts/views.py`)
- **Reproduction Steps:**
  1. Send a POST request to `/api/v1/auth/demo-login/` with `{"role": "unauthorized_role_xyz"}`.
- **Expected Behavior:** API rejects invalid roles with `HTTP 400 Bad Request` and an explicit list of allowed demo roles.
- **Actual Behavior:** API silently caught the missing role in dictionary lookup and defaulted to `reviewer@unleft.org`, logging the user in as `demo_reviewer`.
- **Root Cause:** Missing explicit validation check against `role_map` in `DemoLoginView.post()`.
- **Fix Applied:** Added role validation in `DemoLoginView`:
  ```python
  if role and role not in role_map and not email:
      return Response(
          {'error': f'অকার্যকর ভূমিকা (Invalid demo role: {role}). অনুমোদিত ভূমিকা: {", ".join(role_map.keys())}'},
          status=status.HTTP_400_BAD_REQUEST
      )
  ```
- **Retest Result:** **PASS**. Negative test in `test_live_api.py` (Step 3) and `test_api.py` (`test_demo_login_invalid_role`) confirmed `HTTP 400 Bad Request`.

---

### FND-003: Missing Dedicated `/settings` Authenticated Route
- **Finding ID:** `FND-003`
- **Severity:** `MEDIUM`
- **Requirement / Component Affected:** `REQ-FND-11` (`frontend/app/settings/page.tsx`, `frontend/components/Navbar.tsx`)
- **Reproduction Steps:**
  1. Inspect frontend route structure in `frontend/app/`.
  2. Attempt navigation to `http://localhost:3000/settings`.
- **Expected Behavior:** Dedicated settings page exists allowing users to view profile details, switch demo roles, toggle visual theme, and trigger demo database resets.
- **Actual Behavior:** Route returned `HTTP 404 Not Found`.
- **Root Cause:** Route had not been implemented during initial route scaffold.
- **Fix Applied:**
  1. Created `frontend/app/settings/page.tsx` with user profile information, instant role switcher (`demo_reviewer`, `demo_supervisor`, `demo_admin`), color palette standards, database diagnostics, and demo re-seed action.
  2. Integrated settings links in `Navbar.tsx` (desktop profile badge & mobile drawer).
- **Retest Result:** **PASS**. Next.js production build compiled `/settings` with zero errors; HTTP 200 (41KB) observed in live testing.

---

### FND-004: Method Mismatch on Field Correction Endpoint
- **Finding ID:** `FND-004`
- **Severity:** `MEDIUM`
- **Requirement / Component Affected:** `REQ-OCR-02` (`backend/apps/documents/views.py`)
- **Reproduction Steps:**
  1. Send a `POST` request to `/api/v1/documents/{id}/fields/` with correction payload.
- **Expected Behavior:** Document field corrections follow standard REST conventions (`PATCH` for partial update) and API documentation matches implementation.
- **Actual Behavior:** Backend implemented `PATCH` for field corrections, returning `HTTP 405 Method Not Allowed` when callers attempted `POST`.
- **Root Cause:** Specification ambiguity between POST vs PATCH for sub-resource field corrections.
- **Fix Applied:** Standardized on `PATCH /api/v1/documents/{id}/fields/` across `frontend/lib/api.ts` (`correctField`), `test_live_api.py`, and `test_api.py`.
- **Retest Result:** **PASS**. Both live script and automated Django tests execute `PATCH` and confirm field update to `status='corrected'` with audit event logging.

---

### FND-005: Next.js 16 Dynamic Prerendering on Case Detail
- **Finding ID:** `FND-005`
- **Severity:** `MEDIUM`
- **Requirement / Component Affected:** `REQ-FND-07` (`frontend/app/cases/[id]/page.tsx`)
- **Reproduction Steps:**
  1. Run `npm run build` on Next.js 16.4.x without dynamic route configuration.
- **Expected Behavior:** Dynamic route `/cases/[id]` compiles cleanly without build-time prerendering failures.
- **Actual Behavior:** Next.js static prerender worker threw dynamic server usage error due to client parameter resolution.
- **Root Cause:** Next.js 16 Turbopack strictly requires `export const dynamic = 'force-dynamic'` or static parameter generators for dynamic App Router segments accessing server state.
- **Fix Applied:** Added `export const dynamic = 'force-dynamic'` and `React.use(params)` unwrapping in `frontend/app/cases/[id]/page.tsx`.
- **Retest Result:** **PASS**. `npm run build` completed successfully in 1097ms with all 17 routes rendered.

---

### FND-006: Seed Transaction Document Association Causing False Anomaly on Clean Case
- **Finding ID:** `FND-006`
- **Severity:** `LOW`
- **Requirement / Component Affected:** `REQ-DAT-02`, `REQ-RUL-05` (`backend/services/seed_service.py`)
- **Reproduction Steps:**
  1. Run seed script `python manage.py seed_demo`.
  2. Inspect Case 1 (`UB-2026-1001` - clean transfer scenario).
- **Expected Behavior:** Case 1 evaluates as clean (Risk Score: 0, Low Risk, zero anomaly findings).
- **Actual Behavior:** Rule P001 flagged Case 1 because deed transactions were not linked to the case's source document, causing the rule engine to interpret the transaction as a competing transfer from an outside case.
- **Root Cause:** `DeedTransaction.objects.create()` was called without assigning `source_document=doc`.
- **Fix Applied:** Linked `source_document=deed_doc` in `seed_service.py` so the rule engine correctly recognizes the transaction as belonging to the current case.
- **Retest Result:** **PASS**. Case 1 evaluates with 0 anomalies, clean status, and low risk score.

---

### FND-007: Local SQLite vs Production Supabase pgvector Architecture Boundary
- **Finding ID:** `FND-007`
- **Severity:** `INFORMATIONAL`
- **Requirement / Component Affected:** `REQ-ARC-03`, `REQ-RAG-01` (`backend/config/settings.py`)
- **Observation:** For developer convenience and local zero-dependency testing, the local backend defaults to SQLite (`db.sqlite3`). When `DATABASE_URL` is provided (pointing to Supabase PostgreSQL), Django switches to `django.db.backends.postgresql`. The `pgvector` extension is architecturally designed for embedding retrieval, while local verification uses deterministic rules and NetworkX graph traversal.
- **Status:** **DOCUMENTED & LABELED AS PARTIAL / ADAPTER BOUNDARY**. Local testing does not claim live Supabase pgvector execution; production connection settings are documented in `README.md`.

---

### FND-008: Kaggle Trained Model Artifact Inference Boundary
- **Finding ID:** `FND-008`
- **Severity:** `INFORMATIONAL`
- **Requirement / Component Affected:** `REQ-OCR-03` (`backend/services/ocr_service.py`)
- **Observation:** In accordance with the specification, model training is conducted on Kaggle and exported artifacts are used for deployed inference. In local development, `OCRService` uses a structured synthetic extraction adapter to avoid requiring a live Kaggle GPU notebook during routine audits.
- **Status:** **DOCUMENTED & LABELED AS PARTIAL / ADAPTER BOUNDARY**.
