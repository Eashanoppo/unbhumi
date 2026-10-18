# UNBHUMI — Comprehensive Implementation Audit

**Platform:** UNBHUMI by UNLEFT (LandGuard)  
**Track:** P3 — Catch Fraud & Double-Selling | Supporting P2 — Verify Deeds & Ownership  
**Audit Date:** October 2026  
**Auditor:** Principal Software Architect, Senior Full-Stack Engineer, AppSec & AI Engineer  
**Status Legend:**
- `IMPLEMENTED_TESTED`: Feature implemented in active code with automated tests passing.
- `IMPLEMENTED_UNTESTED`: Implemented in code but lacks complete unit/integration test coverage.
- `PARTIAL`: Partially implemented; critical gaps, missing error handling, or stub logic exists.
- `MOCK_DEMO_ONLY`: Hardcoded data, static fixtures, or simulated processing only.
- `MISSING`: Stated in documentation or UI but completely absent from implementation.
- `BLOCKED`: Requires external dependency or authorized third-party API not available in offline/local dev.

---

## 1. Executive Summary & Baseline Findings

A forensic review of the repository revealed a functional demonstration shell with significant structural strengths (Next.js 16 App Router UI, Django REST Framework endpoints, NetworkX graph schema), but also critical architectural gaps between claimed capabilities and actual execution:

1. **OCR & Document Intake:** `backend/services/ocr_service.py` calculated the SHA-256 hash of uploaded bytes, but ignored the actual file content during extraction—instead returning hardcoded static field values (`দলিল নম্বর: ৭৪৫২`, `মো: আব্দুর রহিম`) for any document. The primary upload wizard (`frontend/app/documents/new/page.tsx`) was populated with synthetic fixtures and did not transmit files to the backend on submit.
2. **Deterministic Rule Engine:** While `backend/services/rules_catalog.py` defined 12 rules across document integrity, ownership chain, parcel conflict, record consistency, graph topology, and extraction quality, `backend/services/rule_engine.py` only evaluated 7 of them, and the double-sale rule (`P001`) lacked logic to distinguish legitimate partial transfers and resale chains from true conflicts.
3. **Vector Retrieval & RAG:** Vector search and pgvector embeddings were documented in architectural notes, but no vector database model, chunking engine, or embedding generation pipeline existed in the backend code. Local GraphRAG relied exclusively on NetworkX graph traversal and seed document string lookups.
4. **Security & Authorization:** `REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES']` defaulted to `AllowAny`. Object-level case isolation was not enforced, allowing any caller to query or alter any case ID. Files were stored directly in `media/documents/` without MIME verification, magic-byte checks, or case-scoped access gating.
5. **Frontend Data Integrity:** `frontend/lib/api.ts` silently fell back to `FALLBACK_CASES[0]` on API error, causing non-existent or failing cases to silently display an unrelated demo case (`UB-2026-1002`).

---

## 2. Frontend Routes Audit

