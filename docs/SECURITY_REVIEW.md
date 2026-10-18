# UNBHUMI — Application Security & Privacy Review

**Platform:** UNBHUMI by UNLEFT (LandGuard)  
**Security Scope:** End-to-end audit covering Authentication, Authorization, File Intake & Storage, Data Isolation, Privacy/PII, and Environment Hardening.  
**Classification:** Internal AppSec Engineering Review  

---

## 1. Threat Model & Key Assets

| Asset | Sensitivity | Threat Vector | Mitigation |
|---|---|---|---|
| **Uploaded Deeds & Land Documents** | High (PII, ownership disputes) | Public enumeration, path traversal, unauthorized download | UUID storage keys, private directory, case-scoped auth checks |
| **National ID / Citizen Identifiers** | Critical (Identity theft risk) | Exposure in plain text logs or vector database | Synthetic data only in prototype; PII masking in chunking pipeline |
| **Case Findings & Risk Scores** | High (Reputational, commercial impact) | IDOR parameter tampering across case numbers | Case-scoped object-level authorization (`IsCaseAuthorized`) |
| **Authentication Tokens** | High (Session takeover) | Insecure token generation, role forgery | Role validation on login; token revocation on logout |
| **System Audit Trail** | High (Tampering with review logs) | Unauthorized log modification or deletion | Append-only `AuditEvent` model, no public update endpoint |

---

## 2. Vulnerability Review & Applied Remediations

### SEC-01: Insecure Default Permissions (Resolved)
- **Vulnerability:** `REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES']` was set to `AllowAny`, allowing unauthenticated clients to patch case statuses, trigger check re-runs, and delete documents.
- **Remediation:** 
  - Standardized on `DemoTokenAuthentication` + `SessionAuthentication`.
  - Implemented `IsCaseAuthorized` permission class enforcing that callers must be authenticated and assigned to or authorized for the requested case.
  - Restricted state-mutating actions (disposition, status update, document upload) to verified roles.

### SEC-02: File Upload Validation & Path Traversal (Resolved)
- **Vulnerability:** Files were uploaded using client-supplied filenames without checking file magic bytes or MIME types.
- **Remediation:**
  - Implemented `validate_file_upload(file_obj)` in `backend/services/storage_service.py`.
  - Enforced 15 MB file size limit.
  - Whitelisted extensions: `.pdf`, `.png`, `.jpg`, `.jpeg`.
  - Inspected initial file magic bytes (`%PDF`, `\x89PNG`, `\xFF\xD8\xFF`).
  - Generated cryptographically random storage keys (`uuid4().hex`) instead of preserving raw user paths.

### SEC-03: Unrestricted Document File Download (Resolved)
- **Vulnerability:** `DEBUG` mode served `media/` statically to anyone with the URL path.
- **Remediation:**
  - Added authorized streaming endpoint `GET /api/v1/documents/{id}/file/` verifying user permissions before serving document bytes.
  - Placed production uploads outside public web roots (`media/documents/private/`).

### SEC-04: Role Forgery on Demo Authentication (Resolved)
- **Vulnerability:** Arbitrary role strings passed to `/auth/demo-login/` previously defaulted silently to reviewer permissions.
- **Remediation:**
  - Enforced strict whitelist validation against allowed roles (`demo_reviewer`, `demo_supervisor`, `demo_admin`).
  - Returns `400 Bad Request` with an explicit error message on unrecognized roles.

### SEC-05: Destructive Demo Operations in Production (Resolved)
- **Vulnerability:** `/api/v1/seed-demo/` resets the database and seeds synthetic data; if called in production, it would destroy user data.
- **Remediation:**
  - Enforced check on `settings.DEMO_MODE`. If `DEMO_MODE=False`, `/seed-demo/` immediately returns `403 Forbidden`.

### SEC-06: Privacy & PII Handling in Vector Chunks & Logs (Resolved)
- **Vulnerability:** Raw OCR text may contain citizen NID numbers, phone numbers, and addresses.
- **Remediation:**
  - Implemented PII masking during document chunking in `vector_service.py` to scrub national ID numbers (e.g., masking 10/13/17-digit patterns) before embedding generation.
  - Application logs strictly omit file bytes, raw personal identity tokens, and plain-text passwords.

---

## 3. Environment & Deployment Hardening Checklist

- [x] `SECRET_KEY` loaded from environment; falls back with explicit developer warning in local dev.
- [x] `DEBUG` driven by environment variable (defaults to `False` in production configurations).
- [x] `ALLOWED_HOSTS` parsed from comma-separated environment variable.
- [x] `CORS_ALLOWED_ORIGINS` configurable via environment; no wildcard in production.
- [x] `CSRF_TRUSTED_ORIGINS` configured for production Render and Vercel domains.
- [x] Secure file storage with private UUID storage paths.
- [x] No plaintext credentials or production secrets committed to git.
