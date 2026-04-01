# Matrice de Pilotage Projet - Afrikalytics

> Source : `afrikalytics_matrice_pilotage.docx` (Mars 2026 - CONFIDENTIEL)
> Derniere mise a jour statut : **29 mars 2026**

## 1. Decisions techniques structurantes

| Domaine | Decision | Justification | Statut reel | Ecart |
|---------|----------|---------------|-------------|-------|
| Frontend | Next.js 14+ sur Vercel | SSR/SSG, perfs Afrique, edge | FAIT — Next.js App Router, 22 pages | Toutes pages "use client" (pas de SSR) |
| Backend | FastAPI Python 3.11+ sur Railway | Async natif, OpenAPI, ML-ready | FAIT — FastAPI 0.104, 15 routers | Conforme |
| Database | PostgreSQL 16 + Redis | RLS natif, JSONB, pub/sub | PARTIEL — PostgreSQL OK, Redis configure dans config.py mais non utilise | Redis absent en pratique |
| Auth | JWT custom FastAPI RS256 | Controle total, SSO futur, RBAC | ECART — HS256 utilise (pas RS256), pas de refresh token | Migration RS256 requise |
| Multi-tenancy | Hybride RLS + schema-based | RLS defaut, schema Enterprise | ABSENT — middleware/tenant.py existe mais aucune RLS PostgreSQL | Bloquant pour lancement |
| Paiements | PayDunya FCFA/mobile money | Natif Afrique Ouest | FAIT — router + service + webhook | Conforme |
| IA Produit | API Anthropic Claude | NLP francais, context large | ABSENT — aucune integration IA produit | Phase 2 |
| IA Dev | Claude Code + Copilot + Multi-agents | Max automatisation | FAIT — 28 agents configures, 15 MCP servers | Depasse les attentes |
| CI/CD | GitHub Actions + Vercel + Railway | Natif GitHub, zero cout | FAIT — 7 workflows monorepo + workflows par projet | Conforme |
| Monitoring | Sentry + Uptime Kuma + PostHog | Budget-friendly | PARTIEL — Sentry OK, pas de Uptime Kuma ni PostHog | 2/3 manquants |

## 2. Phases et Sprints — Statut au 29 mars 2026

### Phase 0 : Fondations (Sem. 1-2) - CRITIQUE — Completion : 70%

| # | Tache | Statut | Preuve / Detail |
|---|-------|--------|-----------------|
| 0.1 | Setup Docker Compose | PARTIEL | docker-compose.yml existe (root + sub-projets), Dockerfiles OK. Pas de venv Python sur la machine |
| 0.2 | Creer CLAUDE.md | FAIT | CLAUDE.md root + dashboard + API, 28 agents, 15 skills |
| 0.3 | GitHub Actions CI | FAIT | 7 workflows : ci.yml, cd.yml, quality-gate.yml, claude-code.yml, etc. |
| 0.4 | Structurer monorepo | FAIT | dashboard/ + api/ + website/, dev.sh, deploy.sh |
| 0.5 | Alembic + modeles base | FAIT | alembic.ini + env.py + 11 migrations (initial schema, indexes, JSONB, soft-delete, payments, RLS policies, imports, notifications, SSO, integrity fix, security hardening, architectural improvements) |
| 0.6 | Config linting ESLint Ruff | PARTIEL | ESLint configure (dashboard), Ruff dans CI backend. Pas de Prettier ni MyPy strict |

### Phase 1 : MVP Core BI (Sem. 3-8) - T1 2026 — Completion : 35%

