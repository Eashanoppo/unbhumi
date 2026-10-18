# UNBHUMI DETECTOR — UI/UX AUDIT & BASELINE ASSESSMENT

**Project:** UNBhumi Detector (UNLEFT LandGuard) — Bangladesh Land Document Verification Platform  
**Audit Date:** October 18, 2026  
**Auditor:** Senior Product Designer, UX Architect, Accessibility Specialist & Senior Frontend Engineer  
**Baseline Build Status:** Next.js 16.4.2 (Turbopack) Production Build: **PASS (17 routes compiled)** | TypeScript: **PASS (0 errors)** | Localization Parity: **PASS (485 keys, 100% parity)** | Backend DRF API: **PASS (13/13 tests, 17/17 endpoints active)**  

---

## 1. Executive Summary

UNBhumi Detector is a high-impact, evidence-first land fraud detection platform designed for Bangladesh's land ecosystem. It addresses critical issues: double-selling (দ্বৈত বিক্রি), broken chains of title (বায়া দলিলের অনুপস্থিতি), deed–khatian mismatches, and cryptographic document integrity.

While the technical foundation (DRF backend, NetworkX graph engine, deterministic rule engine, and i18n dictionary) is exceptionally solid, the user interface currently exhibits significant UX, mobile responsiveness, accessibility, and visual consistency shortcomings:

1. **Mobile Ergonomics & Touch Targets:** Key touch targets in navigation, tables, and modal dialogs are below the WCAG 2.2 AA recommended minimum of 44×44 CSS pixels. Lack of persistent mobile navigation forces repetitive scrolling and hamburger menu interaction on phones.
2. **Horizontal Overflow on Mobile Viewports:** On viewports from 320px to 390px, certain tables (notably `/documents`), complex metric grids (`/dashboard`), and conflicting record diff boxes (`/cases/[id]`) cause horizontal overflow or unreadable text wrapping.
3. **Hardcoded Localization & Language Inconsistencies:** Multiple core components (`RiskBadge.tsx`, `/documents/page.tsx`, `/ownership-graph/page.tsx`, `/about/page.tsx`, `/privacy/page.tsx`, `/terms/page.tsx`) contain hardcoded Bengali text, causing partial language switching failure when English is selected.
4. **Design Token Fragmentation:** While `globals.css` specifies modern CSS variables, legacy pages (`/settings/page.tsx`) still utilize ad-hoc classes like `bg-cream-50` and `text-parrot-600` which conflict with the CSS variable system and break dark mode rendering.
5. **Information Density & Typography:** Information hierarchy on data-heavy pages (such as `/cases/[id]`, `/review-queue`, and `/demo`) is visually dense. Long Bengali strings occasionally wrap tightly or risk vertical glyph clipping without dedicated line-height safeguards.

---

## 2. Complete Discovered Route Inventory