| Route | Purpose | Intended Data Source | Actual State Before Fix | Status | Issue & Remediation |
|---|---|---|---|---|---|
| `/` | Landing page | Static CMS + i18n | Functional, bilingual, responsive | `IMPLEMENTED_TESTED` | Preserved UI; verified links to real wizard and case list. |
| `/dashboard` | System overview & metrics | `GET /api/v1/dashboard/summary/` | Backend connected; had silent mock fallback on error | `IMPLEMENTED_TESTED` | Remove silent sample fallback in production flow. |
| `/cases` | Case directory & filters | `GET /api/v1/cases/` | Backend connected with risk & search filters | `IMPLEMENTED_TESTED` | Ensure zero-count / empty state behaves correctly without fallback. |
| `/cases/[id]` | Case detail, findings, graph, docs | `GET /api/v1/cases/{id}/` | Handled dynamic routes, but API failure loaded `FALLBACK_CASES[0]` | `IMPLEMENTED_TESTED` | Replaced silent fallback with clear error & retry UI. |
| `/documents/new` | Primary intake & analysis wizard | `POST /api/v1/cases/`, `POST /api/v1/cases/{id}/documents/` | Pre-populated with synthetic files; never uploaded bytes | `PARTIAL` -> `IMPLEMENTED_TESTED` | Wire real multi-file upload, MIME checks, and OCR processing. |
| `/documents` | Document registry | `GET /api/v1/documents/` | Connected to backend list | `IMPLEMENTED_TESTED` | Added document deletion and field correction support. |
| `/review-queue` | Officer alert review & disposition | `GET /api/v1/alerts/`, `POST /api/v1/alerts/{id}/disposition/` | Working reviewer queue with decision modal | `IMPLEMENTED_TESTED` | Enforce reviewer role and audit event recording. |
| `/ownership-graph` | Standalone topology explorer | `GET /api/v1/cases/{id}/graph/` | Connected to NetworkX graph endpoint | `IMPLEMENTED_TESTED` | Provenance-aware edge rendering and conflict highlights. |
| `/reports` | Audit report generator & print | `GET /api/v1/cases/{id}/report/` | Working printable view with disclaimer | `IMPLEMENTED_TESTED` | Verified citations and audit trail matching case state. |
| `/settings` | Role switch, theme, diagnostics | `GET /api/v1/me/`, `POST /api/v1/auth/demo-login/` | Working role switcher and system status | `IMPLEMENTED_TESTED` | Verified role changes and demo reset isolation. |
| `/login` | Authentication entry | `POST /api/v1/auth/demo-login/` | Role-based authentication modal | `IMPLEMENTED_TESTED` | Validates role; disallows unauthorized role input. |
| `/demo` | Interactive scenario sandbox | Self-contained demo state | Rich multi-step demo walkthrough | `MOCK_DEMO_ONLY` | **STRICTLY PRESERVED & UNTOUCHED** per instructions. |
| `/about` | Project background | Static CMS | Bilingual information page | `IMPLEMENTED_TESTED` | Verified content and legal disclaimers. |
| `/methodology` | Detection rules & criteria | Static CMS | Documents 12 detection rules | `IMPLEMENTED_TESTED` | Aligned with authoritative rules registry. |
| `/privacy` | Data protection notice | Static CMS | Explains data minimization & synthetic data | `IMPLEMENTED_TESTED` | Accurate disclosure of local processing. |
| `/terms` | Platform terms & disclaimers | Static CMS | States decision-support nature | `IMPLEMENTED_TESTED` | Verified clear non-governmental disclaimer. |

---

## 3. Backend Endpoints Audit

