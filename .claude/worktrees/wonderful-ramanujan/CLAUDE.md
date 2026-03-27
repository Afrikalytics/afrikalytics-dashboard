# CLAUDE.md — Datatym AI Dashboard

## Project Overview

**Datatym AI** is a Business Intelligence PaaS (Platform-as-a-Service) designed to democratize access to decisional data in Francophone Africa.

- **Domain:** Datatym AI.com
- **Target:** 2,000-10,000 clients by end 2026
- **Triple market:**
  - **Enterprises** (GE > 500 emp, ETI 100-500, PME 10-100) — dashboards, connectors, alerts
  - **Consultants** (independents, agencies) — white-label, templates, certification
  - **Individuals** (students, junior analysts) — free tier, learning, community
- **Zones:** UEMOA, CEMAC, West & Central Francophone Africa (Vague 1: CI, SN, BJ)
- **UI Language:** French (all user-facing text in French)

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14+ (currently 16.1.6), React 18, TypeScript 5.7 | SSR/SSG, deployed on Vercel |
| Styling | Tailwind CSS 3.4, Lucide React icons | Custom `primary` blue palette |
| Backend | FastAPI Python 3.11+ | Async native, OpenAPI, deployed on Railway |
| Database | PostgreSQL 16 + Redis | RLS native, JSONB, pub/sub, caching |
| Auth | JWT custom RS256 (FastAPI) | MFA, SSO future, RBAC 4 levels |
| Multi-tenancy | Hybrid RLS + schema-based | RLS default, schema for Enterprise |
| Payments | PayDunya (FCFA / mobile money) | Native West Africa |
| AI Product | Anthropic Claude API | NLP French, large context |
| AI Dev | Claude Code + Copilot + Multi-agents | Max automation |
| CI/CD | GitHub Actions + Vercel + Railway | Native GitHub, zero cost |
| Monitoring | Sentry + Uptime Kuma + PostHog | Budget-friendly |
| PM | GitHub Issues + Projects | Unified ecosystem |

## Project Structure

```
Datatym AI-dashboard/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata, fonts)
│   ├── page.tsx                  # Index (redirects to /login)
│   ├── globals.css               # Tailwind directives
│   ├── admin/                    # Admin panel (permission-gated)
│   │   ├── page.tsx              # Studies CRUD
│   │   ├── ajouter/              # Add study
│   │   ├── modifier/[id]/        # Edit study
│   │   ├── insights/             # Insights management
│   │   │   ├── page.tsx
│   │   │   └── creer/            # Create insight
│   │   ├── reports/              # Reports management
│   │   │   └── ajouter/          # Add report
│   │   └── users/                # User management (super_admin only)
│   ├── dashboard/                # Main user dashboard
│   │   ├── page.tsx              # Dashboard home (stats, recent, upgrade)
│   │   ├── etudes/               # Studies listing + detail
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── insights/             # User insights
│   │   │   └── [id]/
│   │   └── equipe/               # Team management (enterprise)
│   ├── login/                    # Auth: login
│   ├── register/                 # Auth: register (with plan info)
│   ├── forgot-password/          # Auth: password reset request
│   ├── reset-password/           # Auth: reset form
│   ├── verify-code/              # Auth: 2FA 6-digit code
│   ├── profile/                  # User profile & settings
│   └── payment-success/          # Post-payment confirmation
├── public/                       # Static assets (favicons)
├── .claude/                      # Claude Code configuration
│   └── launch.json               # Dev server config
├── package.json
├── next.config.js                # reactStrictMode: true
├── tailwind.config.ts            # Custom primary color palette
├── tsconfig.json
├── postcss.config.js
└── CLAUDE.md                     # This file
```

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (next lint)
```

## Architecture Decisions

These are the key technical decisions from the project steering matrix:

| Domain | Decision | Justification |
|--------|----------|---------------|
| Frontend | Next.js 14+ on Vercel | SSR/SSG, Africa performance, edge |
| Backend | FastAPI Python 3.11+ on Railway | Async native, OpenAPI, ML-ready |
| Database | PostgreSQL 16 + Redis | RLS native, JSONB, pub/sub |
| Auth | JWT custom FastAPI RS256 | Full control, future SSO, RBAC |
| Multi-tenancy | Hybrid RLS + schema-based | RLS default, schema for Enterprise |
| Payments | PayDunya FCFA/mobile money | Native West Africa |
| AI Product | Anthropic Claude API | NLP French, large context |
| AI Dev | Claude Code + Multi-agents | Maximum automation |
| CI/CD | GitHub Actions + Vercel + Railway | Native GitHub, zero cost |
| Containers | Docker Compose then ECS Fargate | Simple then scaling |

## API & Backend

**Base URL:** `https://web-production-ef657.up.railway.app`