| Route | Classification | Primary Functional Purpose | Current UX & Responsive Severity |
|---|---|---|---|
| `/` | Public Landing Page | Hero presentation, 4 operational questions, synthetic demo showcase, workflow steps, FAQ, Responsible AI callout. | **Medium** (Hero layout, mobile trust pills wrap tightly at 320px) |
| `/dashboard` | Authenticated App | High-level metrics KPI grid, live assessment summary, recent cases feed, audit event log, quick reseed/verify actions. | **Medium-High** (Metric pills wrap awkwardly on 320px screens) |
| `/documents/new` | Core Workflow | 3-step investigation wizard: Parcel metadata, Document file attachment & client-side SHA-256 generation, Review & verify execution. | **High** (Progress indicator bar, touch inputs, mobile keyboard optimization) |
| `/cases` | Data Directory | Case directory with search, risk filter, status filter, desktop table and mobile card toggle. | **Medium** (Filter controls wrap tightly on mobile, English mode terminology) |
| `/cases/[id]` | Case Dossier | Deep case inspection: 4 tabs (Findings, NetworkX Graph, Document Viewer with field editor, Audit Events), Reviewer disposition panel. | **High** (Conflicting record diff view overflows mobile, tabs need smooth horizontal swipe) |
| `/documents` | Data Directory | Cryptographic library of all ingested deeds, khatians, mutations, and file hashes. | **High** (Missing mobile card list; only renders an overflowing table) |
| `/review-queue` | Operational Workflow | Queue of all fired anomaly alerts; modal dialog for human reviewer adjudication (confirm, dismiss, mark false positive). | **High** (Modal dialog is fixed-width and overflows mobile screens) |
| `/ownership-graph` | Visualization | Interactive NetworkX graph visualizer with SVG canvas, node/edge inspection, GraphRAG querying, case switcher. | **High** (Touch gestures conflict with page scroll on mobile; side panel overlay) |
| `/reports` | Export / Print | Official verification report with bilingual output, print layout (`@media print`), and JSON export. | **Medium** (Control bar layout on mobile, print styles isolation) |
| `/settings` | Configuration | User profile, 3 demo roles switcher, theme switcher, language switcher, diagnostic info, database reset. | **High** (Legacy classes `bg-cream-50` break dark mode contrast) |
| `/demo` | Interactive Showcase | 4 guided scenarios, full-pipeline monitor (Ingestion, Hash, OCR, Rules, Graph, Adjudication). | **High** (4,196-line monolith, high visual density on mobile) |
| `/login` | Authentication | Demo role authentication with explanation of reviewer, supervisor, and admin roles. | **Medium** (Touch targets and spacing on mobile) |
| `/about` | Static Content | UNLEFT team background, mission, vision, stakeholder explanations. | **Low-Medium** (Hardcoded Bengali text, needs dual-language completeness) |
| `/methodology` | Static Content | 12 deterministic rules catalog (D001-X001), severity points, family classifications, AI guardrails. | **Medium** (Rule table needs responsive card layout for small screens) |
| `/privacy` | Policy Content | Synthetic data disclosure, zero-scraping policy, cryptographic safeguards. | **Low-Medium** (Needs bilingual rendering) |
| `/terms` | Policy Content | Decision-support disclaimer, liability release, hackathon license. | **Low-Medium** (Needs bilingual rendering) |
| `/_not-found` | Utility | 404 page for nonexistent routes. | **Low** |

---

## 3. Detailed Audit by Category

### 3.1 Mobile Usability & Ergonomics (320px – 430px)
- **Viewport Testing Targets:** 320px (iPhone SE / narrow Android), 360px (standard budget Android), 390px (iPhone 13/14/15/16), 430px (iPhone Pro Max).
- **Horizontal Overflow Issues:**
  - `/documents`: Only renders an HTML `<table>` with `overflow-x-auto`. On screens < 640px, the table forces horizontal scrolling to see document hash, page count, and status.
  - `/cases/[id]`: The "Conflicting Records" table renders key-value pairs in fixed grids that push past container margins at 320px.
  - `/review-queue`: The disposition modal dialog has fixed pixel widths (`w-[540px]`), causing it to clip off-screen on small mobile devices.
- **Touch Target Sizes:**
  - Navbar controls (language toggle, theme toggle, hamburger) are styled at `p-1.5` (~32px), failing the 44×44px WCAG touch target guideline.
  - Form action buttons on mobile frequently lack full-width touch areas.
- **Mobile Navigation:**
  - No persistent bottom navigation exists. On mobile, switching between `/dashboard`, `/cases`, `/documents/new`, and `/review-queue` requires tapping the top hamburger icon every time.
  - A subtle, non-intrusive mobile bottom navigation bar (with active route indicator and safe-area padding) will dramatically improve mobile ergonomics.

### 3.2 Navigation & Information Architecture
- **Desktop Navigation:** Clean top header with submenus ("Investigations & Analysis" and "Reports & Governance"). Works well, but dropdown menus currently lack keyboard escape handling.
- **Active Route Highlighting:** Active routes in submenus are indicated, but top-level dropdown buttons only highlight on partial matches.
- **Deep-linking & Parameters:** Query parameters like `/reports?case=UB-2026-1002` and filter parameters on `/cases` are functional and must remain preserved.

### 3.3 Typography, Spacing, Visual Hierarchy & Aesthetics
- **Color Identity:** Emerald brand (`#15803D` / `#16A34A`), Warm pearl slate (`#F8FAFC` light canvas, `#0A0F15` dark canvas), Pure White surfaces (`#FFFFFF`), and crisp structural borders (`#E2E8F0` light, `#1E293B` dark).
- **Bangla Glyph Line-Height:** Bengali complex conjuncts and diacritics (যেমন: ্র, ্য, র্, ু, ূ, ী) require a minimum `line-height: 1.62` to prevent vertical glyph clipping.
- **Font Pairing:** Ensure system fallbacks gracefully prioritize Bengali typefaces (`Hind Siliguri`, `Noto Sans Bengali`) without layout shift.
- **Card Nesting:** In `/demo` and `/dashboard`, cards are occasionally nested 3 levels deep (`card -> panel -> sub-card`). Flattening surface hierarchy will improve clarity.

