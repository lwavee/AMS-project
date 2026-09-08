# Sterling AMS 360 — Insurance Management System

An AMS360-grade Cloud Agency Management System and Commercial Insurance Platform built with **Next.js 15** (App Router), **FastAPI (Python 3.11+)**, and **PostgreSQL / Supabase**.

![AMS360 Modernized Dashboard](dashboard_preview.png)

> 📘 **Full Interactive Documentation:** Open [`DOCUMENTATION.html`](DOCUMENTATION.html) or [`docs/PROJECT_DOCUMENTATION.html`](docs/PROJECT_DOCUMENTATION.html) in any browser for interactive reading or export to PDF (`Ctrl + P`).

---

## Table of Contents

1. [Project Overview & Key Features](#project-overview--key-features)
2. [Technology Stack](#technology-stack)
3. [eForms Manager & ACORD 25 System](#eforms-manager--acord-25-system)
4. [High-Fidelity PDF & Print Engine](#high-fidelity-pdf--print-engine)
5. [Policy Lifecycle & Coverages](#policy-lifecycle--coverages)
6. [UI/UX Architecture (Sterling Theme)](#uiux-architecture-sterling-theme)
7. [System Architecture & Data Flow](#system-architecture--data-flow)
8. [Folder Structure](#folder-structure)
9. [REST API Specification](#rest-api-specification)
10. [Domain & Development Standards](#domain--development-standards)
11. [Running the Project Locally](#running-the-project-locally)

---

## Project Overview & Key Features

Sterling AMS 360 unifies customer relationship management (CRM), policy administration across four primary commercial lines, hierarchical certificate management (eForms Manager), and native vector PDF compilation.

### Key Capabilities

- **Customer Center & Profiles:** Manage over 79 discrete agency fields including Service Groups, Contacts, Dependents/Locations, and Loss History.
- **Commercial Lines Management:** Dedicated modules for General Liability (GL), Business Auto (BA), Umbrella / Excess, and Workers' Compensation (Part 1 & 2).
- **Hierarchical eForms Manager:** Master/Holder certificate tree structure with full CRUD, master duplication, endorsement attachment management, and inline ACORD 25 editing.
- **Pixel-Perfect PDF Generation:** Clean vector PDF compilation powered by native browser SVG rendering (`html-to-image`) and multi-document concatenation (`pdf-lib` + `jsPDF`), eliminating table-clipping and font baseline shifts.
- **Distribution Workflows:** Built-in **Print Options** (single/batch combined PDF downloads) and **Email Options** (auto-populated email templates with certificate attachments).
- **Role-Based Access Control (RBAC):** Distinct roles for Agency Operators, Producers, Account Managers, and System Administrators.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 15.1 (App Router) | Client & Server Components, Dynamic Routing |
| **Language** | TypeScript 5.x | End-to-end type safety & shared domain interfaces |
| **Styling** | TailwindCSS v4 + Lucide Icons | Responsive layouts, Sterling brand design system |
| **Data Tables** | @tanstack/react-table v8 | Sorting, filtering, pagination, and multi-selection |
| **PDF Compilation** | `html-to-image`, `jsPDF`, `pdf-lib` | High-fidelity canvas rasterization & PDF concatenation |
| **Backend API** | FastAPI (Python 3.11+) | Async REST API, Pydantic v2 schemas |
| **Database & ORM** | PostgreSQL (Supabase) + SQLAlchemy 2.0 | Relational database, connection pooling |
| **Authentication** | Supabase Auth / JWT Bearer Tokens | Secure stateless token verification & RBAC |

---

## eForms Manager & ACORD 25 System

The eForms Manager (`/agency/customer/[id]/eforms-manager`) replicates the industry-standard ACORD form management workflow.

### Architecture

```
eForms Tree Hierarchy:
└── Customer Folder
    └── Certificate Master (e.g. "Master 2026")
        ├── Certificate Holder A (e.g. "General Contractor LLC")
        │   └── Attached Endorsement PDF (e.g. CG 20 10)
        ├── Certificate Holder B (e.g. "Property Owner Inc")
        └── Master Level Endorsements
```

### Features:
- **Interactive ACORD 25 Preview:** Displays real-time customer and policy data with live editable fields and checkboxes (Claims-Made, Occur, Additional Insured, Subrogation Waived).
- **Dynamic Policy Mapping:** Automatically synchronizes and populates coverage limits from active General Liability, Business Auto, Umbrella, and Workers' Compensation policies.
- **Duplicate & Update Masters:** Copy entire masters and associated holder lists in one click.
- **Carrier & NAIC Lookup:** Automatic carrier extraction and standard NAIC code mapping.

---

## High-Fidelity PDF & Print Engine

### Why Native Vector Rendering?
Traditional client-side HTML-to-PDF solutions (like `html2canvas`) approximate CSS parsing in JavaScript, causing text to drift upward into table borders and table cells to misalign.

Sterling AMS uses a **modern browser-native rendering pipeline**:
1. **Viewport-Aligned Isolated Iframe:** Loads the ACORD template at standard page dimensions (`850px x 1100px`) inside standard viewport coordinates to enable accurate subpixel font calculations.
2. **Native SVG foreignObject (`html-to-image`):** Inlines stylesheets and images and renders the DOM using the browser's native Blink engine at `pixelRatio: 2` (300 DPI print quality).
3. **jsPDF Page Sizing:** Places the high-resolution vector image onto standard Letter-sized pages.
4. **pdf-lib Merging:** Injects any accompanying endorsement PDF attachments seamlessly into the final downloadable file.

---

## Policy Lifecycle & Coverages

| Policy Line | Key Limits & Fields Tracked |
|---|---|
| **Commercial General Liability** | Each Occurrence, Damage to Rented Premises, Med Exp, Personal & Adv Injury, General Aggregate, Products/Completed Ops |
| **Business Automobile** | Combined Single Limit (CSL), Bodily Injury (Per Person/Accident), Property Damage, Coverage Symbols (Any Auto, Owned, Scheduled, Hired, Non-Owned) |
| **Commercial Umbrella / Excess** | Each Occurrence, Aggregate Excess Liability limits |
| **Workers' Compensation** | Part 1 Statutory Limits, Part 2 Employers Liability (Each Accident, Disease - Each Employee, Disease - Policy Limit) |

---

## UI/UX Architecture (Sterling Theme)

- **Color System:** Brand-aligned gold-taupe, slate text, light sand, and clean border tokens (`--primary: #0284c7`, `--border: #e2e8f0`).
- **Collapsible Sidebar:** Navigation for All Customers, Policies, Quick Reports, and Tools.
- **Sliding Right Drawer:** Instant quick actions (*New Activity*, *New Suspense*, *eForms*, *New Note*).
- **Multi-Tab Customer Form:** Structured checklist sections for *Basic Info*, *Service Groups*, *Contacts*, *Dependents*, and *Loss History*.

---

## System Architecture & Data Flow

```
[ Next.js 15 Client ]
      │
      │ 1. Fetch Customer, Policies, Certificate Masters & Holders
      ▼
[ FastAPI Backend /api/v1/ ]
      │
      │ 2. Queries PostgreSQL via SQLAlchemy 2.0
      ▼
[ Supabase / PostgreSQL ]
      │
      │ 3. Returns Data Models
      ▼
[ Next.js eForms Manager ]
      │
      │ 4. User reviews ACORD 25 & clicks "Print Forms" / "Email Forms"
      ▼
[ Print / Email Options Engine ]
      ├── Renders ACORD in isolated frame with coverage limits
      ├── Compiles via html-to-image (Native SVG foreignObject)
      ├── jsPDF creates Letter-sized PDF
      └── pdf-lib merges any endorsement attachments
      │
      ▼
[ Final Combined / Separate PDF Download or SMTP Email Dispatch ]
```

---

## Folder Structure

```
AMS-project/
├── DOCUMENTATION.html          # Comprehensive interactive HTML/PDF documentation
├── docs/
│   ├── PROJECT_DOCUMENTATION.html
│   ├── overview.md
│   ├── policy-management.md
│   └── ui-architecture.md
│
├── frontend/                   # Next.js 15 App Router Frontend
│   └── src/
│       ├── app/
│       │   ├── agency/
│       │   │   ├── dashboard/page.tsx               # Customer center & table
│       │   │   ├── new-customer/page.tsx            # 79-field customer creation
│       │   │   └── customer/[id]/
│       │   │       ├── eforms-manager/              # eForms tree & ACORD view
│       │   │       │   ├── print-options/page.tsx   # PDF download & print pipeline
│       │   │       │   ├── email-options/page.tsx   # Email distribution pipeline
│       │   │       │   └── add-edit-holder/page.tsx # Holder configuration
│       │   │       └── policy/                      # Policy management & details
│       │   └── admin/dashboard/page.tsx             # Admin user & system metrics
│       ├── components/                              # Reusable UI components
│       └── lib/config.ts                            # API URL and runtime constants
│
└── backend/                    # FastAPI Backend Application
    └── app/
        ├── api/v1/router.py    # Route aggregator
        ├── modules/
        │   ├── auth/           # Login, JWT verification, RBAC
        │   ├── customer/       # Customer CRUD, ORM model (79+ columns)
        │   ├── policy/         # GL, Auto, Umbrella, Workers Comp endpoints
        │   ├── certificate/    # Masters & Certificate Holders
        │   ├── documents/      # Uploaded attachments & endorsements
        │   └── admin/          # Platform stats & user roles
        ├── core/config.py      # App settings & environment loader
        └── database/           # SQLAlchemy engine & session manager
```

---

## REST API Specification

### Authentication
All protected routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/customers/` | List customers with search, sort & pagination |
| `POST` | `/api/customers/` | Create new customer profile |
| `GET` | `/api/customers/{id}` | Get full customer profile by ID |
| `PUT` | `/api/customers/{id}` | Update customer record & nested collections |
| `DELETE`| `/api/customers/{id}` | Delete customer record |
| `GET` | `/api/customers/{id}/policies` | List customer policies |
| `GET` | `/api/customers/{id}/certificates` | List certificate masters |
| `POST` | `/api/customers/{id}/certificates` | Create new certificate master |
| `GET` | `/api/customers/{id}/certificates/{certId}/holders` | List holders under master |
| `POST` | `/api/customers/{id}/certificates/{certId}/holders` | Add holder to master |
| `GET` | `/api/customers/{id}/documents` | List uploaded attachments |

---

## Domain & Development Standards

1. **Frontend is Source of Truth:** All backend schemas and API responses are designed to satisfy the frontend UI contracts.
2. **Module Pattern:** Each domain lives inside its own folder under `backend/app/modules/<domain>/` with `model.py`, `schema.py`, `repository.py`, `service.py`, and `router.py`.
3. **Thin Routers:** Route handlers in `router.py` only parse HTTP requests and delegate business logic to `service.py`.
4. **Naming Consistency:** 
   - Frontend: `camelCase`
   - Backend API & DB: `snake_case`
5. **No Parallel Implementations:** Logic exists in exactly one canonical place.

---

## Running the Project Locally

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

> **API Documentation & Swagger UI:** Visit `http://localhost:8000/docs`

**Mock Login Credentials:**
| Role | Email | Password |
|---|---|---|
| Agent | `agent@capco.com` | `password123` |
| Agency Manager | `agency@capco.com` | `password123` |
| Administrator | `admin@capco.com` | `password123` |

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> **Application URL:** Visit `http://localhost:3000`

---

## ⚡ High-Speed Performance & 24/7 Permanent Server Deployment

### 1. Data Loading Optimizations
- **Consolidated Coverages Bundle (`GET /api/customers/{id}/coverages-bundle`):** Replaced 20+ cascading sequential HTTP requests with a single atomic endpoint fetching all policies, GL, Business Auto, Umbrella, and Workers' Comp in <200ms.
- **Connection Pool Tuning:** Configured TCP socket keepalives (`keepalives_idle=30, keepalives_interval=10`), `pool_recycle=300`, and removed per-request diagnostic queries (`SELECT 1`) to eliminate remote DB latency.
- **Session Longevity & Auto-Recovery:** Extended JWT access token lifetime to **30 days** (`ACCESS_TOKEN_EXPIRE_MINUTES=43200`) and implemented automatic 3-tier backoff retries on the frontend, eliminating blank screens and unexpected logout issues.

### 2. Running Live Server & Database 24/7 Permanently

To prevent cloud hosts (e.g., Render, Railway, DigitalOcean) and local VPS terminals from stopping or sleeping:

#### Option A: PM2 Process Manager (Recommended for Production VPS)
```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Build frontend for production
npm run build --prefix frontend

# 3. Start backend & frontend under PM2 supervisor
pm2 start ecosystem.config.js

# 4. Save and configure auto-start on system reboot
pm2 save
pm2 startup
```

#### Option B: Windows Server 24/7 Supervisor
Double-click or run:
```cmd
run_permanent.bat
```
*This launches dedicated supervisor loops that auto-restart FastAPI and Next.js immediately if an unexpected error occurs.*

#### Option C: Linux VPS Supervisor
```bash
chmod +x run_permanent.sh
nohup ./run_permanent.sh > /dev/null 2>&1 &
```

#### Option D: Linux Systemd Services
Copy the included service definitions:
```bash
sudo cp systemd/ams-backend.service /etc/systemd/system/
sudo cp systemd/ams-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ams-backend ams-frontend
```

---

## Exporting System Documentation to PDF

You can generate the complete offline PDF manual at any time:
1. Open [`DOCUMENTATION.html`](DOCUMENTATION.html) or [`docs/PROJECT_DOCUMENTATION.html`](docs/PROJECT_DOCUMENTATION.html) in Google Chrome or Microsoft Edge.
2. Press **`Ctrl + P`** (or click the **"Export Documentation to PDF"** button in the sidebar).
3. Select **Destination: "Save as PDF"**, set **Margins: "Default"**, and click **Save**.