### Auth Flow
1. Login/Register → POST `/api/auth/login` or `/api/auth/register`
2. Server returns `access_token` + `user` object
3. Frontend stores in `localStorage`: `token`, `user` (JSON)
4. If `requires_verification=true` → redirect to `/verify-code?email={email}`
5. All API requests use header: `Authorization: Bearer {token}`

### Key Endpoints
- **Auth:** `/api/auth/login`, `/api/auth/register`, `/api/auth/verify-code`, `/api/auth/resend-code`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Users:** `PUT /api/users/change-password`, `GET /api/users/me`
- **Studies:** `GET|POST /api/studies`, `GET /api/studies/active`, `PUT|DELETE /api/studies/{id}`
- **Insights:** `GET|POST /api/insights`, `DELETE /api/insights/{id}`
- **Dashboard:** `GET /api/dashboard/stats`
- **Reports:** PDF download endpoints

### User Data Model
```typescript
{
  id: number
  email: string
  full_name: string
  plan: "basic" | "professionnel" | "entreprise"
  is_active: boolean
  is_admin?: boolean
  admin_role?: "super_admin" | "admin_content" | "admin_studies" | "admin_insights" | "admin_reports"
  parent_user_id?: number | null  // null = owner, number = team member
  created_at: string
}
```

## Multi-tenancy & Security

### Multi-tenancy Strategy
- **Default (Explorer/Business/Consultant):** Row-Level Security (RLS) in PostgreSQL
- **Enterprise:** Schema-based isolation (dedicated schema per tenant)
- Cross-tenant data access must be impossible (critical requirement)

### Security Controls
| Control | Implementation | Phase |
|---------|---------------|-------|
| Encryption at rest | AES-256, pgcrypto columns | Phase 1 |
| Encryption in transit | TLS 1.3 (Vercel + Railway) | Phase 0 |
| JWT | RS256, refresh tokens, Redis blacklist | Phase 1 |
| RLS PostgreSQL | Policies + cross-tenant tests | Phase 1 |
| Rate limiting | Per tenant, plan, endpoint | Phase 1 |
| Audit trail | Log all actions, timestamps, IP | Phase 1 |
| MFA | TOTP, mandatory for admins | Phase 2 |
| RBAC | Owner > Admin > Editor > Viewer | Phase 1 |
| File scan | ClamAV on imported datasets | Phase 1 |
| Dependency audit | Dependabot, npm/pip audit | Phase 0 |

### RBAC — Admin Roles
- `super_admin` — Full access to all admin features
- `admin_content` — Studies, insights, reports
- `admin_studies` — Studies only
- `admin_insights` — Insights only
- `admin_reports` — Reports only

### Compliance Targets
- ISO 27001 (T3 2026)
- SOC 2 Type II (T4 2026)
- RGPD/APDP/CDP (T1 2026)
- BCEAO conformity for banking data (T2 2026)

## Coding Conventions

### General
- **Language:** TypeScript (strict) for frontend, Python 3.11+ for backend
- **UI text:** Always in French
- **Components:** All pages use `"use client"` directive (client components)
- **State:** React `useState` + `useEffect` (no external state management)
- **Data fetching:** Native `fetch()` with manual loading/error states
- **Icons:** Lucide React exclusively
- **Styling:** Tailwind CSS utility classes inline (no CSS-in-JS)

### File Naming
- Pages: `page.tsx` inside route directories (App Router convention)
- Dynamic routes: `[id]/page.tsx`
- Use kebab-case for directory names

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Keep messages concise, in English
- Reference issue number when applicable

### Linting
- **Frontend:** ESLint (next lint) + Prettier → tsc → Jest → next build → Playwright → Lighthouse
- **Backend:** Ruff → MyPy strict → Pytest → Coverage 80% → Bandit SAST → OWASP ZAP

## Roadmap Phases

### Phase 0: Foundations (Weeks 1-2) — CRITICAL
- Docker Compose setup
- CLAUDE.md creation
- GitHub Actions CI
- Monorepo structure
- Alembic + base models
- ESLint/Ruff linting config

### Phase 1: MVP Core BI (Weeks 3-8) — T1 2026
- Complete JWT + MFA auth
- Multi-tenancy RLS
- RBAC 4 levels
- Dataset import (CSV, Excel)
- Dashboard builder drag-and-drop (15+ chart types)
- Recharts/D3 components
- REST API CRUD (Swagger)
- 10 sector templates
- PayDunya integration
- Basic white-label
- E2E tests (Playwright, 70% coverage)

### Phase 2: AI & Growth (Weeks 9-16) — T2 2026
- French NLP queries (80% accuracy)
- Anomaly detection
- Mobile money connectors (Orange, MTN, Wave)
- ERP connectors (Odoo, Sage)
- Collaboration & sharing
- Export (PDF, Excel, PPT)
- SSO (OAuth, SAML, LDAP)

