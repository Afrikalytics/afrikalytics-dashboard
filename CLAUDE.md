# CLAUDE.md — Afrikalytics Dashboard (Frontend Next.js)

Ce fichier guide Claude Code pour le developpement du frontend Afrikalytics.
Voir aussi `../CLAUDE.md` pour le contexte monorepo global et `../afrikalytics-api/CLAUDE.md` pour le backend.

## Project Overview

Afrikalytics Dashboard — tableau de bord premium pour Afrikalytics AI, plateforme de Business Intelligence pour l'Afrique francophone. Toute l'interface est en francais.

## Development Commands

```bash
npm install      # Install dependencies (first time / after package.json changes)
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Production build (also validates TypeScript)
npm run start    # Start production server
npm run lint     # ESLint via next lint
```

Jest + React Testing Library configured (`jest.config.ts`), with shared test helpers in `__tests__/helpers.ts`. Playwright for E2E (3 specs in `e2e/`). Test specs to write (0% coverage). Part of the Afrikalytics monorepo workspace (see parent `CLAUDE.md`).

## Architecture

**Stack:** Next.js 16 (App Router) + React 18 + TypeScript 5.7 + Tailwind CSS 3.4 + Lucide React icons. Note: `eslint-config-next` is pinned to 14.x for compatibility.

**Backend:** External FastAPI API on Railway. Base URL hardcoded as `const API_URL = "https://web-production-ef657.up.railway.app"` in each page file (should eventually move to `NEXT_PUBLIC_API_URL` env var).

**Auth:** JWT tokens stored in `localStorage` (`token` and `user` keys). All authenticated API calls use `Authorization: Bearer {token}` header. Login supports optional 2FA (6-digit code via `/verify-code`).

**State management:** Plain React `useState` + `useEffect` — no Redux, Zustand, or other state libraries. Data fetching uses native `fetch()` with manual loading/error handling.

**Components:** Shared code exists in `lib/` (`api.ts`, `hooks/useAuth.ts`, `types.ts`). The root layout (`app/layout.tsx`) uses Inter font via `next/font/google`.

**Routing:** Next.js App Router with route group `app/(dashboard)/` for authenticated pages (shared layout with sidebar). Public pages (`login`, `register`, etc.) remain at `app/` root. Every page is a client component (`"use client"`). The root `/` redirects to `/login`.

**Remaining tech debt:** Some pages still use inline auth checks (localStorage) instead of the `useAuth` hook, and inline fetch instead of `lib/api.ts`.

### Key Routes

| Route | Purpose |
|-------|---------|
| `/login`, `/register` | Authentication |
| `/forgot-password`, `/reset-password`, `/verify-code` | Password recovery & 2FA |
| `/dashboard` | Main dashboard with stats and recent studies |
| `/dashboard/etudes`, `/dashboard/etudes/[id]` | Studies listing and detail |
| `/dashboard/insights`, `/dashboard/insights/[id]` | Insights listing and detail |
| `/dashboard/equipe` | Team management (enterprise plan owners only) |
| `/profile` | User profile and password change |
| `/payment-success` | Post-payment confirmation |
| `/admin` | Admin: studies CRUD |
| `/admin/ajouter`, `/admin/modifier/[id]` | Admin: add/edit study |
| `/admin/insights`, `/admin/insights/creer` | Admin: insights management |
| `/admin/reports`, `/admin/reports/ajouter` | Admin: reports management |
| `/admin/users` | Admin: user management (super_admin only) |

### RBAC (Admin Roles)

Admin permissions are defined in `app/(dashboard)/dashboard/page.tsx` via `ADMIN_PERMISSIONS`:

- `super_admin` — full access (studies, insights, reports, users)
- `admin_content` — studies, insights, reports
- `admin_studies` — studies only
- `admin_insights` — insights only
- `admin_reports` — reports only

### User Plans

Three tiers: `basic`, `professionnel`, `entreprise`. Enterprise plan owners (`parent_user_id === null`) can manage a team of up to 5 users.

### API Endpoints

- **Auth:** `/api/auth/login`, `/api/auth/register`, `/api/auth/verify-code`, `/api/auth/resend-code`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Users:** `GET /api/users/me`, `PUT /api/users/change-password`
- **Studies:** `GET|POST /api/studies`, `GET /api/studies/active`, `PUT|DELETE /api/studies/{id}`
- **Insights:** `GET|POST /api/insights`, `DELETE /api/insights/{id}`
- **Dashboard:** `GET /api/dashboard/stats`
- **Reports:** PDF download endpoints

## Coding Conventions

- All pages are client components with `"use client"` directive
- Icons: Lucide React exclusively — do not use other icon libraries
- Styling: Tailwind CSS utility classes inline — no CSS-in-JS, no separate CSS files beyond `globals.css`
- Custom Tailwind color: `primary` (blue palette mirroring standard Tailwind blue, defined in `tailwind.config.ts`). Use `primary-600` / `primary-700` for interactive elements.
- Path alias: `@/*` maps to project root
- File naming: `page.tsx` inside route directories, kebab-case for directory names, `[id]` for dynamic segments
- Commit messages: conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`) in English

## Deployment

- **Frontend:** Vercel (auto-deploy from GitHub)
- **Backend:** Railway

## Reference Documents

**IMPORTANT:** Always consult these documents before any development work. They define the project roadmap and known issues.

Located in `docs/references/`:

- **`audit-rapport-afrikalytics.md`** — Technical audit report (score 3.2/10). Lists all critical security issues, code quality problems, and architectural debt. Every fix or new feature should check whether it addresses any audit finding.
- **`matrice-pilotage.md`** — Project steering matrix. Defines the 4-phase roadmap (Foundations → MVP Core BI → IA & Growth → Scale), multi-agent architecture, tech decisions, CI/CD pipeline targets, and security requirements.

Key priorities from these references:
1. **Security first:** Migrate API_URL to env var, centralize auth (useAuth hook + middleware), validate roles server-side
2. **Reduce duplication:** Extract shared Sidebar component, create dashboard layout, centralize API service (`lib/api.ts`)
3. **Add testing:** Jest + React Testing Library + Playwright, target 70% coverage
4. **Target architecture:** Shared layouts, centralized types (`lib/types.ts`), constants (`lib/constants.ts`), Zustand/Context for global state
