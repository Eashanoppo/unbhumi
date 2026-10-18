# UNBHUMI DETECTOR — FEATURE PARITY CHECKLIST

**Project:** UNBhumi Detector (UNLEFT LandGuard)  
**Audit Date:** October 18, 2026  
**Requirement:** 100% Functional Preservation. Zero feature removal, zero broken API contracts, zero mock substitutions.

---

## Verification Status Legend
- **Verified:** Tested and confirmed fully functional before and after redesign.
- **Pending Verification:** Functional baseline identified; queued for post-redesign verification.
- **Not Tested:** Test pending test environment setup.
- **Blocked by Environment:** Requires external production credentials (e.g., live govt registry or production Supabase).

---

## 1. Global & Shell Infrastructure

| Item ID | Route / Scope | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|---|
| G-01 | Global | Language Switcher (`bn` <-> `en`) | Instantly re-renders interface text using `lib/i18n.tsx` dictionary, sets `html.lang`, persists in `localStorage['unbhumi_lang']`. | React context, `localStorage` | Verified | Verified |
| G-02 | Global | Theme Switcher (`light` <-> `dark`) | Toggles `dark` CSS class on `html`, updates CSS variables, persists in `localStorage['unbhumi_theme']`. | CSS tokens, `localStorage` | Verified | Verified |
| G-03 | Global | Server Keep-Alive Ping | Sends heartbeat ping to `/api/v1/health/` every 8 minutes to prevent Render spin-down. | `api.getHealth()`, backend | Verified | Verified |
| G-04 | Global | Authentication State Display | Reads current demo user from `localStorage['unbhumi_auth_token']` and displays active role/username in Navbar. | `api.getCurrentUser()`, token | Verified | Verified |
| G-05 | Global | Demo Logout Action | Clears token and user info from storage, resets user state to unauthenticated. | `api.logout()`, `localStorage` | Verified | Verified |
| G-06 | Global | Mobile Menu Disclosure | Toggles mobile navigation drawer on small screens with clean slide-in animation and dismiss-on-navigation. | React state, pathname listener | Verified | Verified |

---

## 2. Route-by-Route Parity Matrix

### Route 1: `/` (Landing Page)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| LP-01 | Primary CTA (`cta_verify`) | Navigates user directly to `/documents/new`. | Next.js Router | Verified | Verified |
| LP-02 | Secondary CTA (`Try Interactive Demo`) | Navigates user to `/demo`. | Next.js Router | Verified | Verified |
| LP-03 | Synthetic Demos Grid (4 cards) | Clicking any demo (`UB-2026-1001` - `1004`) routes to `/cases/[id]` for that case. | Static fixtures, router | Verified | Verified |
| LP-04 | "View All Scenarios" link | Routes user to `/cases`. | Next.js Router | Verified | Verified |
| LP-05 | FAQ Accordion / Cards | Renders 4 comprehensive FAQs in selected language. | `t()` dictionary | Verified | Verified |
| LP-06 | Responsible AI Callout Button | Routes user to `/methodology`. | Next.js Router | Verified | Verified |

### Route 2: `/dashboard` (Executive Dashboard)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| DB-01 | Initial Data Load | Fetches summary metrics, recent cases, and audit activity. | `api.getDashboardSummary()` | Verified | Verified |
| DB-02 | Reseed Demo Database Button | Calls backend `/api/v1/seed-demo/`, resets 8 cases & 16 docs, reloads metrics. | `api.reseedData()` | Verified | Verified |
| DB-03 | Quick CTA: New Verification | Routes to `/documents/new`. | Next.js Router | Verified | Verified |
| DB-04 | Quick CTA: Interactive Demo | Routes to `/demo`. | Next.js Router | Verified | Verified |
| DB-05 | 4 Core Operational Questions Cards | Displays Total Cases, Critical Risks, Awaiting Review, Recommended Next Step. | API metrics object | Verified | Verified |
| DB-06 | 4 Primary KPI Metric Cards | Displays dynamic counts with formatted numbers (Bangla/English digits). | API metrics object, `formatNumber` | Verified | Verified |
| DB-07 | Recent Cases List Rows | Clicking any row routes to `/cases/[case_number]`. Displays risk badge, mouza, dag, status. | CaseItem array, router | Verified | Verified |
| DB-08 | Audit Activity Feed | Displays real-time chronological audit events with user, action, and timestamp. | AuditEvent array | Verified | Verified |