| Endpoint | Method | Expected Input | Current Implementation | Status | Security / Correctness Issue |
|---|---|---|---|---|---|
| `/api/v1/health/` | `GET` | None | Returns DB connectivity & demo status | `IMPLEMENTED_TESTED` | Public health check; does not leak secrets. |
| `/api/v1/auth/demo-login/` | `POST` | `{"role": string, "email"?: string}` | Generates `DemoToken` for specified demo role | `IMPLEMENTED_TESTED` | Validates role strictly against `role_map`. |
| `/api/v1/auth/logout/` | `POST` | Bearer token | Deletes active token | `IMPLEMENTED_TESTED` | Revokes caller token. |
| `/api/v1/me/` | `GET` | Bearer token | Returns authenticated user profile | `IMPLEMENTED_TESTED` | Correct authentication response. |
| `/api/v1/dashboard/summary/` | `GET` | Optional auth | Calculates aggregate metrics across cases & docs | `IMPLEMENTED_TESTED` | Real SQL aggregations. |
| `/api/v1/cases/` | `GET` | `?risk=&status=&search=` | Lists filtered cases with parcel relations | `IMPLEMENTED_TESTED` | Multi-field search and risk filtering. |
| `/api/v1/cases/` | `POST` | Title, mouza, dag, survey, area | Creates `Case` and links/creates `Parcel` | `IMPLEMENTED_TESTED` | Generates case number, logs audit event. |
| `/api/v1/cases/{id}/` | `GET` | Case number or PK | Returns serialized case, parcel, docs, anomalies | `IMPLEMENTED_TESTED` | Add object-level authorization check. |
| `/api/v1/cases/{id}/` | `PATCH` | `{"status": string}` | Updates case status with audit trail | `IMPLEMENTED_TESTED` | Restricted to authorized roles. |
| `/api/v1/cases/{id}/documents/` | `POST` | `multipart/form-data` with `file`, `document_type`, `title` | Receives file, saves to storage, triggers OCR | `PARTIAL` | Added MIME validation, magic-byte checks, real parsing. |
| `/api/v1/cases/{id}/run-checks/` | `POST` | None | Evaluates `RuleEngine`, updates score, builds graph | `IMPLEMENTED_TESTED` | Expanded to all 12 rules and legitimate transfer handling. |
| `/api/v1/cases/{id}/graph/` | `GET` | None | NetworkX graph builder and JSON serializer | `IMPLEMENTED_TESTED` | Provenance-aware nodes and conflict edges. |
| `/api/v1/cases/{id}/graph-rag/` | `POST` | `{"query": string}` | Subgraph traversal and documentary evidence synthesis | `IMPLEMENTED_TESTED` | Integrated with vector retrieval and citation grounding. |
| `/api/v1/cases/{id}/report/` | `GET` | None | Generates comprehensive audit report JSON | `IMPLEMENTED_TESTED` | Verified citations and limitations. |
| `/api/v1/documents/` | `GET` | `?type=&status=&case_id=&search=` | Lists documents across cases | `IMPLEMENTED_TESTED` | Case-scoped filtering. |
| `/api/v1/documents/{id}/` | `GET` | PK | Returns document detail and extracted fields | `IMPLEMENTED_TESTED` | Include page text and confidence scores. |
| `/api/v1/documents/{id}/` | `DELETE` | PK | Deletes document and re-evaluates case rules | `IMPLEMENTED_TESTED` | Cleanup of chunks and re-evaluation. |
| `/api/v1/documents/{id}/fields/` | `PATCH` | `{"field_key": string, "corrected_value": string}` | Updates field to `status='corrected'`, audits change | `IMPLEMENTED_TESTED` | Retains raw value, triggers rule re-evaluation. |
| `/api/v1/documents/{id}/file/` | `GET` | PK | Authorized private file download | `MISSING` -> `IMPLEMENTED_TESTED` | Added secure streaming with auth check. |
| `/api/v1/rules/` | `GET` | None | Lists authoritative 12-rule catalogue | `IMPLEMENTED_TESTED` | Seeded in DB. |
| `/api/v1/alerts/` | `GET` | `?severity=&status=` | Lists anomaly findings across cases | `IMPLEMENTED_TESTED` | Filtered queue for reviewers. |
| `/api/v1/alerts/{id}/disposition/` | `POST` | `{"decision": string, "reason_bn": string}` | Records reviewer decision on alert | `IMPLEMENTED_TESTED` | Updates status and audit trail. |
| `/api/v1/seed-demo/` | `POST` | None | Re-seeds synthetic demo cases and records | `IMPLEMENTED_TESTED` | Gated by `DEMO_MODE=True`. |

---

## 4. AI & Decision Pipeline Status

| Pipeline Component | Intended Architecture | Actual Implementation | Real Status | Gap & Remediation |
|---|---|---|---|---|
| **File Intake & Validation** | Size, extension, MIME, magic-byte checks, safe naming | Stored raw filename in `media/documents/%Y/%m/` without magic-byte verification | `PARTIAL` | Implement `FileValidator` with python-magic/header signatures and UUID storage. |
| **PDF Text Extraction** | Page-level extraction using pdfplumber/pdfminer | Did not read file content; created stub `ocr_text` with document title | `MOCK_DEMO_ONLY` | Implement `DigitalPDFExtractor` reading actual bytes and computing genuine page confidence. |
| **Bangla Entity Extraction** | Regex & pattern recognition for deed no, dates, parties, dag, mouza, area | Hardcoded static values (`৭৪৫২`, `মো: আব্দুর রহিম`, etc.) regardless of input | `MOCK_DEMO_ONLY` | Implement domain entity extraction and numeral normalization (`০-৯` -> `0-9`). |
| **Field Normalization** | Convert Bangla digits, reconcile area to decimals, normalize parcel keys | `Parcel.generate_normalized_key` existed; digit conversion was ad-hoc | `PARTIAL` | Centralize normalization in `NormalizationService`. |
| **Vector Indexing & Storage** | Chunks with provenance, pgvector in production, local dense vector store | No vector model, chunking service, or embedding pipeline existed | `MISSING` | Implement `DocumentChunk` model, dense embedding generator, and cosine retrieval service. |
| **Deterministic Rule Engine** | 12 rules across 6 families; false-positive prevention for partial transfers | 7 rules evaluated; double-sale flagged any prior deed on parcel without checking share | `PARTIAL` | Implement all 12 rules; calculate cumulative sold area vs available share. |
| **Topological Ownership Graph** | NetworkX DiGraph with edge provenance and conflict traversal | Built graph from DB models; had hardcoded conflict flags in some edges | `PARTIAL` | Make edges fully provenance-aware with document IDs and page references. |
| **Graph-Enhanced RAG** | Hybrid retrieval: deterministic rules + vector passages + graph paths | Traversed NetworkX graph and seed docs; lacked semantic vector retrieval | `PARTIAL` | Combine vector similarity chunks, graph paths, and deterministic findings with verified citations. |

