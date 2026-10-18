# UNBHUMI DETECTOR — UI/UX REDESIGN & MODERNIZATION CHANGELOG

**Project:** UNBhumi Detector (UNLEFT LandGuard) — Bangladesh Multimodal Land-Fraud & Double-Selling Detection Platform  
**Target Standard:** Mobile-First Ergonomics, WCAG 2.2 AA Accessibility, 100% Functional Parity  
**Date of Release:** October 18, 2026  
**Engineering Team:** UNLEFT Core Frontend & Design Architecture  

---

## 1. Executive Summary

A comprehensive, production-grade mobile-first UI/UX overhaul of the entire UNBhumi Detector platform was completed without modifying existing backend business logic, Django REST Framework API contracts (`lib/api.ts`), database schemas, or detection algorithms.

All 18 application routes, shared global navigation components, modals, tables, and visualization viewers were refactored to deliver a restrained, institutional, emerald-first design aesthetic that guarantees zero unintended horizontal scrolling, minimum 44×44px touch targets, complete dual-language (Bengali/English) dictionary parity (487 translation keys), and high-contrast light and dark mode usability.

---

## 2. Shared Design System & Foundations

### 2.1 Color Tokens & Typography
- **Core Brand Palette:** Standardized to `#15803D` / `#286B35` (Emerald Leaf primary), `#7ED957` (Lime accent), `#F8FAFC` (Surface background in light mode), and `#0A0F15` (Deep slate surface in dark mode).
- **Removal of Legacy Classes:** Deprecated and eradicated all ad-hoc, hardcoded styling classes (such as `bg-cream-50`, `text-cream-900`, `text-parrot-600`) that previously broke dark-mode contrast. Replaced them with CSS token variables (`var(--bg-primary)`, `var(--bg-surface)`, `var(--bg-surface-soft)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--border-color)`, `var(--brand-accent)`).
- **Bangla Typography Line-Height:** Enforced a minimum `line-height: 1.62` and `overflow-wrap: break-word` on all Bengali text containers to prevent vertical glyph clipping of vowel diacritics (কার ও ফলা).

### 2.2 Global CSS Utilities (`frontend/app/globals.css`)
- **Safe Area Insets:** Added `--safe-bottom: env(safe-area-inset-bottom, 0px)` to dynamically offset sticky actions and navigation on modern mobile devices (iPhone dynamic island / home indicators).
- **Horizontal Overflow Prevention:** Applied `html, body { max-width: 100vw; overflow-x: clip; }` across all viewports.
- **Touch Target Utility (`.touch-target`):** Enforced `min-height: 44px; min-width: 44px` on interactive touch controls.
- **Accessible Focus Rings:** Standardized `:focus-visible` styling with a 2px offset ring (`var(--brand-accent)`).

---

## 3. Navigation & Layout Shell Modernization

### 3.1 Persistent Mobile Bottom Navigation Bar (`frontend/components/Navbar.tsx`)
- Implemented a persistent, high-contrast 5-destination bottom navigation bar for viewports `< 1024px`:
  1. `/dashboard` (সারসংক্ষেপ / Overview)
  2. `/cases` (মামলার নথি / Cases)
  3. `/documents/new` (নতুন অনুসন্ধান / New Investigation - prominent elevated action)
  4. `/review-queue` (সতর্কতা / Alerts Queue)
  5. `/demo` (ডেমো / Demo Showcase)
- Configured body padding (`pb-20 lg:pb-0`) in `frontend/app/layout.tsx` to prevent any content or submit buttons from being obscured by the bottom bar.

### 3.2 Top Bar & Mobile Menu Drawer
- Added full keyboard accessibility: `Escape` key closes the mobile drawer, with focus restoration.
- Refactored language toggle (`বাংলা` / `English`) and theme toggle (`Light` / `Dark`) into 44px accessible touch controls.
- Clean disclosure button with dynamic `aria-expanded` and `aria-label`.

### 3.3 Status & Risk Badges (`frontend/components/RiskBadge.tsx`)
- Eliminated hardcoded Bengali strings in the badge component; connected directly to `useLanguage()` with localized labels and numerals (`formatNumber(score)`).
- Converted badge colors to meet WCAG 2.2 AA contrast ratios in both light and dark modes.

---

## 4. Route-by-Route UX Overhauls

### 4.1 Landing Page (`/` — `frontend/app/page.tsx`)
- **Mobile First Hero:** Re-architected hero typography and CTA container to eliminate overflow on 320px–390px screens.
- **Responsive Trust Cards:** Modernized 3-step investigation workflow cards with emerald icon badges and 44px touch targets.
- **Scenario Preview Cards:** Balanced grid (1 col on mobile, 2 col on tablet, 4 col on desktop) with clear risk classification indicators.
- **Responsible AI Disclaimer:** Positioned ethical decision-support disclaimers prominently in the primary flow.

### 4.2 Dashboard (`/dashboard` — `frontend/app/dashboard/page.tsx`)
- **Operational Inquiries Panel:** Transformed the 4 Core Reviewer Questions into clean, responsive cards with localized status indicators.
- **Touch-Friendly KPI Cards:** Standardized summary metrics with formatted Bengali numerals and responsive wrapping.
- **Recent Cases Feed:** Added stacked card presentation on mobile and clean table formatting on desktop.

### 4.3 New Document Upload Wizard (`/documents/new` — `frontend/app/documents/new/page.tsx`)
- **3-Step Wizard Navigation:** Structured into Step 1 (Parcel Info), Step 2 (Document Upload), Step 3 (Review & Launch).
- **Mobile Input Attributes:** Added `inputMode="numeric"` to plot and area fields to automatically trigger numeric keypad on iOS and Android.
- **Client-Side SHA-256 Preview:** In-browser cryptographic hash generation using Web Crypto API displayed with break-all formatting.
- **Accessible Progress Modal:** Replaced static loading state with animated progress modal tracking ingestion, OCR, graph generation, and rule execution.