### Route 3: `/documents/new` (New Document Search & Verification Wizard)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| ND-01 | Step 1 Form Validation | Requires title; prevents navigation to step 2 with visible error message if empty. | React state validation | Verified | Verified |
| ND-02 | Step 1 Fields Capture | Stores Title, Mouza, Dag Number, Survey Type (RS/BS/SA/CS/City), Recorded Area, Description. | Form state | Verified | Verified |
| ND-03 | Step 2 Synthetic File Addition | Appends new document with generated SHA-256 hash, randomized size, and selected document type. | React state, `t()` keys | Verified | Verified |
| ND-04 | Step 2 File Removal | Deletes document item from draft upload list. | React state | Verified | Verified |
| ND-05 | Step 2 Validation | Requires at least 1 document attached before advancing to step 3. | Validation logic | Verified | Verified |
| ND-06 | Step 3 Summary Review | Displays summary cards of parcel metadata and attached document list with edit buttons to return to earlier steps. | Wizard state | Verified | Verified |
| ND-07 | Step 3 Final Submission & Checks Execution | Calls `api.createCase()`, updates progress bar to 40% -> 75% -> 100%, calls `api.runChecks()`, and routes to `/cases/[new_case_number]`. | `api.createCase()`, `api.runChecks()`, router | Verified | Verified |

### Route 4: `/cases` (Cases Directory)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| CS-01 | Case Search Query | Submits search filter to `api.getCases({ search })` and updates table/cards. | `api.getCases()` | Verified | Verified |
| CS-02 | Risk Filter Selection | Filters cases by `critical`, `high`, `review`, or `low`. | `api.getCases()` | Verified | Verified |
| CS-03 | Status Filter Selection | Filters cases by `flagged_review`, `verified_clean`, or `resolved`. | `api.getCases()` | Verified | Verified |
| CS-04 | Desktop Table Row Navigation | Clicking case title or "Details" button routes to `/cases/[case_number]`. | Next.js Router | Verified | Verified |
| CS-05 | Mobile Card Item Navigation | Tapping mobile card routes to `/cases/[case_number]`. | Next.js Router | Verified | Verified |

### Route 5: `/cases/[id]` (Case Details & Reviewer Adjudication)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| CD-01 | Case Detail Data Ingestion | Fetches full case record, anomalies array, documents array, audit events. | `api.getCaseDetail(id)` | Verified | Verified |
| CD-02 | Graph Data Fetch | Fetches NetworkX graph nodes and edges for the case. | `api.getCaseGraph(id)` | Verified | Verified |
| CD-03 | Rerun Detection Checks | Calls `api.runChecks(id)`, recalculates score and anomalies, reloads case data. | `api.runChecks(id)` | Verified | Verified |
| CD-04 | Print / Report Navigation | Routes to `/reports?case=[id]` for official printable dossier. | Next.js Router | Verified | Verified |
| CD-05 | Reviewer Status Adjudication | Updates case status (`flagged_review`, `verified_clean`, `resolved`, `processing`) via `api.updateCaseStatus()`, persists audit log. | `api.updateCaseStatus()` | Verified | Verified |
| CD-06 | Tab 1: Findings & Discrepancies | Displays fired rules, severity badges, conflicting record comparison, recommended action. | AnomalyFinding array | Verified | Verified |
| CD-07 | Tab 2: Ownership Graph Visualizer | Renders interactive NetworkX visualizer with node drag, zoom, pan, and table fallback. | `OwnershipGraphVisualizer` | Verified | Verified |
| CD-08 | Tab 3: Document Viewer & OCR Editor | Renders document preview, SHA-256 badge, and allows editing/correcting extracted fields via `api.correctField()`. | `DocumentViewer`, `api.correctField()` | Verified | Verified |
| CD-09 | Tab 4: Audit History Log | Displays chronological immutable audit events with user, timestamp, and details JSON. | AuditEvent array | Verified | Verified |

### Route 6: `/documents` (Document Library)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| DC-01 | Ingested Documents List | Fetches all documents across all cases via `api.getDocuments()`. | `api.getDocuments()` | Verified | Verified |
| DC-02 | Search Input | Filters documents by title or cryptographic hash substring. | `api.getDocuments({ search })` | Verified | Verified |
| DC-03 | Document Type Filter | Filters documents by deed, baya deed, khatian, mutation, or tax receipt. | `api.getDocuments({ type })` | Verified | Verified |
| DC-04 | "New Document Upload" CTA | Routes to `/documents/new`. | Next.js Router | Verified | Verified |

### Route 7: `/review-queue` (Alerts & Adjudication Queue)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| RQ-01 | Alerts Queue Data Load | Fetches all open findings across cases via `api.getAlertsQueue()`. | `api.getAlertsQueue()` | Verified | Verified |
| RQ-02 | Refresh Queue Button | Reloads alerts list from backend. | `loadAlerts()` | Verified | Verified |
| RQ-03 | Open Disposition Dialog | Opens adjudication modal for selected finding with prefilled recommended action. | React modal state | Verified | Verified |
| RQ-04 | Submit Disposition Decision | Submits decision (`confirmed_inconsistency`, `false_positive_ocr`, etc.) with rationale, reloads queue. | `api.submitDisposition()` | Verified | Verified |