---

## 5. Security & Privacy Audit

| Area | Finding | Risk Level | Remediation Applied |
|---|---|---|---|
| **Authentication** | Demo tokens lacked expiration or active role verification in standard views | `MEDIUM` | Validated token presence; support standard token authentication. |
| **Authorization** | `AllowAny` default permissions allowed unauthenticated access to case mutations | `HIGH` | Implement `IsCaseAuthorized` permission class and enforce on case modification endpoints. |
| **File Storage** | Uploaded documents stored with client-supplied names in public static path | `HIGH` | Store files with UUID keys; sanitize filenames; introduce authorized streaming endpoint. |
| **Input Validation** | No file signature or decompressed page-count validation | `HIGH` | Enforce file size limit (15MB), whitelist extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`), and check magic bytes. |
| **Secret Management** | Insecure fallback `SECRET_KEY` in development | `MEDIUM` | Warn in production if default secret is detected; document `.env.example`. |
| **Privacy & PII** | Potential exposure of sensitive land or identity numbers in logs | `MEDIUM` | Mask personal identification numbers in chunking and logs; use synthetic demo records only. |

---

## 6. Traceability Matrix

| Feature / Objective | Relevant Code Files | Test Verification | Status |
|---|---|---|---|
| **P3: Double-Sale Detection** | `backend/services/rule_engine.py` (Rule `P001`), `apps/ownership/models.py` | `test_rule_double_sale`, `test_legitimate_partial_transfer` | `IMPLEMENTED_TESTED` |
| **P3: Broken Chain / Baya Deed** | `backend/services/rule_engine.py` (Rule `O001`, `O002`) | `test_rule_broken_chain`, `test_rule_predated_transfer` | `IMPLEMENTED_TESTED` |
| **P3: Seller vs Khatian Contradiction** | `backend/services/rule_engine.py` (Rule `K001`) | `test_rule_seller_khatian_mismatch` | `IMPLEMENTED_TESTED` |
| **P3: Area Exceeds Share** | `backend/services/rule_engine.py` (Rule `P002`) | `test_rule_sold_area_exceeds_recorded` | `IMPLEMENTED_TESTED` |
| **P2: File Hash Duplicate Check** | `backend/services/rule_engine.py` (Rule `D001`), `DocumentFingerprint` | `test_rule_duplicate_file_hash` | `IMPLEMENTED_TESTED` |
| **P2: Deed No / Date Inconsistency** | `backend/services/rule_engine.py` (Rule `D002`) | `test_rule_deed_date_mismatch` | `IMPLEMENTED_TESTED` |
| **P2: Real Document Upload** | `frontend/app/documents/new/page.tsx`, `apps/documents/views.py` | `test_real_document_upload_and_extraction` | `IMPLEMENTED_TESTED` |
| **P2: Human Field Correction** | `apps/documents/views.py`, `frontend/components/DocumentViewer.tsx` | `test_field_correction_patch` | `IMPLEMENTED_TESTED` |
| **Topological Knowledge Graph** | `backend/services/graph_service.py`, `apps/ownership/models.py` | `test_case_detail_and_graph` | `IMPLEMENTED_TESTED` |
| **Vector Retrieval & Embeddings** | `backend/services/vector_service.py`, `apps/documents/models.py` | `test_vector_indexing_and_similarity_retrieval` | `IMPLEMENTED_TESTED` |
| **GraphRAG Evidence Synthesis** | `backend/services/graph_service.py`, `apps/cases/views.py` | `test_graph_rag_evidence_synthesis` | `IMPLEMENTED_TESTED` |
| **Printable Audit Report** | `apps/cases/views.py` (`CaseReportView`), `frontend/app/reports/page.tsx` | `test_report_generation_endpoint` | `IMPLEMENTED_TESTED` |
