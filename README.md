# Afrikalytics Dashboard

Tableau de bord premium pour **Afrikalytics AI** — plateforme de Business Intelligence pour l'Afrique francophone.

[![CI](https://github.com/Afrikalytics/afrikalytics-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Afrikalytics/afrikalytics-dashboard/actions/workflows/ci.yml)

## Stack

- **Framework :** Next.js 16 (App Router)
- **UI :** React 18 + TypeScript 5.7
- **Styling :** Tailwind CSS 3.4
- **Icons :** Lucide React
- **Auth :** JWT (localStorage + cookie mirror)
- **Tests :** Jest 30 + React Testing Library + Playwright
- **Monitoring :** Sentry (`@sentry/nextjs`)
- **CI/CD :** GitHub Actions
- **Deploiement :** Vercel

## Structure

```
afrikalytics-dashboard/
├── app/                          # 22 pages (App Router, toutes "use client")
│   ├── login/                    # Connexion
│   ├── register/                 # Inscription
│   ├── verify-code/              # 2FA
│   ├── forgot-password/          # Mot de passe oublie
│   ├── reset-password/           # Reset mot de passe
│   ├── dashboard/                # Dashboard principal
│   │   ├── etudes/               # Liste + detail etudes
│   │   ├── insights/             # Liste + detail insights
│   │   └── equipe/               # Gestion equipe (entreprise)
│   ├── profile/                  # Profil utilisateur
│   ├── admin/                    # Admin: etudes CRUD
│   │   ├── ajouter/              # Ajouter etude
│   │   ├── modifier/[id]/        # Modifier etude
│   │   ├── insights/             # Admin insights
│   │   ├── reports/              # Admin rapports
│   │   └── users/                # Admin utilisateurs (super_admin)
│   └── payment-success/          # Confirmation paiement
├── lib/
│   ├── api.ts                    # Client API centralise (fetch + headers)
│   ├── hooks/useAuth.ts          # Hook d'authentification
│   └── types.ts                  # Types TypeScript partages
├── middleware.ts                  # Auth middleware (cookie-based)
├── __tests__/helpers.ts           # Utilitaires de test partages
├── e2e/                           # 53 specs Playwright
│   ├── auth.spec.ts              # 22 specs (login, register, 2FA)
│   ├── dashboard.spec.ts         # 17 specs (navigation, etudes)
│   └── admin.spec.ts             # 14 specs (CRUD admin)
├── Dockerfile                     # Node 20-alpine
├── docker-compose.yml             # Dashboard service
├── playwright.config.ts           # 3 viewports (desktop, mobile, tablet)
├── jest.config.ts                 # Jest + jsdom
├── sentry.client.config.ts       # Sentry client
├── sentry.server.config.ts       # Sentry server
├── sentry.edge.config.ts         # Sentry edge
├── next.config.js                # CSP, Sentry, rewrites
└── .github/workflows/
    ├── ci.yml                    # Lint → Test → Build → Security
    └── claude-code.yml           # Claude Code GitHub integration
```

## Installation locale

```bash
# 1. Dependances
npm install

# 2. Variables d'environnement
cp .env.example .env.local
# Editer NEXT_PUBLIC_API_URL

# 3. Serveur de dev
npm run dev
```

Dashboard accessible sur **http://localhost:3000**

### Avec Docker

```bash
docker compose up
```

### Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev (port 3000) |
| `npm run build` | Build production + validation TypeScript |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |
| `npm test` | Tests Jest (87 tests unitaires) |
| `npm run test:e2e` | Tests Playwright (53 specs) |

## Tests

### Tests unitaires (Jest)

```bash
npm test
```

87 tests couvrant 9 pages :

| Page | Tests |
|------|-------|
| Login | 7 |
| Register | 8 |
| Verify Code | 6 |
| Forgot Password | 6 |
| Dashboard | 11 |
| Etudes | 9 |
| Admin | 8 |
| Admin Users | 10 |
| Profile | 11 |

### Tests E2E (Playwright)

```bash
npm run test:e2e
```

53 specs sur 3 viewports (Desktop Chrome, Mobile Safari, Tablet).

## Pages et routes

| Route | Description |
|-------|-------------|
| `/login` | Connexion |
| `/register` | Inscription |
| `/verify-code` | Verification 2FA |
| `/forgot-password` | Mot de passe oublie |
| `/reset-password` | Reinitialisation mot de passe |
| `/dashboard` | Dashboard principal (stats, etudes recentes) |
| `/dashboard/etudes` | Liste des etudes |
| `/dashboard/etudes/[id]` | Detail d'une etude |
| `/dashboard/insights` | Liste des insights |
| `/dashboard/insights/[id]` | Detail d'un insight |
| `/dashboard/equipe` | Gestion equipe (plan entreprise) |
| `/profile` | Profil et changement de mot de passe |
| `/admin` | Admin: gestion des etudes |
| `/admin/users` | Admin: gestion des utilisateurs |
| `/admin/insights` | Admin: gestion des insights |
| `/admin/reports` | Admin: gestion des rapports |
| `/payment-success` | Confirmation post-paiement |

## RBAC

| Role | Acces admin |
|------|-------------|
| `super_admin` | Tout (etudes, insights, rapports, utilisateurs) |
| `admin_content` | Etudes, insights, rapports |
| `admin_studies` | Etudes uniquement |
| `admin_insights` | Insights uniquement |
| `admin_reports` | Rapports uniquement |

**Plans utilisateur :** `basic`, `professionnel`, `entreprise`

## Securite

- **CSRF :** Header `X-Requested-With: XMLHttpRequest` sur tous les appels API
- **Auth middleware :** Next.js middleware verifie le cookie `auth-token` sur les routes protegees
- **Cookie mirror :** Le token JWT est duplique dans un cookie pour l'auth cote serveur
- **CSP :** `Content-Security-Policy-Report-Only` — `unsafe-inline` retire de `script-src`
- **Logout :** Efface localStorage + cookie + blacklist cote API

## Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | Oui |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry (monitoring) | Non |

## Deploiement

**Production :** Vercel (auto-deploy depuis `main`)

Les previews Vercel sont generees automatiquement pour chaque PR.

## Connexion a l'API

Le dashboard communique avec [afrikalytics-api](https://github.com/Afrikalytics/afrikalytics-api) via REST + JWT :

- URL configurable via `NEXT_PUBLIC_API_URL`
- Auth : `Authorization: Bearer {token}`
- CSRF : `X-Requested-With: XMLHttpRequest`

## Equipe

- **Organisation :** [Afrikalytics](https://github.com/Afrikalytics)
- **Email :** software@hcexecutive.net
- **Localisation :** Dakar, Senegal

---

&copy; 2024-2026 Afrikalytics AI. Tous droits reserves.
