# ==============================================================================
# Comprehensive Frontend Architecture Manual: Tools, State & Design System
# Project: Interview Prep & Application Tracker
# ==============================================================================

> **CONFIDENTIAL / DEVELOPER MANUAL**  
> *This document provides an exhaustive, deep-dive explanation of the frontend architecture, design tokens, component hierarchies, state management, and typed API integration. It explains **Why** each tool is chosen and **How** it is engineered into the system.*

---

## Table of Contents
1. [Architecture Overview & Component Hierarchy](#1-architecture-overview--component-hierarchy)
2. [Next.js App Router: Server vs Client Execution](#2-nextjs-app-router-server-vs-client-execution)
3. [Design System: Tokens, Glassmorphism & Micro-Animations](#3-design-system-tokens-glassmorphism--micro-animations)
4. [Typed API Client & JWT Interception (`lib/api.ts`)](#4-typed-api-client--jwt-interception-libapits)
5. [Authentication State Lifecycle & Route Protection](#5-authentication-state-lifecycle--route-protection)
6. [Interactive Sub-Views: Kanban, Contacts, Outreach & Rounds](#6-interactive-sub-views-kanban-contacts-outreach--rounds)
7. [Error Handling & Toast Notification Strategy](#7-error-handling--toast-notification-strategy)
8. [Step-by-Step Frontend Workflow](#8-step-by-step-frontend-workflow)

---

## 1. Architecture Overview & Component Hierarchy

The frontend follows a **Modular Component-Driven Architecture**:

```
                       ┌────────────────────────┐
                       │   Root Layout (app)    │
                       └───────────┬────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   │     AuthProvider (Context)    │
                   └───────────────┬───────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       ▼                           ▼                           ▼
┌──────────────┐          ┌─────────────────┐        ┌──────────────────┐
│ /login Page  │          │ /register Page  │        │ Dashboard (Home) │
└──────────────┘          └─────────────────┘        └─────────┬────────┘
                                                               │
                                  ┌────────────────────────────┼───────────────────────────┐
                                  ▼                            ▼                           ▼
                         ┌────────────────┐           ┌────────────────┐          ┌────────────────┐
                         │ Navbar & Stats │           │ Kanban Board   │          │ Table / List   │
                         └────────────────┘           │ (Columns/Cards)│          │ (Filtered)     │
                                                      └────────────────┘          └────────────────┘
                                                               │
                                              ┌────────────────┴────────────────┐
                                              ▼                                 ▼
                                     ┌─────────────────┐               ┌─────────────────┐
                                     │ App Detail Tabs │               │ Add / Edit App  │
                                     │ - Overview/JD   │               │ Modal Form      │
                                     │ - Contacts      │               └─────────────────┘
                                     │ - Outreach Logs │
                                     │ - Rounds Timeline│
                                     └─────────────────┘
```

---

## 2. Next.js App Router: Server vs Client Execution

### Why Next.js App Router?
1. **Hybrid Execution Model**: Combines Server-Side Rendering (SSR) for initial HTML payload speed with interactive Client Components (`'use client'`) for dynamic state (drag-and-drop, modals, form inputs).
2. **Built-in Optimizations**: Fast compilation, automatic route-based code splitting, font optimization (`next/font`), and zero-config TypeScript support.
3. **Seamless Cloud Deployment**: Native alignment with Vercel and containerized Docker images.

### How It Is Integrated
- **Client Boundaries (`'use client'`)**: Interactive parts such as modals, auth context, Kanban dragging, and live filtering declare `'use client'` to leverage React state (`useState`, `useEffect`, `useCallback`).
- **Layout Composition**: `src/app/layout.tsx` wraps the application in the global `AuthProvider` and loads modern typography (`Inter` / `Outfit`).

---

## 3. Design System: Tokens, Glassmorphism & Micro-Animations

### Why a Custom Design System?
Generic templates look unfinished. A curated design system with custom CSS variables creates a high-end, responsive feel:
- **Tailored Status Color Palette**:
  - `Applied`: Indigo (`#6366f1` / `rgba(99, 102, 241, 0.15)`)
  - `Referral`: Cyan (`#06b6d4` / `rgba(6, 182, 212, 0.15)`)
  - `Interview`: Amber (`#f59e0b` / `rgba(245, 158, 11, 0.15)`)
  - `Offer`: Emerald (`#10b981` / `rgba(16, 185, 129, 0.15)`)
  - `Rejected`: Rose (`#f43f5e` / `rgba(244, 63, 94, 0.15)`)
- **Glassmorphism Tokens**:
  - `backdrop-filter: blur(12px)`
  - Frosted translucent card backgrounds (`rgba(30, 41, 59, 0.7)`) with subtle hairline borders (`rgba(255, 255, 255, 0.08)`).
- **Micro-Animations**:
  - Hover elevation transforms (`translateY(-2px)`), smooth border glow on card hover, and modal scale-in keyframe animations.

---

## 4. Typed API Client & JWT Interception (`lib/api.ts`)

### Why a Centralized Typed API Client?
1. **Type Safety & Intellisense**: Every request payload and response body is strictly typed matching the backend Pydantic schemas.
2. **Automatic JWT Injection**: Automatically retrieves the access token from `localStorage` and appends `Authorization: Bearer <token>` to all authenticated requests.
3. **Unified Error Handling**: Intercepts `401 Unauthorized` responses and automatically triggers clean logout / redirects to `/login`.

### How It Is Integrated
- `apiClient.request<T>(endpoint, options)` centralizes base URL configuration (`http://localhost:8000`), JSON serialization, and error parsing.

---

## 5. Authentication State Lifecycle & Route Protection

### The Auth Lifecycle
1. **Initial Mount**: `AuthProvider` inspects `localStorage` for `auth_token`.
2. **Hydration / Verification**: If a token exists, calls `GET /auth/me` to fetch current user profile. If invalid or expired, clears storage.
3. **Login / Register**: Upon successful authentication, persists token and updates global `user` state.
4. **Route Guard**: Protected views check if `!user && !isLoading`, redirecting unauthenticated visitors to `/login`.

---

## 6. Interactive Sub-Views: Kanban, Contacts, Outreach & Rounds

1. **Kanban Pipeline**: Grouped status columns allowing one-click advancement or status selection.
2. **Contacts & Outreach Sub-View**:
   - Lists recruiters and alumni referrers linked to the active job application.
   - Expandable outreach notes showing date sent and a toggleable checkbox for response received.
3. **Interview Rounds Timeline**:
   - Chronological cards showing round type (Tech, System Design, HR), scheduled timestamp, notes, and outcome badges (`pending`, `passed`, `failed`).

---

## 7. Step-by-Step Frontend Workflow

### 1. Start FastAPI Backend & PostgreSQL
```powershell
cd "d:\Projects\Python Projs\interview-tracker"
docker compose up -d
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### 2. Start Next.js Development Server
```powershell
cd "d:\Projects\Python Projs\interview-tracker\frontend"
npm run dev
```

### 3. Open Application
Navigate to `http://localhost:3000` in your web browser.