| # | Tache | Critere | Statut | Preuve / Detail |
|---|-------|---------|--------|-----------------|
| 1.1 | Auth complete JWT MFA | Pytest 100% auth | PARTIEL | JWT HS256 fonctionne (5 endpoints auth), mais pas RS256, pas MFA, pas refresh token. Tests: 20 fichiers pytest mais couverture inconnue |
| 1.2 | Multi-tenancy RLS | Cross-tenant impossible | PARTIEL | Migration 006_add_rls_policies.py avec policies sur subscriptions, payments, studies, insights, reports. middleware/tenant.py existe. Non verifie en prod — migration peut ne pas avoir ete appliquee |
| 1.3 | RBAC 4 niveaux | Tests roles exhaustifs | PARTIEL | 5 roles admin + 3 plans OK dans permissions.py, mais modele RBAC = admin roles, pas Owner/Admin/Editor/Viewer par workspace |
| 1.4 | Import datasets CSV Excel | 100MB en 30s | PARTIEL | import_service.py + modele StudyDataset existent, performance non testee |
| 1.5 | Dashboard Builder drag-drop | 15+ types graphiques | PARTIEL | 7 widgets (Bar, Line, Pie, Area, KPI, StatCard, Table). Pas de vrai drag-and-drop |
| 1.6 | Composants Recharts D3 | Rendu responsive | PARTIEL | Recharts integre via ChartLazy.tsx, responsive. Pas de D3 |
| 1.7 | API REST CRUD | Swagger fonctionnel | FAIT | 15 routers, 42+ endpoints, Swagger auto via FastAPI /docs |
| 1.8 | 10 templates sectoriels | Templates chargeables | PARTIEL | Modele MarketplaceTemplate + lib/templates.ts, mais pas de contenu verifie |
| 1.9 | Integration PayDunya | Webhook OK | FAIT | router payments.py + payment_service.py + test_payments_webhook.py |
| 1.10 | White-label basique | 3 themes testes | ABSENT | Aucun systeme de theme dynamique par tenant |
| 1.11 | Tests E2E Playwright | CI green coverage 70% | CRITIQUE | 13 tests Jest + 20 tests pytest + 3 specs Playwright. Coverage estimee ~10% (loin des 70%) |

### Phase 2 : IA et Growth (Sem. 9-16) - T2 2026 — Completion : 5%

| # | Tache | Statut | Preuve / Detail |
|---|-------|--------|-----------------|
| 2.1 | NLP Francais requetes | ABSENT | Aucune integration IA |
| 2.2 | Detection anomalies | PARTIEL | anomaly_detection.py existe dans services/, non connecte |
| 2.3 | Connecteurs mobile money | ABSENT | Seul PayDunya (pas Orange Money, Wave, MTN) |
| 2.4 | Connecteurs ERP Odoo Sage | ABSENT | integrations.py router existe mais vide |
| 2.5 | Collaboration partage | ABSENT | Pas de temps reel, pas de multi-user |
| 2.6 | Export PDF Excel PPT | ABSENT | Aucun export |
| 2.7 | SSO OAuth SAML LDAP | PARTIEL | sso_service.py + config Google/Microsoft OAuth, SSOExchangeCode model. Non fonctionnel |

### Phase 3 : Scale et Embedded (Sem. 17-24) - T3 2026 — Completion : 0%

| # | Tache | Statut | Preuve / Detail |
|---|-------|--------|-----------------|
| 3.1 | SDK JS embedded | ABSENT | — |
| 3.2 | Marketplace templates | PARTIEL | Modele DB MarketplaceTemplate existe, pas de UI marketplace |
| 3.3 | Analytics avances | ABSENT | — |
| 3.4 | Migration AWS staging | ABSENT | — |
| 3.5 | Tests charge 10K users | ABSENT | — |
| 3.6 | Pentest externe | ABSENT | — |

### Phase 4 : Innovation (Sem. 25-32) - T4 2026 — Completion : 0%

| # | Tache | Statut | Preuve / Detail |
|---|-------|--------|-----------------|
| 4.1 | Agent IA Analyste | ABSENT | — |
| 4.2 | Data Catalog Governance | ABSENT | — |
| 4.3 | Migration AWS prod | ABSENT | — |
| 4.4 | ISO 27001 remediation | ABSENT | — |
| 4.5 | Lancement Vague 2 | ABSENT | — |

## 3. Architecture Multi-Agents IA — DEPASSE

8 agents prevus, **28 agents configures** dans le repo :

| Agent prevu | Statut | Implementation reelle |
|-------------|--------|----------------------|
| Orchestrator | FAIT | orchestrator (root) + 9 agents root |
| Architect | FAIT | fullstack-architect (dashboard) |
| Frontend Dev | FAIT | frontend-dev + refactorer + debugger (dashboard, 12 agents) |
| Backend Dev | FAIT | api-architect + module-extractor (API, 7 agents) |
| QA Tester | FAIT | qa-tester (root + dashboard + API) |
| Security | FAIT | security-auditor (dashboard + API) + auth-hardener |
| DevOps | FAIT | devops-engineer (root + dashboard + API) |
| Doc Writer | FAIT | doc-writer (root + dashboard + API) |

Agents supplementaires non prevus : dedup-refactorer, a11y-fixer, perf-optimizer, ci-cd-builder, fr-reviewer, api-integrator, test-writer

## 4. MCP Servers — DEPASSE

7 serveurs prevus, **15 serveurs configures** :