### 3.4 Accessibility (WCAG 2.2 AA Compliance)
- **Touch Targets:** Minimum 44×44 CSS pixels for all interactive icons, buttons, and navigation links on touch viewports.
- **Color Contrast:** Text on badges (e.g. `RiskBadge`) must achieve at least 4.5:1 contrast against badge backgrounds in both light and dark modes.
- **Focus Rings:** Visible `focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]` focus indicators for keyboard accessibility.
- **ARIA & Dialog Semantics:** Modals in `/review-queue` require `role="dialog"`, `aria-modal="true"`, focus trapping, and `Escape` key listeners.

### 3.5 Localization (Bangla & English)
- **Parity Status:** 485 translation keys currently exist in `lib/i18n.tsx`.
- **Gaps Identified:**
  - `RiskBadge.tsx`: Hardcodes "গুরুতর সংকেত", "উচ্চ ঝুঁকি", "পর্যালোচনা স্তর", "স্বাভাবিক". Must use `t()` keys.
  - `/documents/page.tsx`: Header, search input, filter dropdowns, table headers, and empty state hardcode Bengali strings.
  - `/ownership-graph/page.tsx`: Legend, case selector label, and loading message hardcode Bengali.
  - `/about/page.tsx`, `/privacy/page.tsx`, `/terms/page.tsx`: Body paragraphs are exclusively Bengali and do not toggle to English.

---

## 4. Prioritized Implementation Plan

1. **Design System & Shell Modernization (Phase 2):**
   - Standardize design tokens in `globals.css` with responsive utilities and safe touch-target helpers.
   - Upgrade `Navbar.tsx` with mobile bottom navigation bar, 44px touch targets, and accessible disclosure.
   - Upgrade `RiskBadge.tsx` with bilingual support and high-contrast WCAG 2.2 tokens.
   - Ensure clean dark/light mode toggle with zero hydration flicker.
2. **Core Pages Redesign (Phase 3):**
   - **Landing Page (`/`):** Streamline mobile hero, optimize trust stats grid, responsive cards.
   - **Dashboard (`/dashboard`):** Modernize 4 assessment questions, responsive 2x2 or 1x4 KPI grid, mobile-optimized recent activity feed.
   - **New Analysis Wizard (`/documents/new`):** Clean step progress bar, responsive upload dropzone, mobile-friendly touch inputs.
   - **Cases Directory (`/cases`):** Standardize filters, responsive desktop table + mobile card list.
   - **Case Details (`/cases/[id]`):** Responsive parcel pills, mobile-optimized conflicting records diff, touch-friendly tab bar.
   - **Documents Library (`/documents`):** Add responsive mobile stacked cards view alongside desktop table; full i18n support.
   - **Review Queue (`/review-queue`):** Mobile-friendly bottom sheet / dialog, responsive alert cards.
   - **Ownership Graph (`/ownership-graph` & Visualizer):** Touch-friendly controls, full i18n localization, dismissible inspector drawer.
   - **Reports (`/reports`):** Responsive control bar, crisp print stylesheet.
   - **Settings (`/settings`):** Remove legacy `bg-cream-50` classes, unify with design tokens, responsive role switchers.
   - **Demo (`/demo`):** Mobile ergonomic improvements, clean stage navigation, responsive output view.
   - **Methodology, About, Privacy, Terms:** Responsive typography, prose layout, bilingual dictionaries.
3. **Mobile & Accessibility Testing Pass (Phase 4):**
   - Viewport validation at 320px, 360px, 390px, 768px, 1024px+.
   - Zero horizontal overflow check.
   - Keyboard navigation and focus ring audit.
4. **Regression & Parity Verification (Phase 5):**
   - `npm run build` production check.
   - `npx tsc --noEmit` zero type error check.
   - `node test_localization.js` 100% key parity check.
   - Live backend API test battery execution.