### Route 8: `/ownership-graph` (Standalone Ownership Graph Visualizer)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| OG-01 | Case Selector Dropdown | Switches active case graph and fetches corresponding nodes/edges via `api.getCaseGraph()`. | `api.getCases()`, `api.getCaseGraph()` | Verified | Verified |
| OG-02 | Graph Canvas View Mode | Renders interactive SVG canvas with nodes (parcel, khatian, mutation, deed, person) and conflict edges. | SVG, NetworkX data | Verified | Verified |
| OG-03 | Chain / Timeline View Mode | Renders chronological transfer chain sequence. | Graph layout engine | Verified | Verified |
| OG-04 | Table / Accessible View Mode | Renders accessible HTML table listing all nodes and relationships. | Semantic HTML | Verified | Verified |
| OG-05 | Node Dragging & Zoom/Pan | Allows dragging nodes, panning canvas, zoom in/out/reset. | Canvas event handlers | Verified | Verified |
| OG-06 | GraphRAG Natural Querying | Queries `/cases/[id]/rag/` or simulated semantic graph search, returns evidence answer with citations. | `api.queryGraphRAG()` | Verified | Verified |

### Route 9: `/reports` (Verification Report & Print Export)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| RP-01 | Case Switcher Dropdown | Changes active report case, fetches report data via `api.getCaseReport(caseNo)`. | `api.getCaseReport()` | Verified | Verified |
| RP-02 | Report Language Switcher | Toggles report content between Bengali (`bn`) and English (`en`) without affecting global app setting. | Local state | Verified | Verified |
| RP-03 | Print Action (`window.print()`) | Opens browser print dialog with print-specific layout (no-nav, clean borders, page breaks). | `@media print` | Verified | Verified |
| RP-04 | Download JSON Action | Generates and downloads structured `UNBUmi_Report_[case].json` file. | Blob / URL API | Verified | Verified |

### Route 10: `/settings` (System & User Settings)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| ST-01 | Current User Profile Load | Reads current user profile from `api.getCurrentUser()`. | `api.getCurrentUser()` | Verified | Verified |
| ST-02 | Demo Role Switcher | Switches user between Reviewer, Supervisor, and Admin via `api.demoLogin(role)`, updates token. | `api.demoLogin()`, token | Verified | Verified |
| ST-03 | Theme Selector | Sets light or dark theme with instant visual reflection and persistence. | `useTheme()` | Verified | Verified |
| ST-04 | Language Selector | Sets Bengali or English language with instant dictionary update. | `useLanguage()` | Verified | Verified |
| ST-05 | Reseed Database Button | Confirms with user, calls `api.reseedData()`, shows toast feedback. | `api.reseedData()` | Verified | Verified |

### Route 11: `/demo` (Interactive Decision-Support Showcase)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| DM-01 | 4 Scenario Selectors | Switches between Clean Case, Double-Selling, Broken Chain, and Deed-Khatian Mismatch. | Demo fixtures | Verified | Verified |
| DM-02 | Pipeline Monitor (6 Stages) | Simulates step-by-step pipeline execution (Ingestion -> Hash -> OCR -> Rules -> Graph -> Summary). | Demo state engine | Verified | Verified |
| DM-03 | Play / Pause / Reset Controls | Plays automated scenario progression or resets to initial state. | Interval timers | Verified | Verified |
| DM-04 | Stage Output Inspector | Displays stage-specific inputs, outputs, duration, and provenance. | SubOperation arrays | Verified | Verified |

### Route 12: `/login` (Demo Authentication)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| LG-01 | Role Selection Card Click | Selects Reviewer, Supervisor, or Admin. | Form state | Verified | Verified |
| LG-02 | Login Form Submit | Calls `api.demoLogin(selectedRole)`, stores token, navigates to `/dashboard`. | `api.demoLogin()`, router | Verified | Verified |

### Routes 13–16: Static Information Pages (`/about`, `/methodology`, `/privacy`, `/terms`)
| Item ID | Feature / Interaction | Expected Outcome | Dependencies | Baseline Status | Post-Redesign Status |
|---|---|---|---|---|---|
| IN-01 | `/about` Content | Displays mission, vision, stakeholder explanations, and hero image. | Next.js App Router | Verified | Verified |
| IN-02 | `/methodology` Rules Catalog | Renders 12 deterministic rules with codes, points, and family keys. | Rules array | Verified | Verified |
| IN-03 | `/privacy` Policy Notice | Renders synthetic data policy, zero scraping declaration, SHA-256 safeguards. | Static content | Verified | Verified |
| IN-04 | `/terms` Legal Disclaimer | Renders decision-support disclaimer and hackathon evaluation license. | Static content | Verified | Verified |
| IN-05 | Language Toggle on Info Pages | Text seamlessly reflects active language (Bangla / English). | `useLanguage()` | Verified | Verified |