| MCP Server | Prevu | Statut |
|------------|-------|--------|
| GitHub MCP | CRITIQUE | FAIT |
| Filesystem MCP | CRITIQUE | FAIT |
| PostgreSQL MCP | HAUTE | FAIT (read-only + postgres-pro) |
| Memory MCP | HAUTE | FAIT |
| Fetch MCP | HAUTE | FAIT |
| Sequential Thinking | HAUTE | FAIT |
| Sentry MCP | MOYENNE | FAIT |
| Railway MCP | NON PREVU | FAIT (bonus) |
| Playwright MCP | NON PREVU | FAIT (bonus) |
| Docker MCP | NON PREVU | FAIT (bonus) |
| Grafana MCP | NON PREVU | FAIT (bonus) |
| Supabase MCP | NON PREVU | FAIT (bonus) |
| ESLint MCP | NON PREVU | FAIT (bonus) |
| Git MCP | NON PREVU | FAIT (bonus) |
| IDE MCP | NON PREVU | FAIT (bonus) |

## 5. Securite et Multi-tenancy — Statut

| Controle | Phase prevue | Statut | Detail |
|----------|-------------|--------|--------|
| Chiffrement repos (AES-256 pgcrypto) | Phase 1 | ABSENT | Pas de pgcrypto |
| Chiffrement transit (TLS 1.3) | Phase 0 | FAIT | Vercel + Railway gerent TLS |
| JWT securise (RS256 + refresh + blacklist Redis) | Phase 1 | ECART | HS256 utilise, pas de refresh token, TokenBlacklist model existe mais Redis absent |
| RLS PostgreSQL | Phase 1 | PARTIEL | Migration 006 avec policies — non verifie en prod |
| Rate limiting par tenant/plan/endpoint | Phase 1 | PARTIEL | SlowAPI par IP uniquement, pas par tenant/plan |
| Audit trail | Phase 1 | FAIT | Modele AuditLog avec user_id, action, resource, IP, user_agent |
| MFA TOTP admin | Phase 2 | ABSENT | VerificationCode model existe (email 2FA), pas de TOTP |
| RBAC Owner/Admin/Editor/Viewer | Phase 1 | PARTIEL | 5 roles admin (super_admin, admin_content, etc.) pas le modele 4 niveaux par workspace |
| Scan fichiers ClamAV | Phase 1 | ABSENT | — |
| Dependency audit (Dependabot) | Phase 0 | ABSENT | Pas de Dependabot configure |

## 6. Pipeline CI/CD cible vs reel

| Etape pipeline | Cible | Statut |
|----------------|-------|--------|
| **Frontend** ESLint | Oui | FAIT |
| **Frontend** Prettier | Oui | ABSENT |
| **Frontend** tsc | Oui | FAIT (via next build) |
| **Frontend** Jest | Oui | FAIT (13 fichiers test) |
| **Frontend** next build | Oui | FAIT |
| **Frontend** Playwright | Oui | PARTIEL (3 specs) |
| **Frontend** Lighthouse | Oui | ABSENT |
| **Backend** Ruff | Oui | FAIT (dans CI) |
| **Backend** MyPy strict | Oui | ABSENT |
| **Backend** Pytest | Oui | FAIT (20 fichiers test) |
| **Backend** Coverage 80% | Oui | ECART (~40% minimum dans CI) |
| **Backend** Bandit SAST | Oui | ABSENT |
| **Backend** OWASP ZAP | Oui | ABSENT |
| Deploy staging auto sur merge | Oui | FAIT (Vercel + Railway) |
| Deploy prod approbation manuelle | Oui | PARTIEL (auto-deploy, pas d'approbation) |

## 7. Plan migration infra

| Etape | Timeline | Statut |
|-------|----------|--------|
| Vercel + Railway (~200 EUR/mois) | T1 2026 | FAIT — en production |
| AWS Staging (ECS Fargate + RDS + ElastiCache + CloudFront) | T3 2026 | ABSENT — pas commence |
| AWS Production (Multi-AZ, WAF, Terraform IaC, RPO < 1h) | T4 2026 | ABSENT — pas commence |

---

## Resume executif

| Phase | Completion | Bloquants |
|-------|-----------|-----------|
| **Phase 0** Fondations | **70%** | Alembic absent, Redis absent, Prettier/MyPy manquants |
| **Phase 1** MVP Core BI | **35%** | Multi-tenancy RLS, JWT RS256, drag-drop builder, coverage tests |
| **Phase 2** IA et Growth | **5%** | NLP, connecteurs, exports, SSO non fonctionnel |
| **Phase 3** Scale | **0%** | Pas commence |
| **Phase 4** Innovation | **0%** | Pas commence |
| **Score global** | **~25%** | Nous sommes en semaine 4 (fin T1), Phase 1 devrait etre a 80%+ |
