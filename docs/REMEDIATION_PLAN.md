# UNBHUMI — Remediation & Engineering Plan

**Platform:** UNBHUMI by UNLEFT (LandGuard)  
**Date:** October 2026  
**Target:** Phased production-grade engineering remediation while strictly preserving `/demo` and existing UI styling.

---

## 1. Prioritization & Engineering Phases

Work is structured into 6 sequential phases according to risk and dependency:

```
[Phase 1: Architecture, Security & Storage Hardening]
                     │
                     ▼
[Phase 2: Real Document Intake & OCR Extraction Engine]
                     │
                     ▼
[Phase 3: Structured Land-Data Normalization & Rule Engine]
                     │
                     ▼
[Phase 4: Provenance-Aware Ownership Graph & Vector RAG]
                     │
                     ▼
[Phase 5: Frontend Data Integrity & Error Handling]
                     │
                     ▼
[Phase 6: Verification, Automated Testing & Documentation]
```

---

## 2. Detailed Phase Specifications

### Phase 1: Security, Authorization & Storage Hardening (P0)
1. **File Validation & Safe Storage:**
   - Create `backend/services/storage_service.py` to validate uploaded files before saving.
   - Enforce maximum file size (15 MB), allowed extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`), and verify file magic bytes (`%PDF`, `\x89PNG`, `\xFF\xD8\xFF`).
   - Store files using UUID-randomized storage keys in `media/documents/private/` to prevent directory traversal and enumeration.
   - Add authorized document download endpoint (`GET /api/v1/documents/{id}/file/`) enforcing case-scoped authorization.
2. **Access Control & Permissions:**
   - Define `backend/apps/cases/permissions.py` with `IsCaseAuthorized` permission class.
   - Restrict mutation endpoints (`PATCH /cases/{id}/`, `POST /cases/{id}/documents/`, `PATCH /documents/{id}/fields/`, `POST /alerts/{id}/disposition/`) to authenticated users with reviewer, supervisor, or admin roles.
   - Protect demo-only destructive operations (`/seed-demo/`) so they cannot execute when `DEMO_MODE=False`.

### Phase 2: Real Document Intake & OCR Pipeline (P1)
1. **Provider-Independent Extraction Architecture:**
   - Refactor `backend/services/ocr_service.py` into a modular extractor pipeline:
     - `BaseExtractor`: Abstract interface defining `extract(file_path, file_bytes) -> ExtractionResult`.
     - `DigitalPDFExtractor`: Uses `pdfplumber` / `pypdfium2` to extract actual page text, layout words, line positions, and calculate genuine text confidence.
     - `ImageScanExtractor`: Inspects image dimensions, color channels, applies PIL enhancements, and flags unreadable / scan-quality issues.
2. **Domain-Specific Entity Extraction:**
   - Implement regex and lexical extractors for Bangladeshi land records:
     - Deed numbers (দলিল নং, Deed No, Bangla numerals `০-৯` & ASCII `0-9`).
     - Registration dates (তারিখ, Date).
     - Parties: Seller (বিক্রেতা / দাতা), Buyer (গ্রহীতা / ক্রেতা).
     - Mouza (মৌজা), Dag / Plot (দাগ নং), Khatian (খতিয়ান নং), Survey Type (CS/SA/RS/BS).
     - Land Area (শতাংশ, শতক, একর, decimals).
     - Baya deed reference numbers and dates.
     - Mutation case references (নামজারি কেস নং, ডিসিআর).
3. **Provenance & Field Storage:**
   - Populate `DocumentPage` records with actual page text and real confidence scores.
   - Populate `ExtractedField` with `raw_value`, `normalized_value`, `confidence`, `status='auto'`, bounding box where available.
   - Never fabricate missing fields; if a field cannot be found, omit it or flag low confidence for reviewer correction.

### Phase 3: Structured Land-Data Normalization & Complete Rules (P1/P2)
1. **Parcel & Transaction Entity Synchronization:**
   - Create `backend/services/normalization_service.py` to reconcile extracted fields into normalized models:
     - Standardize Bangla digits to ASCII integers/floats.
     - Normalize land area to decimal units (শতক/শতাংশ = 1 decimal, কাঠা = 1.65 decimals, একর = 100 decimals).
     - Update or link `Parcel`, `KhatianRecord`, `MutationRecord`, and `DeedTransaction`.
2. **Complete Deterministic Rule Engine:**
   - Update `backend/services/rule_engine.py` to evaluate all 12 rules from `rules_catalog.py`:
     - `D001`: Duplicate file byte hash across different registered cases.
     - `D002`: Deed number or registration date mismatch between deed and baya deed references.
     - `O001`: Broken ownership chain / missing prior baya deed.
     - `O002`: Transfer date predates documented seller acquisition date.
     - `P001`: Potential double-selling — specifically distinguishing legitimate partial transfers and resale chains from true incompatible transfers.
     - `P002`: Cumulative transferred area exceeds total recorded parcel area.
     - `P003`: Boundary descriptions contradict adjacent cadastral sheet / mouza records.
     - `K001`: Deed seller does not match recorded khatian owner.
     - `M001`: Deed transfer details contradict approved mutation record.
     - `T001`: Land tax dakhila payment details inconsistency.
     - `G001`: Graph topology detects competing diverging transfer paths.
     - `X001`: Low OCR confidence on critical title fields requiring human verification.

### Phase 4: Provenance-Aware Ownership Graph & Vector RAG (P2)
1. **Provenance-Aware Graph Traversal:**
   - In `backend/services/graph_service.py`, build NetworkX DiGraph where every node and edge carries document IDs, page references, and extraction confidence.
   - Detect conflicting cycles, parallel seller paths, and broken chains topologically.
2. **Real Embedding & Vector Storage Pipeline:**
   - Create `DocumentChunk` model in `apps/documents/models.py` with case, document, page, chunk index, text, embedding vector, and model version.
   - Create `backend/services/vector_service.py`:
     - Chunker: Page-aware semantic windowing (300-500 words per chunk with 50-word overlap).
     - Dense Embedding Engine: Normalized dense vector generation (PyTorch / scikit-learn feature-space dense vectors locally, or OpenAI embeddings if API key is provided).
     - Cosine similarity retrieval strictly scoped to the authorized case.
3. **Graph-Enhanced RAG:**
   - Combine deterministic findings, topological graph paths, and vector passages into a verifiable evidence bundle with strict document and page citations.
   - Explicitly disclaim non-authoritative status and state missing evidence clearly.

### Phase 5: Frontend Data Integrity & Intake Wizard (P2/P3)
1. **Primary Upload Wizard (`frontend/app/documents/new/page.tsx`):**
   - Retain complete visual UI, styling, and step sequence.
   - Remove pre-populated synthetic document entries.
   - Accept real file selection (PDF, PNG, JPG).
   - In `handleSubmit`: create case, upload actual selected files via `FormData` to `/api/v1/cases/{id}/documents/`, run checks, and route to case detail.
2. **Remove Silent Mock Fallbacks:**
   - In `frontend/lib/api.ts`: stop silently substituting `FALLBACK_CASES[0]` on API errors; throw errors so UI displays informative error banners with retry buttons.
   - Keep `/demo` completely intact and separate.

### Phase 6: Verification & Test Battery (P0/P1/P2)
1. Comprehensive automated Django test suite covering upload validation, OCR parsing, all 12 rules, vector indexing, GraphRAG, and authorization.
2. Frontend Next.js production build (`npm run build`) verification.
3. Live end-to-end scenario verification (Scenario A through J).
