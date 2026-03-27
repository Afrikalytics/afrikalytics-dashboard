<p align="center">
  <h1 align="center">Datatym AI Dashboard</h1>
  <p align="center">
    <strong>Tableau de bord premium de Business Intelligence pour l'Afrique francophone</strong>
  </p>
  <p align="center">
    <a href="https://github.com/Datatym AI/Datatym AI-dashboard/actions/workflows/ci.yml"><img src="https://github.com/Datatym AI/Datatym AI-dashboard/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18">
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/Tests-3_E2E_specs-green" alt="Tests">
    <img src="https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel" alt="Vercel">
    <img src="https://img.shields.io/badge/Langue-Fran%C3%A7ais-blue" alt="Langue: Francais">
  </p>
</p>

---

Interface web d'**Datatym AI AI**, la plateforme SaaS qui fournit des etudes de marche, insights et rapports strategiques aux entreprises d'Afrique francophone. Le dashboard permet aux utilisateurs de consulter leurs donnees, aux administrateurs de gerer le contenu, et integre les paiements en FCFA via mobile money.

> **Partie frontend du monorepo Datatym AI.** Le backend associe se trouve dans [`Datatym AI-api`](https://github.com/Datatym AI/Datatym AI-api).

## Fonctionnalites

| Domaine | Description |
|---------|-------------|
| **Authentification** | Login, inscription, verification 2FA, recuperation de mot de passe |
| **Dashboard** | Statistiques en temps reel, etudes recentes, navigation rapide |
| **Etudes de marche** | Consultation des etudes actives, detail avec visualisations embarquees |
| **Insights** | Analyses cles, recommandations, syntheses par etude |
| **Rapports PDF** | Telechargement de rapports selon le plan souscrit |
| **Gestion equipe** | Ajout/gestion de 5 membres (plan Entreprise) |
| **Administration** | CRUD complet etudes, insights, rapports, utilisateurs |
| **Paiements** | Integration PayDunya (FCFA, Orange Money, Wave, Free Money) |
| **Monitoring** | Sentry pour le suivi des erreurs en production |

## Architecture

```
                                 +---------------------------+
                                 |        Vercel (CDN)       |
                                 |    Datatym AI-dashboard |
                                 +------------+--------------+
                                              |
                                    REST API + JWT Bearer
                                              |
                                 +------------v--------------+
                                 |    Railway (Backend)      |
                                 |     Datatym AI-api      |
                                 +--+----------+----------+--+
                                    |          |          |
                               PostgreSQL   Resend    PayDunya
                                 (Data)    (Emails)  (Paiements)
```

### Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| UI | React 18 + TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 (palette `primary` custom) |
| Icons | Lucide React |
| Auth | JWT (localStorage + cookie mirror + middleware) |
| State | React useState/useEffect (pas de state manager externe) |
| Tests unitaires | Jest 30 + React Testing Library |
| Tests E2E | Playwright (3 viewports : Desktop, Mobile, Tablet) |
| Monitoring | Sentry (`@sentry/nextjs`) |
| CI/CD | GitHub Actions (lint, test, build, security) |
| Deploy | Vercel (auto-deploy depuis `main`) |

## Demarrage rapide

### Prerequis

- **Node.js** 18+ et **npm** 9+

### Installation

```bash
# Cloner le repository
git clone https://github.com/Datatym AI/Datatym AI-dashboard.git
cd Datatym AI-dashboard

# Installer les dependances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Editer .env.local et definir NEXT_PUBLIC_API_URL
```

### Lancer le serveur de developpement

```bash
npm run dev
```

Le dashboard est accessible sur **http://localhost:3000**

### Avec Docker

```bash
docker compose up
```

## Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de developpement (port 3000) |
| `npm run build` | Build production + validation TypeScript |
| `npm run start` | Serveur de production |
| `npm run lint` | Analyse ESLint |
| `npm test` | Tests unitaires Jest (framework configure, specs a ecrire) |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npm run test:e2e` | Tests E2E Playwright |
| `npm run test:e2e:ui` | Tests E2E avec interface visuelle |

## Tests

### Tests unitaires

```bash
npm test
```

Le framework Jest + React Testing Library est configure (`jest.config.ts`). Les utilitaires de test partages (`__tests__/helpers.ts`) fournissent des mocks pour le router, fetch, localStorage et les icones Lucide. Les specs de test unitaires sont a ecrire (couverture actuelle : 0%).

### Tests E2E — 3 specs Playwright

```bash
npm run test:e2e
```

Executes sur 3 viewports : Desktop Chrome, Mobile Safari, Tablet.

## Structure du projet

```
Datatym AI-dashboard/
├── app/                            # Pages (App Router, toutes "use client")
│   ├── login/                      # Connexion
│   ├── register/                   # Inscription
│   ├── verify-code/                # Verification 2FA
│   ├── forgot-password/            # Mot de passe oublie
│   ├── reset-password/             # Reinitialisation mot de passe
│   ├── payment-success/            # Confirmation post-paiement
│   └── (dashboard)/                # Route group (layout partage avec sidebar)
│       ├── layout.tsx              # Layout partage pour les pages authentifiees
│       ├── dashboard/              # Dashboard principal
│       │   ├── etudes/             # Liste + detail des etudes
│       │   ├── insights/           # Liste + detail des insights
│       │   └── equipe/             # Gestion equipe (plan Entreprise)
│       ├── profile/                # Profil utilisateur
│       └── admin/                  # Administration
│           ├── ajouter/            # Ajouter une etude
│           ├── modifier/[id]/      # Modifier une etude
│           ├── insights/           # Gestion insights
│           ├── reports/            # Gestion rapports
│           └── users/              # Gestion utilisateurs (super_admin)
├── lib/
│   ├── api.ts                      # Client API centralise (fetch + auth headers)
│   ├── hooks/useAuth.ts            # Hook d'authentification
│   └── types.ts                    # Types TypeScript partages
├── middleware.ts                    # Auth middleware Next.js (cookie-based)
├── __tests__/                       # Utilitaires de test Jest (helpers.ts)
├── e2e/                             # 3 specs Playwright (auth, admin, dashboard)
├── .github/workflows/
│   ├── ci.yml                      # Pipeline CI (lint, test, build, security)
│   └── claude-code.yml             # Integration Claude Code
├── Dockerfile                       # Node 20-alpine
├── docker-compose.yml               # Service dashboard
├── playwright.config.ts             # Configuration E2E
├── jest.config.ts                   # Configuration tests unitaires
├── sentry.client.config.ts          # Sentry (client)
├── sentry.server.config.ts          # Sentry (serveur)
├── next.config.js                   # CSP, Sentry, rewrites
├── tailwind.config.ts               # Palette custom Datatym AI
└── tsconfig.json                    # Path alias @/*
```

## Pages et routes

| Route | Description | Auth requise |
|-------|-------------|:------------:|
| `/login` | Connexion | Non |
| `/register` | Inscription | Non |
| `/verify-code` | Verification code 2FA | Non |
| `/forgot-password` | Demande de reinitialisation | Non |
| `/reset-password` | Nouveau mot de passe | Non |
| `/dashboard` | Dashboard principal (stats, etudes recentes) | Oui |
| `/dashboard/etudes` | Liste des etudes de marche | Oui |
| `/dashboard/etudes/[id]` | Detail d'une etude | Oui |
| `/dashboard/insights` | Liste des insights | Oui |
| `/dashboard/insights/[id]` | Detail d'un insight | Oui |
| `/dashboard/equipe` | Gestion d'equipe | Oui (Entreprise) |
| `/profile` | Profil et mot de passe | Oui |
| `/admin` | Gestion des etudes | Oui (Admin) |
| `/admin/users` | Gestion des utilisateurs | Oui (super_admin) |
| `/admin/insights` | Gestion des insights | Oui (Admin) |
| `/admin/reports` | Gestion des rapports | Oui (Admin) |
| `/payment-success` | Confirmation paiement | Oui |

## Controle d'acces (RBAC)

### Roles administrateur

| Role | Etudes | Insights | Rapports | Utilisateurs |
|------|:------:|:--------:|:--------:|:------------:|
| `super_admin` | Oui | Oui | Oui | Oui |
| `admin_content` | Oui | Oui | Oui | Non |
| `admin_studies` | Oui | Non | Non | Non |
| `admin_insights` | Non | Oui | Non | Non |
| `admin_reports` | Non | Non | Oui | Non |

### Plans utilisateur

| Plan | Acces etudes | Rapports | Gestion equipe |
|------|:------------:|:--------:|:--------------:|
| `basic` | Limite | Non | Non |
| `professionnel` | Complet | Oui | Non |
| `entreprise` | Complet | Oui | Oui (5 membres) |

## Securite

- **CSRF** : header `X-Requested-With: XMLHttpRequest` sur tous les appels API
- **Auth middleware** : Next.js middleware verifie le cookie `auth-token` sur les routes protegees
- **Cookie mirror** : le token JWT est duplique dans un cookie httpOnly pour l'auth cote serveur
- **CSP** : `Content-Security-Policy-Report-Only` configure, `unsafe-inline` retire de `script-src`
- **Logout** : efface localStorage + cookie + blacklist cote API
- **Sentry** : monitoring des erreurs en temps reel

## Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|:------:|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | Oui |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry (monitoring erreurs) | Non |

## Deploiement

| Environnement | Plateforme | Declencheur |
|---------------|-----------|-------------|
| Production | Vercel | Push sur `main` |
| Preview | Vercel | Ouverture de PR |

Le pipeline CI (GitHub Actions) execute automatiquement : **Lint** > **Tests unitaires** > **Build** > **Analyse de securite** avant chaque merge.

## Connexion avec l'API

Le dashboard communique avec [`Datatym AI-api`](https://github.com/Datatym AI/Datatym AI-api) :

- **Protocole** : REST over HTTPS
- **Authentification** : `Authorization: Bearer {JWT}`
- **CSRF** : `X-Requested-With: XMLHttpRequest`
- **URL** : configurable via `NEXT_PUBLIC_API_URL`

## Contribution

1. Creer une branche depuis `main` : `git checkout -b feat/ma-fonctionnalite`
2. Respecter les **conventional commits** en anglais (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
3. S'assurer que `npm run lint` et `npm test` passent
4. Ouvrir une Pull Request avec une description claire

## Equipe

| | |
|---|---|
| **Organisation** | [Datatym AI](https://github.com/Datatym AI) |
| **Email** | software@hcexecutive.net |
| **Localisation** | Dakar, Senegal |

---

<p align="center">
  <strong>Datatym AI AI</strong> — Business Intelligence pour l'Afrique francophone<br>
  &copy; 2024-2026 Datatym AI. Tous droits reserves.
</p>
