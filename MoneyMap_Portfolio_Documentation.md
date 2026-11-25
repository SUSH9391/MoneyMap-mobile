# MoneyMap — Intelligent Personal Budgeting & Financial Visualization

> **Live Links:**  
> 📱 **Frontend Repository:** [github.com/SUSH9391/MoneyMap-mobile](https://github.com/SUSH9391/MoneyMap-mobile)  
> ⚙️ **Backend Repository:** [github.com/SUSH9391/MoneyMap-backend](https://github.com/SUSH9391/MoneyMap-backend)  
> 🏷️ **Tech Stack:** Expo (React Native) • TypeScript • Node.js • Prisma ORM • PostgreSQL • Docker

---

## 1. Executive Summary & Project Overview

**MoneyMap** is a full-stack mobile budgeting and personal financial management platform built to give users complete control and clarity over their financial health. Traditional financial apps often overwhelm users with complex spreadsheets or delayed bank feeds. MoneyMap solves this by offering an intuitive, visual-first experience: users define flexible budgets across **Weekly**, **Monthly**, or **Yearly** cycles and immediately see real-time visual representations of **how much they have spent** versus **how much remains**.

By pairing immediate visual feedback (progress rings, dynamic bar charts, color-coded threshold alerts) with automated receipt scanning (OCR) and an enterprise-grade authentication lifecycle, MoneyMap empowers users to stay financially disciplined effortlessly.

---

## 2. Core Features & Capabilities

### 📅 1. Dynamic Multi-Cycle Budgeting
- **Flexible Time Horizons:** Configure budgets on **Weekly**, **Monthly**, or **Yearly** bases to accommodate diverse income cycles, recurring allowances, or annual goals.
- **Category-Bound Allocation:** Assign budgets to specific spending categories (e.g., Groceries, Housing, Dining, Entertainment) or set global monthly spending caps.
- **Automated Rollover & Reset:** Seamless transition across budget cycles with historical retention for month-over-month comparisons.

### 📊 2. Visual Spend & Remaining Gauge
- **Real-Time Visual Representation:** High-impact progress rings and segmented bar charts that clearly show spent funds vs. remaining disposable balance.
- **Color-Coded Threshold Warnings:**
  - 🟢 **Safe Zone (< 75%):** Calm green progress indicator confirming spending is on track.
  - 🟡 **Caution Zone (75% – 90%):** Subtle amber warning indicating high utilization.
  - 🔴 **Over-Budget (> 100%):** Prominent red visual alert indicating budget depletion.
- **Instant Stat Summaries:** Quick-glance cards showing "Total Allocated", "Amount Spent", and "Remaining Balance" updated on every transaction.

### 💳 3. Comprehensive Transaction Tracking
- **Multi-Filter Ledger:** Instant search and query filtering by Date Range, Category, Budget allocation, and Transaction Type (Expense vs. Income).
- **Multi-Currency Support:** Standardized international currency selection (USD, EUR, GBP, INR, etc.) stored in global settings.
- **Manual & Automated Entries:** One-touch manual transaction entry with autocomplete, notes, and merchant tagging.

### 🧾 4. AI-Powered Smart Receipt Scanning
- **Camera & Gallery Integration:** Capture receipts directly via native camera or select existing images using `expo-image-picker`.
- **OCR Item Extraction:** Automated extraction pipeline parsing merchant name, line items, transaction date, taxes, and total amount.
- **Interactive Review Flow:** An intuitive `/receipt-review` interface allowing users to adjust category mappings and confirm transactions prior to ledger commit.

### 🔒 5. Enterprise-Grade Authentication & Security
- **Dual-Token JWT Architecture:** 15-minute short-lived `accessToken` paired with 30-day cryptographically secure `refreshToken`.
- **Hardware-Backed Storage:** Sensitive session tokens stored securely via `expo-secure-store` (Keychain on iOS, Keystore on Android).
- **Concurrent Request Interceptor:** Custom Axios queue interceptor that catches 401 Unauthorized responses, executes a single refresh rotation, and replays all queued network calls without user disruption.
- **Account Recovery:** Secure password reset deep-linking via signed tokens.

---

## 3. System Architecture & Tech Stack

MoneyMap employs a decoupled **Client-Server Layered Architecture**, separating the presentation client, API orchestration, and containerized data persistence.

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATION                   │
│   React Native (Expo SDK 54) + TypeScript + NativeWind  │
│   ├── Presentation: Expo Router v6 (File-based routes) │
│   ├── State: Zustand v5 (Auth, Settings State Machine) │
│   └── Network / Cache: TanStack React Query + Axios    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼────────────────────────────┐
│                    BACKEND SERVICES                    │
│           Node.js / Express RESTful Engine             │
│   ├── Middleware: JWT Auth, CORS, Request Validation   │
│   ├── Controller & Service Business Logic              │
│   └── Data Layer: Prisma ORM (Type-Safe Query Builder) │
└───────────────────────────┬────────────────────────────┘
                            │ TCP / Database Protocol
┌───────────────────────────▼────────────────────────────┐
│               PERSISTENCE & CONTAINERIZATION           │
│        PostgreSQL Database running inside Docker       │
│   └── Managed volumes, isolated network, migrations    │
└────────────────────────────────────────────────────────┘
```

### Technology Breakdown

| Domain | Technology | Purpose & Implementation Details |
|---|---|---|
| **Mobile Frontend** | **React Native (Expo SDK 54)** | Cross-platform native application for iOS and Android |
| **Language** | **TypeScript 5.9** | Strict end-to-end type safety, eliminating runtime null/undefined bugs |
| **Routing** | **Expo Router v6** | File-based navigation supporting nested stack, tab layouts, and deep links |
| **Client State** | **Zustand 5** | Lightweight, boilerplate-free state machine for Auth & User Settings |
| **Server State** | **TanStack React Query 5**| Declarative caching, background polling, and optimistic UI updates |
| **Styling** | **NativeWind (Tailwind v4)** | Utility-first responsive design matching the curated Soft Violet palette |
| **Backend API** | **Node.js & Express** | RESTful microservice handling CRUD operations, auth, and analytics |
| **ORM** | **Prisma ORM** | Schema migrations, type-safe data modeling, and optimized relation queries |
| **Database** | **PostgreSQL** | Relational integrity, ACID compliance, and relational aggregation |
| **Infrastructure** | **Docker & Docker Compose** | Reproducible containerized PostgreSQL database service |
| **Security** | **expo-secure-store + JWT** | Hardware-level credential storage and rotated token lifecycle |

---

## 4. Software Engineering Principles & Best Practices Applied

The development of MoneyMap was guided by foundational software engineering tenets to ensure long-term maintainability, reliability, and scalability:

### 1. SOLID Principles
- **Single Responsibility Principle (SRP):**
  - Modular UI components handle strictly presentation (e.g., `BudgetCard`, `CreateBudgetSheet`).
  - Business logic and query synchronization are encapsulated within dedicated custom hooks (`useBudgets`, `useFilteredTransactions`).
  - Backend controllers strictly route HTTP requests, delegating data manipulation to domain services and Prisma access layers.
- **Open / Closed Principle (OCP):**
  - The categorization and budgeting subsystems are open to extension (custom categories, dynamic color schemes, new period intervals: weekly/monthly/yearly) without altering core calculation engines.
- **Dependency Inversion Principle (DIP):**
  - High-level application screens do not depend directly on transport implementations; they consume abstract service hooks powered by centralized Axios clients and React Query caches.

### 2. Separation of Concerns (SoC)
- Strict tripartite client separation:
  1. **UI Layer:** Pure components utilizing Tailwind styling and declarative JSX.
  2. **Application State Layer:** Zustand stores managing long-lived authentication and preferences.
  3. **Data Communication Layer:** Standardized API endpoint definitions with centralized error handling and request interception.

### 3. Containerization & Infrastructure as Code (Docker)
- By containerizing the PostgreSQL instance via **Docker**, the development and deployment pipelines remain identical across operating systems.
- Prevents "works on my machine" discrepancies, guarantees consistent database extensions and collation, and allows one-command initialization of the entire persistent backend.

### 4. Resilient Network & State Machine Patterns
- **Concurrent Token Refresh Guard:** In mobile apps, multiple dashboard widgets fire concurrent API requests on app launch. MoneyMap's Axios interceptor queues simultaneous `401 Unauthorized` responses into a single promise pool, triggers one refresh call, and seamlessly replays the entire queue upon success.
- **Optimistic Updates:** Enhances perceived user performance by updating budget and transaction states instantly in the UI before network confirmation.

### 5. Defensive Security & Data Integrity
- **ACID Transactions:** Financial operations (e.g., deducting an expense and recalculating remaining budget balances) are guarded by PostgreSQL transactional guarantees through Prisma.
- **Zero SQL Injection Risk:** All queries utilize Prisma ORM’s parameterized abstraction.
- **Zero-Trust Token Storage:** Authentication credentials and refresh tokens never touch unencrypted AsyncStorage; they are locked in native secure enclaves.

---

## 5. Summary & Portfolio Reflection

MoneyMap illustrates modern mobile software engineering from design to infrastructure: combining responsive React Native UI engineering, declarative data caching, containerized persistence, and robust security protocols into a cohesive, user-centric product.
