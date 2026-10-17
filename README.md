# UNBUmi Detector (আনভূমি ডিটেক্টর)
## AI-Powered Land Fraud Detection & Document Verification Platform
**Developed by UNLEFT | Prepared for LandTech Innovation Hackathon 2026**  
**Primary Track:** P3 — Catch Fraud & Double-Selling  
**Supporting Capability:** P2 — Verify Deeds & Document Integrity  
**Language:** Bangla-first (বাংলা) with English switcher  
**Visual Identity:** Parrot Green (`#7ED957`) & Warm Cream (`#FFF8E7`)

---

## 1. Executive Summary & Product Vision

**UNBUmi Detector** (also known as **UNLEFT LandGuard**) is an evidence-first decision-support system designed to detect land fraud, double-selling (দ্বৈত বিক্রি), ownership-chain gaps (বায়া দলিলের অনুপস্থিতি), and deed–khatian contradictions in Bangladesh.

The platform answers four operational questions:
1. **Document Integrity:** Is this file byte-identical to a previously registered copy (SHA-256 fingerprint), or has it been altered?
2. **Transaction Consistency:** Do the seller, buyer, deed chain, plot dag identifiers, area, khatian, and mutation records agree?
3. **Cross-Document Risk:** Does the same parcel (or overlapping parcel description) appear in conflicting sales or prior transactions?
4. **Traceable Evidence:** Which exact fields, rules, document pages, and ownership graph paths explain each alert?

> [!IMPORTANT]
> **Responsible AI Principle:** UNBUmi Detector provides transparent, evidence-backed alerts for human reviewers. A flagged case indicates a need for further review; it does not declare legal title or replace an authorized sub-registrar, AC Land, or civil court.

