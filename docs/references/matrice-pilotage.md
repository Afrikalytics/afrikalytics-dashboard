# Matrice de Pilotage Projet - Afrikalytics

> Source : `afrikalytics_matrice_pilotage.docx` (Mars 2026 - CONFIDENTIEL)

## 1. Decisions techniques structurantes

| Domaine | Decision | Justification |
|---------|----------|---------------|
| Frontend | Next.js 14+ sur Vercel | SSR/SSG, perfs Afrique, edge |
| Backend | FastAPI Python 3.11+ sur Railway | Async natif, OpenAPI, ML-ready |
| Database | PostgreSQL 16 + Redis | RLS natif, JSONB, pub/sub |
| Auth | JWT custom FastAPI RS256 | Controle total, SSO futur, RBAC |
| Multi-tenancy | Hybride RLS + schema-based | RLS defaut, schema Enterprise |
| Paiements | PayDunya FCFA/mobile money | Natif Afrique Ouest |
| IA Produit | API Anthropic Claude | NLP francais, context large |
| IA Dev | Claude Code + Copilot + Multi-agents | Max automatisation |
| CI/CD | GitHub Actions + Vercel + Railway | Natif GitHub, zero cout |
| Monitoring | Sentry + Uptime Kuma + PostHog | Budget-friendly |

## 2. Phases et Sprints

### Phase 0 : Fondations (Sem. 1-2) - CRITIQUE
- Setup Docker Compose
- Creer CLAUDE.md
- GitHub Actions CI
- Structurer monorepo
- Alembic + modeles base
- Config linting ESLint Ruff

### Phase 1 : MVP Core BI (Sem. 3-8) - T1 2026
- Auth complete JWT MFA (Pytest 100% auth)
- Multi-tenancy RLS (cross-tenant impossible)
- RBAC 4 niveaux (Owner, Admin, Editor, Viewer)
- Import datasets CSV/Excel (100MB en 30s)
- Dashboard Builder drag-drop (15+ types graphiques)
- Composants Recharts/D3 (responsive)
- API REST CRUD (Swagger fonctionnel)
- 10 templates sectoriels
- Integration PayDunya (webhook OK)
- White-label basique (3 themes)
- Tests E2E Playwright (CI green, coverage 70%)

### Phase 2 : IA et Growth (Sem. 9-16) - T2 2026
- NLP Francais requetes (accuracy 80%)
- Detection anomalies
- Connecteurs mobile money
- Connecteurs ERP Odoo/Sage (sync bidirectionnel)
- Collaboration/partage multi-user temps reel
- Export PDF/Excel/PPT
- SSO OAuth/SAML/LDAP

### Phase 3 : Scale et Embedded (Sem. 17-24) - T3 2026
- SDK JS embedded (iframe 10min)
- Marketplace templates (10+)
- Analytics avances (predictions 30 jours)
- Migration AWS staging
- Tests charge 10K users (SLA respectes)
- Pentest externe (0 faille critique)

### Phase 4 : Innovation (Sem. 25-32) - T4 2026
- Agent IA Analyste (rapports auto-generes)
- Data Catalog Governance (tracabilite complete)
- Migration AWS prod (zero downtime)
- ISO 27001 remediation
- Lancement Vague 2 (paiements locaux OK)

## 3. Architecture Multi-Agents IA

8 agents specialises dans `agents/` du repo :

| Agent | Role | Declencheurs |
|-------|------|-------------|
| Orchestrator | Chef projet IA, triage, assignation | Nouvelle issue, PR echec CI |
| Architect | Gardien archi, ADR, review schemas | Issues archi, PR models/deps |
| Frontend Dev | Dev Next.js React UI dashboard | Issues frontend |
| Backend Dev | Dev FastAPI API services IA | Issues backend |
| QA Tester | Qualite, tests, coverage, regressions | Toute PR needs-tests |
| Security | Securite, vulns, RLS, OWASP, secrets | PR auth, audit hebdo |
| DevOps | Infra, CI/CD, deploy, monitoring | Merge main, tag release |
| Doc Writer | Docs, OpenAPI, guides, changelog | PR mergee, needs-docs |

## 4. MCP Servers

| MCP Server | Usage | Priorite |
|------------|-------|----------|
| GitHub MCP | Issues, PRs, code review, actions | CRITIQUE |
| Filesystem MCP | Lecture/ecriture fichiers | CRITIQUE |
| PostgreSQL MCP | Requetes DB, inspection schema | HAUTE |
| Memory MCP | Memoire persistante sessions | HAUTE |
| Fetch MCP | Appels HTTP, tester API | HAUTE |
| Sequential Thinking | Raisonnement multi-etapes | HAUTE |
| Sentry MCP | Monitoring erreurs prod | MOYENNE |

## 5. Securite et Multi-tenancy

- **Chiffrement repos** : AES-256 pgcrypto (Phase 1)
- **Chiffrement transit** : TLS 1.3 (Phase 0)
- **JWT securise** : RS256 + refresh + blacklist Redis (Phase 1)
- **RLS PostgreSQL** : Policies + tests cross-tenant (Phase 1)
- **Rate limiting** : Par tenant/plan/endpoint (Phase 1)
- **Audit trail** : Log actions horodatage IP (Phase 1)
- **MFA** : TOTP obligatoire admin (Phase 2)
- **RBAC** : Owner/Admin/Editor/Viewer (Phase 1)

## 6. Pipeline CI/CD cible

- **Frontend** : ESLint + Prettier > tsc > Jest > next build > Playwright > Lighthouse
- **Backend** : Ruff > MyPy strict > Pytest > Coverage 80% > Bandit SAST > OWASP ZAP
- Deploy staging auto sur merge, deploy prod approbation manuelle

## 7. Plan migration infra

- **T1 2026** : Vercel + Railway (~200 EUR/mois)
- **T3 2026** : AWS Staging - ECS Fargate + RDS + ElastiCache + CloudFront (~500 EUR/mois)
- **T4 2026** : AWS Production - Multi-AZ, WAF, Terraform IaC, Backup RPO < 1h
