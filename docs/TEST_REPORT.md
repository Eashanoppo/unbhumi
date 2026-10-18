# UNBHUMI — Test Report & Verification Battery

**Platform:** UNBHUMI by UNLEFT (LandGuard)  
**Date:** October 2026  
**Test Harness:** Django Test Runner + Next.js Production Build + End-to-End Scenarios  

---

## 1. Test Suite Summary

| Category | Tests Planned | Tests Executed | Passed | Failed | Status |
|---|---|---|---|---|---|
| **System & Health Checks** | 2 | 2 | 2 | 0 | **PASS** |
| **Authentication & Role Authorization** | 4 | 4 | 4 | 0 | **PASS** |
| **File Intake, Validation & Secure Storage** | 4 | 4 | 4 | 0 | **PASS** |
| **OCR & Page-Aware Field Extraction** | 4 | 4 | 4 | 0 | **PASS** |
| **Field Normalization & Digit Conversion** | 3 | 3 | 3 | 0 | **PASS** |
| **Field Correction & Audit Trails** | 2 | 2 | 2 | 0 | **PASS** |
| **Deterministic Rules (All 12 Rules)** | 14 | 14 | 14 | 0 | **PASS** |
| **Double-Sale vs Partial Transfer Differentiation** | 3 | 3 | 3 | 0 | **PASS** |
| **Ownership Graph Topology (NetworkX)** | 3 | 3 | 3 | 0 | **PASS** |
| **Vector Indexing & Similarity Retrieval** | 3 | 3 | 3 | 0 | **PASS** |
| **Graph-Enhanced RAG Evidence Synthesis** | 2 | 2 | 2 | 0 | **PASS** |
| **Report Generation & Disclaimers** | 2 | 2 | 2 | 0 | **PASS** |
| **Frontend Production Build (Next.js 16)** | 1 | 1 | 1 | 0 | **PASS** |

---

## 2. End-to-End Core Scenarios (Part 14.3)

- **Scenario A (Clean Synthetic Case):** Verified that a case with consistent deed and khatian records yields low risk (`0-15%`), zero critical findings, and explicit limitations.
- **Scenario B (Potential Double-Sale):** Verified that two incompatible transfers for the same parcel interest trigger Rule `P001` with citations to both deeds.
- **Scenario C (Legitimate Partial Transfer):** Verified that a valid partial sale (e.g., 10 decimals out of 40 decimals) does NOT trigger a false double-sale alert.
- **Scenario D (Seller Mismatch):** Verified that a deed whose seller differs from the khatian recorded owner triggers Rule `K001` and `O001` with evidence citations.
- **Scenario E (Missing Prior Deed):** Verified that missing baya deed triggers `O001` with recommended next action to request certified prior copies.
- **Scenario F (Low-Quality Scan):** Verified that an image/scan with low recognizability triggers Rule `X001` rather than returning fabricated fields.
- **Scenario G (Tampered File / Duplicate Hash):** Verified that uploading a file byte-identical to one enrolled in another case triggers Rule `D001`.
- **Scenario H (Unauthorized Access):** Verified that unassigned or unauthenticated users cannot alter case dispositions or delete documents.
- **Scenario I (Failed Dependency):** Verified that when an external model is unavailable, truthful fallback synthesis is provided without simulation.
- **Scenario J (Real Upload Flow):** Verified that an uploaded real PDF is parsed, page records created, fields extracted with provenance, and case rules evaluated.
