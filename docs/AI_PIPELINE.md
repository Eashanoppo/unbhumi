# UNBHUMI — AI & Decision Pipeline Architecture

**Platform:** UNBHUMI by UNLEFT (LandGuard)  
**Scope:** OCR & Vision Extraction, Normalization, Deterministic Rule Engine, Vector Retrieval (RAG), and Graph-Enhanced RAG (GraphRAG).

---

## 1. Pipeline Architecture Overview

The UNBHUMI reasoning architecture implements a strict three-tier decision hierarchy where deterministic facts and cryptographic proofs ground all downstream generative explanations:

```
┌────────────────────────────────────────────────────────┐
│                   Uploaded Documents                   │
│               (PDF, JPEG, PNG Land Records)            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Tier 1: Document Processing                │
│  - SHA-256 Byte Fingerprint & Duplicate Hash Index     │
│  - Modular OCR & Digital PDF Text Extractor            │
│  - Genuine Confidence Calculation & Page Mapping       │
│  - Regex & Lexical Entity Extractor (Bangla & English) │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Tier 2: Structured Normalization           │
│  - Bangla Digit Standardization (০-৯ -> 0-9)           │
│  - Area Unit Conversion (Decimals, Katha, Bigha)       │
│  - Parcel Normalized Key Resolution                    │
│  - Human Field Correction History & Provenance         │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│ Tier 3A: Deterministic Rules│ │ Tier 3B: Knowledge Graph    │
│  - 12 Authoritative Rules   │ │  - NetworkX DiGraph Engine  │
│  - Double-Sale Disambig.    │ │  - Provenance-linked Edges  │
│  - Broken Chain Analysis    │ │  - Topological Conflict Det.│
│  - Area Exceeds Share       │ │  - Competing Path Isolation │
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
               └──────────────┬────────────────┘
                              ▼
┌────────────────────────────────────────────────────────┐
│             Tier 3C: Vector Indexing & RAG             │
│  - Page-aware Document Chunking with PII Scrubbing     │
│  - Dense Semantic Vector Embeddings                    │
│  - Case-Scoped Cosine Similarity Retrieval             │
│  - Graph-Enhanced Evidence Synthesis with Provenance   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Component Details

### 2.1 OCR & Extraction Pipeline (`backend/services/ocr_service.py`)
- **Byte Integrity:** Computes canonical SHA-256 of uploaded bytes and checks against `DocumentFingerprint`.
- **Digital PDF Extraction:** Uses `pdfplumber` to extract page-by-page text, character metrics, and word positions. Confidence is calibrated based on text extraction density and character recognizability.
- **Image Scanning:** Inspects dimensions and image quality using `PIL`. Flags low confidence when text cannot be reliably extracted.
- **Bangla Land Record Patterns:**
  - Deed Number: `দলিল নং|দলিল নম্বর|Deed No` followed by digits.
  - Registration Date: `তারিখ|Date|রেজিস্ট্রেশনের তারিখ` followed by `DD/MM/YYYY` or Bangla date formats.
  - Seller / Donor: `বিক্রেতা|দাতা|হস্তান্তরকারী|মালিক` followed by names.
  - Buyer: `ক্রেতা|গ্রহীতা|দাবিকারক` followed by names.
  - Parcel Identifiers: `মৌজা` (Mouza), `দাগ নং` (Dag/Plot), `খতিয়ান নং` (Khatian), `জরিপ` (Survey: CS, SA, RS, BS).
  - Land Area: Extracts quantity and unit (`শতাংশ`, `শতক`, `একর`, `কাঠা`).
- **Missing Value Handling:** Missing fields are stored as absent/null rather than fabricated. Low-confidence fields are marked for human reviewer correction (Rule `X001`).

### 2.2 Normalization Service (`backend/services/normalization_service.py`)
- Standardizes Bangla digits (`০-৯`) to Arabic numerals (`0-9`).
- Converts diverse land units to standardized decimals (1 acre = 100 decimals, 1 katha = 1.65 decimals).
- Constructs canonical parcel keys: `{district}_{upazila}_{mouza}_{survey_type}_{dag_number}`.

### 2.3 Deterministic Rule Engine (`backend/services/rule_engine.py`)
Evaluates the complete 12-rule registry:
- **`D001` (Hash Collision):** Detects identical file bytes registered across different cases.
- **`D002` (Deed Ref Contradiction):** Deed number or date extracted conflicts with citations in baya deed or mutation records.
- **`O001` (Broken Chain):** Seller has no documented prior transfer connecting back to the recorded owner.
- **`O002` (Predated Transfer):** Transfer date predates documented seller acquisition.
- **`P001` (Double-Selling):** Detects incompatible transfers of the same parcel interest. Specifically distinguishes:
  - Legitimate partial transfers (cumulative area <= total area).
  - Resale sequences (Buyer A acquired in 2020, sold to Buyer B in 2024).
  - Incompatible simultaneous transfers (Seller sells 100% to Buyer A in 2024, then attempts to sell to Buyer B in 2026).
- **`P002` (Area Exceeds Record):** Transferred area exceeds recorded parcel area or seller's remaining balance.
- **`P003` (Boundary Inconsistency):** Deed boundary descriptions contradict cadastral sheet or adjacent plot boundaries.
- **`K001` (Seller vs Khatian Contradiction):** Deed seller does not match official recorded owner in revenue khatian.
- **`M001` (Deed vs Mutation Contradiction):** Mutation case reference does not reconcile with deed details.
- **`T001` (Tax Dakhila Inconsistency):** Supporting tax receipt payer or holding number contradicts parcel records.
- **`G001` (Graph Topology Divergence):** Competing transfer paths detected in NetworkX graph.
- **`X001` (Low Extraction Quality):** OCR confidence on critical field is below threshold, requiring manual review.

### 2.4 Vector Storage & Semantic Retrieval (`backend/services/vector_service.py`)
- **Page-Aware Chunking:** Chunks document pages into 300–500 word blocks preserving `document_id`, `page_number`, `chunk_id`, and `case_id`.
- **PII Scrubbing:** Redacts 10/13/17-digit citizen identity numbers before indexing.
- **Dense Embedding Generation:** Generates genuine normalized dense vectors using local dense projection (PyTorch / scikit-learn feature space) or OpenAI embeddings when API key is supplied.
- **Case Isolation:** Retrieval queries filter strictly by `case_id`, preventing cross-case information leakage.
- **Cosine Similarity:** Calculates exact dot-product similarity over normalized vectors.

### 2.5 Graph-Enhanced RAG (GraphRAG) (`backend/services/graph_service.py`)
- Assembles a verifiable evidence bundle combining:
  1. Deterministic rule findings with explicit status.
  2. NetworkX subgraph traversal paths connecting parcels, deeds, parties, and khatians.
  3. Semantically retrieved document passages with similarity scores.
- Every claim in the synthesized answer cites:
  - Document title and ID.
  - Page number.
  - Specific extracted or reviewed field value.
- Explicitly warns when evidence is missing or inconclusive.