### 4.4 Case Directory (`/cases` — `frontend/app/cases/page.tsx`)
- **Dual Presentation Layout:**
  - Desktop: Full tabular view with status, date, risk badge, and direct inspection links.
  - Mobile (`< 640px`): High-density stacked card view displaying mouza, dag, risk score, and large 44px tap targets.
- **Filter Controls:** Replaced fixed-width select dropdowns with responsive, wrap-friendly controls.

### 4.5 Case Details & Adjudication (`/cases/[id]` — `frontend/app/cases/[id]/page.tsx`)
- **Responsive 2×2 Parcel Summary:** Collapses from 4-column desktop header to a 2×2 mobile grid without clipping parcel or survey numbers.
- **Touch-Friendly Tab Bar:** Horizontal scrollable tab bar (`overflow-x-auto`) with visible active indicators.
- **Conflicting Records Comparison:** Stacked before/after records comparison with `break-all` on conflicting fields.
- **Status Adjudication:** 44px action buttons for updating review statuses (`flagged_review`, `verified_clean`, `resolved`).

### 4.6 Document Library & Viewer (`/documents` & `frontend/components/DocumentViewer.tsx`)
- **Document List Dual-View:** Desktop table + mobile stacked cards displaying file size, SHA-256, and upload timestamp.
- **Field Correction Interface:** 44px touch-friendly inline editor for correcting OCR field extractions with live audit log updates.

### 4.7 Adjudication Review Queue (`/review-queue` — `frontend/app/review-queue/page.tsx`)
- **Mobile Stacked Cards:** Replaced wide table with touch-friendly alert cards on mobile screens.
- **Responsive Disposition Dialog:** Modal redesigned as an accessible dialog (`max-h-[90vh] overflow-y-auto`) with 3 step-by-step progress phases, 44px touch radios, and localized buttons.

### 4.8 Ownership Graph & Visualizer (`/ownership-graph` & `OwnershipGraphVisualizer.tsx`)
- **Bilingual Interface:** Localized all hardcoded text across canvas controls, legend items, and inspector panels.
- **Responsive Case Switcher:** 44px touch-friendly select control.
- **Canvas Navigation:** Dedicated zoom in/out, fit to view, and reset buttons prevent canvas pan gestures from hijacking whole-page mobile scrolling.
- **Accessible Table Fallback:** Full tabular mode for screen readers and touch users who prefer non-canvas inspection.

### 4.9 Reports & Dossier (`/reports` — `frontend/app/reports/page.tsx`)
- **Print Isolation:** `@media print` CSS ensures navigation, controls, and bottom bars are hidden while printing.
- **Responsive Control Bar:** Case switcher and language toggles stack cleanly without horizontal overflow.
- **Cryptographic Hash Safety:** Added `break-all` and `overflow-x-auto` to the document list to prevent 64-character SHA-256 hashes from breaking mobile viewports.

### 4.10 Settings & Login (`/settings` & `/login`)
- **Full Design Token Migration:** Replaced all legacy cream/parrot classes with design system tokens.
- **Role Selection Cards:** Min 44px touch-target heights with clear active state rings.
- **Theme & Language Persistence:** Verified instant updates and localStorage persistence.

### 4.11 Static Information Pages (`/about`, `/methodology`, `/privacy`, `/terms`)
- **12-Rule Catalog:** Dual presentation (table on desktop, responsive cards on mobile).
- **Prose Readability:** Restrained `max-w-4xl` reading containers with 1.62 line-height for optimal reading ergonomics.
- **Footer (`frontend/components/Footer.tsx`):** Standardized 44px touch targets on navigation links and dual-language footer notes.

---

## 5. Accessibility & Verification Metrics

| Criterion | Target | Achieved | Notes |
|---|---|---|---|
| **TypeScript Compilation** | Zero errors | **0 errors** | Turbopack `next build` passed across all 18 routes. |
| **Localization Parity** | 100% key match | **100% (487/487 keys)** | `node test_localization.js` passed with full Bengali/English parity. |
| **Backend Unit Tests** | 100% pass | **13/13 passed** | `python manage.py test tests` passed in 13.6s. |
| **Live API Contracts** | 100% pass | **17/17 endpoints** | `python test_live_api.py` verified real HTTP responses. |
| **Horizontal Scrolling** | Zero unintended | **0 overflow** | Tested across 320px, 360px, 390px, 430px, 768px, 1024px+. |
| **Touch Targets** | Min 44×44px | **Achieved** | All interactive buttons, chips, and selects meet WCAG 2.2 AA. |

---

## 6. Suggested Follow-Ups — Product Decisions Required

The following architectural opportunities were identified during inspection but deliberately not implemented to protect strict functional preservation boundaries:

1. **Production Optical Character Recognition (OCR):** The current system uses high-fidelity synthetic precomputed extractions for demo fixtures. For production deployment, integrate live asynchronous Celery workers running Tesseract OCR v5 / Google Cloud Vision API.
2. **Citizen-Facing NID / Digital Land Records API Integration:** Direct integration with Bangladesh Land Ministry (land.gov.bd) Mutation & e-Poricha APIs requires official government API credentials and bilateral MoUs.
3. **Multi-Factor Authentication (MFA) & Enterprise SSO:** The platform's demo login system currently supports instant role simulation. Adding institutional Google Workspace OAuth 2.0 or Govt OpenID Connect will require OAuth client secrets in `.env.production`.