---

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 16.4.x (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom parrot green & warm cream design tokens
- **Typography:** English (Inter/Sans-serif), Bangla (Hind Siliguri / Noto Sans Bengali fallbacks)
- **Icons:** Lucide Icons (no emoji as interface controls)
- **Localization:** Custom zero-dependency Bangla-first `i18n` context with instant English switching
- **Theme:** Light-first cream identity with functional accessible dark mode toggle

### Backend
- **Framework:** Python, Django 4.2.x, Django REST Framework
- **Architecture:** Versioned REST API under `/api/v1/`
- **Database:** Dual-compatible (PostgreSQL with `pgvector` for production/Supabase, SQLite for instant zero-dependency local dev)
- **Graph Engine:** NetworkX graph analysis & cycle detection
- **Containerization:** Docker & Docker Compose

---

## 3. Visual Identity & Design Tokens

| Token | Hex Value | Application |
|---|---|---|
| **Parrot Green** | `#7ED957` | Vibrant brand accent, success badges, graph highlights |
| **Deep Leaf Green** | `#286B35` | Primary buttons, headers, brand emblem, active states |
| **Warm Cream Background** | `#FFF8E7` | Primary page canvas background (Default light theme) |
| **Soft Cream Surface** | `#F5EEDC` | Elevated cards, document panels, control bars |
| **White Surface** | `#FFFFFF` | High-contrast tables, reading canvas, print export |
| **Main Text** | `#263126` | Deep forest dark text for high legibility |
| **Secondary Text** | `#697265` | Muted labels, metadata, subheadings |
| **Borders** | `#E5E0D2` | Subtle warm structural borders |
| **Warning Amber** | `#E8A23A` | Review priority alerts, high risk badges |
| **Error Red** | `#C84C4C` | Critical double-selling conflicts |

---

## 4. Deterministic Fraud-Detection Rules Engine

The system executes 12 deterministic rules across six families before any generative AI summarization:

| Rule Code | Family | Bengali Description | Severity | Points |
|---|---|---|---|---|
| `D001` | Document Integrity | অন্য কেসে হুবহু একই ফাইলের ক্রিপ্টোগ্রাফিক হ্যাশ (SHA-256) বিদ্যমান | Medium | 15 |
| `D002` | Document Integrity | দলিল নম্বর বা রেজিস্ট্রেশন তারিখের বৈসাদৃশ্য | High | 20 |
| `O001` | Ownership Chain | মালিকানার ধারাবাহিকতা বিচ্ছিন্ন (বায়া দলিলের অভাব) | Critical | 30 |
| `O002` | Ownership Chain | মালিকানা অর্জনের পূর্ববর্তী তারিখে জমি হস্তান্তরের দাবি | Critical | 35 |
| `P001` | Parcel Conflict | সম্ভাব্য দ্বৈত বিক্রি (একই দাগ একাধিক সক্রিয় দলিলে বিক্রির চেষ্টা) | Critical | 40 |
| `P002` | Parcel Conflict | বিক্রিত জমির পরিমাণ খতিয়ানের মোট রেকর্ডকৃত এলাকা অতিক্রম করেছে | High | 25 |
| `P003` | Parcel Conflict | চৌহদ্দি ও মৌজা ম্যাপের সীমানা বর্ণনায় গরমিল | Medium | 15 |
| `K001` | Record Consistency | দলিল ও খতিয়ানের মালিকানা/দাগে অসঙ্গতি | High | 25 |
| `M001` | Record Consistency | দলিল ও নামজারি খতিয়ানের তথ্য অমিল | High | 20 |
| `T001` | Supporting Evidence | ভূমি উন্নয়ন কর দাখিলার তথ্যে গরমিল (সহায়ক সংকেত) | Low | 10 |
| `G001` | Graph Conflict | মালিকানা গ্রাফে সমান্তরাল বা সাংঘর্ষিক হস্তান্তর পথ শনাক্ত | Critical | 35 |
| `X001` | Extraction Quality | গুরুত্বপূর্ণ তথ্যে ওসিআর পাঠোদ্ধারের নিম্ন মান (সংশোধন আবশ্যক) | Low | 5 |

---

## 5. Seeded Synthetic Scenarios (8 Test Cases)

The platform comes pre-seeded with 8 reproducible synthetic test cases:

1. **`UB-2026-1001` — Clean Synthetic Case (স্বাভাবিক ও বৈধ কেস):**
   - মৌজা: কাউন্দিয়া, আরএস দাগ: ৪১২ (২৫ শতক)।
   - মূল সাফ-কবলা দলিল, আরএস খতিয়ান ও নামজারি সম্পূর্ণ সঙ্গতিপূর্ণ। ঝুঁকি স্কোর: ০ (Low)।
2. **`UB-2026-1002` — Potential Double-Selling (সম্ভাব্য দ্বৈত বিক্রি):**
   - মৌজা: ধামরাই, আরএস দাগ: ৮৮।
   - একই বিক্রেতা (কামাল হোসেন) একই দাগ পূর্বে রফিকুল ইসলামের কাছে বিক্রির পর পুনরায় জসিম উদ্দিনের নামে বিক্রির চেষ্টা। Fired Rules: `P001`, `G001`।
3. **`UB-2026-1003` — Broken Ownership Chain (মালিকানা ধারাবাহিকতা বিচ্ছিন্ন):**
   - মৌজা: তেঁতুলঝোড়া, আরএস দাগ: ২৯১।
   - বিক্রেতার স্বপক্ষে কোনো পূর্ববর্তী বায়া দলিল বা উত্তরাধিকার সনদ অনুপস্থিত। Fired Rules: `O001`, `K001`।
4. **`UB-2026-1004` — Deed–Khatian Mismatch (দলিল বনাম খতিয়ান স্বত্ব অমিল):**
   - মৌজা: সাভার, আরএস দাগ: ৫১০।
   - দলিলে বিক্রেতার নামের সাথে খতিয়ানের মূল মালিকের নাম ও হিস্যা মিলছে না। Fired Rules: `K001`।
5. **`UB-2026-1005` — Area Inconsistency (রেকর্ড অপেক্ষা অতিরিক্ত জমি বিক্রির দাবি):**
   - মৌজা: বনগাঁও, আরএস দাগ: ১৪৫।
   - খতিয়ানে অনুমোদিত মোট এলাকা ৮০ শতাংশ, কিন্তু দলিলে ১২০ শতাংশ জমি বিক্রির দাবি। Fired Rules: `P002`।
6. **`UB-2026-1006` — Altered Copy / Duplicate Hash (ডিজিটাল ফাইলে বিকৃতি বা অভিন্ন হ্যাশ):**
   - মৌজা: আশুলিয়া, আরএস দাগ: ৩২০।
   - পূর্বে এনরোলকৃত ফাইলের হ্যাশ অন্য কেসের সাথে মিলে যাচ্ছে। Fired Rules: `D001`।
7. **`UB-2026-1007` — Boundary Description Mismatch (চৌহদ্দি ও মৌজা নকশায় বিরোধ):**
   - মৌজা: জিরাবো, আরএস দাগ: ৬৭।
   - দলিলে বর্ণিত উত্তর ও পূর্ব সীমানা মৌজা নকশার সাথে সাংঘর্ষিক। Fired Rules: `P003`।
8. **`UB-2026-1008` — Low OCR Quality / Faded Document (হস্তলিখিত ঝাপসা নথি):**
   - মৌজা: বিরুলিয়া, আরএস দাগ: ১৮০।
   - ঝাপসা হাতের লেখার কারণে ওসিআর কনফিডেন্স ৫০%। পর্যালোচকের ম্যানুয়াল পরীক্ষণ কিউতে প্রেরণ। Fired Rules: `X001`।

---

## 6. Demo Accounts & Credentials

For fast hackathon testing, the following seeded accounts are available:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Document Reviewer** | `reviewer@unleft.org` | `demo123` | Upload cases, edit OCR fields, review queue disposition |
| **Supervisor / Sub-Registrar** | `supervisor@unleft.org` | `demo123` | High-risk case disposition, report export authorization |
| **System Administrator** | `admin@unleft.org` | `demo123` | Seed reset, audit log inspection, rule config |

---

## 7. Installation & Quick Start

### Prerequisites
- Node.js 18+ (tested with v24)
- Python 3.10+ (tested with v3.14)
- npm

### Step 1: Run Backend (Django API)
```bash
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 127.0.0.1:8000
```
Backend API will be active at: `http://127.0.0.1:8000/api/v1/`  
Health check: `http://127.0.0.1:8000/api/v1/health/`

### Step 2: Run Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend web application will be accessible at: `http://localhost:3000/`

### Step 3: Run with Docker Compose
```bash
docker-compose up --build
```

---

## 8. Verification & Test Commands

To run all automated checks:

### Backend Automated Unit & Integration Tests (12 tests)
```bash
python manage.py test tests
```

### Live REST API Battery (17 endpoints against running server)
```bash
python test_live_api.py
```

### Frontend TypeScript & Production Build (Turbopack)
```bash
cd frontend
npm run build
```

---

## 9. Cloud Deployment Guide

### Vercel (Frontend)
1. Import the repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1`
4. Deploy. The project automatically configures Next.js 16 SSR and static prerendering.

### Supabase (PostgreSQL with pgvector)
1. Create a new project on [Supabase](https://supabase.com).
2. Retrieve the PostgreSQL connection string from Database Settings (URI pooler mode).
3. Set in backend `.env`:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   python manage.py seed_demo
   ```

### Docker (Production Backend)
1. Build and run using the production container:
   ```bash
   docker build -t unbhumi-backend ./backend
   docker run -p 8000:8000 --env-file backend/.env unbhumi-backend gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

---

## 10. API Reference Summary (`/api/v1/`)

- `POST /api/v1/auth/demo-login/` — Start session with a seeded demo role
- `POST /api/v1/auth/logout/` — Invalidate demo session
- `GET /api/v1/me/` — Current user profile and capabilities
- `GET /api/v1/dashboard/summary/` — Aggregate metrics and live database statistics
- `GET, POST /api/v1/cases/` — List cases with risk/status filters, or create new case
- `GET, PATCH /api/v1/cases/{id}/` — Read case details or update status
- `POST /api/v1/cases/{id}/run-checks/` — Re-execute deterministic rule engine and update risk
- `GET /api/v1/cases/{id}/graph/` — Ownership & transaction NetworkX graph nodes and edges
- `GET /api/v1/cases/{id}/report/` — Exportable structured verification report
- `GET /api/v1/documents/` — Search and filter document registry
- `GET, PATCH /api/v1/documents/{id}/fields/` — Read and correct OCR extracted fields
- `GET /api/v1/alerts/` — Reviewer queue listing unreviewed findings
- `POST /api/v1/alerts/{id}/disposition/` — Record human reviewer decision with audit log
- `POST /api/v1/seed-demo/` — Repopulate the 8 synthetic scenarios
- `GET /api/v1/health/` — Health readiness probe

---

## 11. Security & Ethical Safeguards

1. **Untrusted OCR Input:** Scanned text and extracted fields are treated as untrusted data.
2. **Deterministic Rules First:** Generative AI is not permitted to declare fraud; transparent, auditable rules determine conflict signals.
3. **Immutable Audit Events:** Every field edit, reviewer disposition, and export action is timestamped and recorded in the audit trail.
4. **Data Privacy:** Synthetic data only; no unauthorized scraping or querying of live government portals.