### Phase 3: Scale & Embedded (Weeks 17-24) — T3 2026
- JS SDK for embedded analytics
- Template marketplace
- Advanced analytics (predictions, cohorts, what-if)
- AWS staging migration
- Load testing (10K concurrent users)
- External pentest

### Phase 4: Innovation (Weeks 25-32) — T4 2026
- AI Analyst Agent (auto-generated reports)
- Data Catalog & Governance
- AWS production migration (zero downtime)
- ISO 27001 remediation
- Wave 2 launch (CM, GA, TG, BF)

## CI/CD Pipeline

### Frontend Pipeline
`ESLint + Prettier → tsc → Jest → next build → Playwright → Lighthouse`

### Backend Pipeline
`Ruff → MyPy strict → Pytest → Coverage 80% → Bandit SAST → OWASP ZAP`

### Deploy Strategy
- **Staging:** Auto-deploy on merge to `develop`
- **Production:** Manual approval required
- **Code Review:** Claude Code analyzes each PR automatically

## Monitoring & Observability

| Layer | Tool | Cost | Metrics |
|-------|------|------|---------|
| Errors | Sentry (free 5K events) | 0 EUR | Exceptions, stack traces |
| Uptime | Uptime Kuma / BetterStack | 0-20 EUR | Availability, latency |
| Analytics | PostHog (free) | 0 EUR | Events, funnels, retention |
| Logs | Railway + Vercel native | 0 EUR | Centralized logs |
| API Perf | FastAPI middleware | 0 EUR | Latency p50/p95/p99 |
| Business | Datatym AI dogfooding | 0 EUR | MRR, churn, NPS |

## Multi-Agent Architecture

8 specialized agents orchestrated centrally (in `agents/` directory):

| Agent | Role | Triggers |
|-------|------|----------|
| Orchestrator | Project management, triage, assignment | New issue, PR, CI failure |
| Architect | Architecture guardian, ADR, schema review | Architecture issues, model PRs |
| Frontend Dev | Next.js, React, UI, dashboard | Frontend issues |
| Backend Dev | FastAPI, API, services, AI | Backend issues |
| QA Tester | Quality, tests, coverage, regressions | Every PR with `needs-tests` |
| Security | Vulnerabilities, RLS, OWASP, secrets | Auth PRs, weekly audit |
| DevOps | Infrastructure, CI/CD, deploy, monitoring | Merge to main, releases |
| Doc Writer | OpenAPI docs, guides, changelog | Merged PRs with `needs-docs` |

## Key Business Rules

### Pricing Tiers (Enterprise)
| Plan | Price/month | Users | Data | Support |
|------|------------|-------|------|---------|
| Explorer | 13,000-35,000 FCFA | 1-3 | 500K rows | Email + Chat |
| Business | 65,000-300,000 FCFA | 5-20 | 10M rows | Phone + CSM |
| Enterprise | Custom quote | Unlimited | Unlimited | Dedicated CSM + SLA |

### Pricing Tiers (Consultants)
| Plan | Price/month | Managed clients |
|------|------------|----------------|
| Solo | 20,000-50,000 FCFA | 1-5 |
| Pro | 80,000-200,000 FCFA | 6-20 |
| Agency | Custom quote | 20+ |

### Pricing Tiers (Individuals)
| Plan | Price |
|------|-------|
| Free | 0 FCFA (3 dashboards, 10K rows) |
| Learner | 5,000-10,000 FCFA/month |

### Sales Model by Segment
- **GE:** Enterprise Sales (AE, RFP, POC 30 days) — 2-4 month cycle
- **ETI:** Sales-Assisted (SDR + AE, demo) — 2-6 week cycle
- **PME:** PLG self-service, 14-day trial — 1-2 week cycle
- **Consultants:** PLG + Community, certification — 1-4 week cycle
- **Individuals:** Full PLG freemium — instant

## AWS Migration Plan
- **T1 2026:** Vercel + Railway (~200 EUR/month)
- **T3 2026:** AWS Staging — ECS Fargate + RDS + ElastiCache + CloudFront (~500 EUR/month)
- **T4 2026:** AWS Production — Multi-AZ, WAF, Terraform IaC, Backup RPO < 1h

## MCP Servers (for Claude Code)

| Server | Usage | Priority |
|--------|-------|----------|
| GitHub MCP | Issues, PRs, code review, actions | CRITICAL |
| Filesystem MCP | File read/write | CRITICAL |
| PostgreSQL MCP | DB queries, schema inspection | HIGH |
| Memory MCP | Persistent memory across sessions | HIGH |
| Fetch MCP | HTTP calls, API testing | HIGH |
| Sequential Thinking | Multi-step reasoning | HIGH |
| Sentry MCP | Production error monitoring | MEDIUM |

## Environment Variables (TODO)

The API URL is currently hardcoded. Should be moved to:
```
NEXT_PUBLIC_API_URL=https://web-production-ef657.up.railway.app
```
