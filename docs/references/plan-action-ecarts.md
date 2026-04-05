# Plan d'Action — Ecarts Critiques Afrikalytics

> Genere le 29 mars 2026
> Sources : `afrikalytics_matrice_pilotage.docx`, `afrikalytics_feuille_lancement.docx`, audit code reel
> Objectif : Aligner le code avec les documents de pilotage et lancement

---

## Synthese : nous sommes en retard

Nous sommes en **semaine 4** (fin mars 2026). Selon la matrice de pilotage :
- Phase 0 (sem. 1-2) devrait etre **100% terminee** — elle est a **70%**
- Phase 1 (sem. 3-8) devrait etre a **~30%** — elle est a **35%** (OK mais avec des trous critiques)
- La feuille de lancement prevoit un go-live T1-T2 2026 avec checklist pre-lancement

**Verdict** : Les fondations sont en place mais les **bloquants critiques** (multi-tenancy, JWT RS256, Alembic, tests) empechent tout lancement.

---

## URGENCE 1 : Bloquants techniques (Semaine 5-6)

> Sans ces corrections, aucun lancement possible. Impact : securite, integrite des donnees, maintenabilite.

### 1.1 Installer Alembic et migrer create_all()

**Ecart** : La matrice prevoit Alembic (tache 0.5). Le code utilise `Base.metadata.create_all()` — aucun historique de schema, pas de rollback possible.

**Action** :
- [ ] `pip install alembic` + `alembic init`
- [ ] Generer migration initiale depuis les 21 modeles existants
- [ ] Remplacer `create_all()` dans main.py par `alembic upgrade head` dans le startup
- [ ] Ajouter `alembic upgrade head` au Procfile Railway
- [ ] Documenter dans CLAUDE.md API

**Fichiers concernes** : `main.py`, `alembic/`, `alembic.ini`, `Procfile`
**Risque** : FAIBLE (operation additive, pas de perte de donnees)
**Effort** : 2-4h

### 1.2 Migrer JWT de HS256 vers RS256

**Ecart** : Matrice prevoit RS256 + refresh + blacklist Redis. Code utilise HS256 symetrique avec secret key et 7j d'expiry sans refresh.

**Action** :
- [ ] Generer paire de cles RSA (RS256)
- [ ] Modifier `app/auth.py` : signer avec cle privee, verifier avec cle publique
- [ ] Ajouter refresh token (30j) — config.py a deja `refresh_token_expire_days: int = 30`
- [ ] Activer TokenBlacklist (modele existe deja) via Redis
- [ ] Installer et connecter Redis (config.py a deja `redis_url`)
- [ ] Mettre a jour le dashboard pour gerer le refresh token

**Fichiers concernes** : `app/auth.py`, `app/config.py`, `app/routers/auth.py`, dashboard `lib/api.ts`
**Risque** : MOYEN (casse les tokens existants — prevoir migration)
**Effort** : 6-8h

### 1.3 Implementer RLS PostgreSQL (multi-tenancy)

**Ecart** : Matrice prevoit isolation multi-tenant RLS (tache 1.2). Aucune isolation actuellement — tous les users voient potentiellement toutes les donnees.

**Action** :
- [ ] Definir le modele de tenancy : `tenant_id` sur chaque table sensible (Study, Insight, Report, etc.)
- [ ] Creer migration Alembic pour ajouter `tenant_id`
- [ ] Creer policies RLS PostgreSQL (`CREATE POLICY`)
- [ ] Modifier `database.py` pour injecter `SET app.current_tenant` par session
- [ ] Ecrire tests d'isolation cross-tenant
- [ ] Activer `middleware/tenant.py` (existe deja, a connecter)

**Fichiers concernes** : `app/models.py`, `app/database.py`, `app/middleware/tenant.py`, migrations Alembic
**Risque** : ELEVE (modification structurelle de la DB)
**Effort** : 12-20h
**Pre-requis** : Tache 1.1 (Alembic)

### 1.4 Monter la couverture de tests a 40% (objectif intermediaire)

**Ecart** : Matrice prevoit 70% coverage. Code a ~10% estime. 33 fichiers de tests existent mais couverture insuffisante.

**Action** :
- [ ] Backend : installer pytest-cov, mesurer couverture actuelle
- [ ] Backend : ecrire tests pour auth (login, register, verify-code, forgot/reset password)
- [ ] Backend : ecrire tests pour RBAC (permissions, roles)
- [ ] Dashboard : mesurer couverture Jest actuelle
- [ ] Dashboard : ecrire tests pour useAuth hook et api.ts
- [ ] Configurer CI pour bloquer si coverage < 40%

**Fichiers concernes** : `tests/`, `app/(dashboard)/**/__tests__/`, `.github/workflows/ci.yml`
**Risque** : FAIBLE
**Effort** : 8-12h

---

## URGENCE 2 : Features MVP manquantes (Semaine 6-8)

> Features core du MVP Phase 1 non livrees. Impact : proposition de valeur incomplete.

### 2.1 Completer le Dashboard Builder (drag-and-drop + 15 widgets)

**Ecart** : 7 widgets sur 15+ prevus. Pas de drag-and-drop reel.

**Action** :
- [ ] Installer `react-grid-layout` ou `@dnd-kit/core` pour le drag-and-drop
- [ ] Ajouter 8 widgets : ScatterWidget, RadarWidget, FunnelWidget, GaugeWidget, MapWidget, HeatmapWidget, TreemapWidget, DonutWidget
- [ ] Ajouter sauvegarde/chargement des layouts
- [ ] Tests du builder

**Fichiers concernes** : `components/dashboard-builder/`, `app/(dashboard)/dashboard/builder/page.tsx`
**Effort** : 12-16h

### 2.2 Import datasets complet (CSV + Excel + Google Sheets)

**Ecart** : import_service.py existe mais connecteurs limites. Feuille de lancement exige CSV, Excel, Google Sheets, MySQL, PostgreSQL, API REST.

**Action** :
- [ ] Valider import CSV (existant)
- [ ] Ajouter import Excel (openpyxl)
- [ ] Ajouter import Google Sheets (google-api-python-client)
- [ ] Endpoint upload avec validation taille (100MB max)
- [ ] Progress bar frontend

**Fichiers concernes** : `app/services/import_service.py`, `app/routers/studies.py`, dashboard upload UI
**Effort** : 8-12h

### 2.3 Export rapports (PDF + Excel)

**Ecart** : Feuille de lancement exige PDF, Excel, PowerPoint. Aucun export actuellement.

**Action** :
- [ ] Backend : endpoint `/api/reports/{id}/export?format=pdf|xlsx`
- [ ] PDF : `weasyprint` ou `reportlab`
- [ ] Excel : `openpyxl`
- [ ] Frontend : boutons d'export dans les pages etudes/insights/reports

**Fichiers concernes** : `app/services/export_service.py` (nouveau), `app/routers/reports.py`
**Effort** : 8-12h

### 2.4 Systeme de quotas fonctionnel

**Ecart** : Feuille de lancement prevoit quotas par plan (lignes, dashboards, users, API calls). Endpoint `/api/users/quota` existe mais pas de systeme d'enforcement.

**Action** :
- [ ] Definir limites par plan : basic (500K lignes, 5 dashboards), pro (10M, illimite), enterprise (illimite)
- [ ] Middleware de verification des quotas avant chaque operation
- [ ] Compteurs dans la DB (rows imported, dashboards created, API calls/jour)
- [ ] UI dashboard avec barre de progression des quotas

**Effort** : 6-8h

---

## URGENCE 3 : Securite et conformite (Semaine 7-9)

> La feuille de lancement exige ces controles avant le go-live. Impact : risque juridique et de confiance.

### 3.1 Chiffrement colonnes sensibles (pgcrypto)

**Action** :
- [ ] Activer extension pgcrypto sur PostgreSQL
- [ ] Chiffrer : donnees financieres, KPI confidentiels, tokens SSO
- [ ] Migration Alembic pour les colonnes chiffrees

**Effort** : 4-6h

### 3.2 MFA TOTP pour admins

**Action** :
- [ ] Backend : `pyotp` pour generation TOTP
- [ ] Endpoint `/api/auth/mfa/setup` et `/api/auth/mfa/verify`
- [ ] Dashboard : page setup MFA avec QR code
- [ ] Forcer MFA sur les roles admin

**Effort** : 6-8h

### 3.3 Migrer auth du localStorage vers httpOnly cookies

**Action** :
- [ ] Backend : `Set-Cookie` avec httpOnly, Secure, SameSite=Lax
- [ ] Dashboard : supprimer `localStorage.setItem('token')` dans les ~12 pages
- [ ] Modifier `lib/api.ts` pour utiliser cookies (credentials: 'include')

**Effort** : 4-6h
**Risque** : MOYEN (modification auth globale)

### 3.4 Ajouter Dependabot + Bandit + OWASP ZAP

**Action** :
- [ ] `.github/dependabot.yml` pour npm et pip
- [ ] `bandit -r app/` dans le CI backend
- [ ] OWASP ZAP scan dans le CI (ou periodique)

**Effort** : 2-4h

---

## URGENCE 4 : Monitoring et observabilite (Semaine 8-10)

### 4.1 Ajouter PostHog (analytics produit)

**Action** :
- [ ] `npm install posthog-js` dans le dashboard
- [ ] Provider PostHog dans layout.tsx
- [ ] Events : login, page_view, study_created, export, upgrade

**Effort** : 2-3h

### 4.2 Ajouter Uptime Kuma ou BetterStack

**Action** :
- [ ] Deployer Uptime Kuma (Docker) ou creer compte BetterStack free
- [ ] Monitorer : API /health, dashboard, PostgreSQL
- [ ] Alertes Slack/email

**Effort** : 1-2h

---

## Planning consolide

| Semaine | Taches | Effort total |
|---------|--------|-------------|
| **S5** | 1.1 Alembic, 1.4 Tests (debut) | 10-16h |
| **S6** | 1.2 JWT RS256, 1.3 RLS (debut) | 18-28h |
| **S7** | 1.3 RLS (fin), 2.1 Builder, 2.2 Imports | 20-28h |
| **S8** | 2.3 Exports, 2.4 Quotas, 3.4 Dependabot | 16-24h |
| **S9** | 3.1 pgcrypto, 3.2 MFA, 3.3 Cookies | 14-20h |
| **S10** | 4.1 PostHog, 4.2 Uptime, buffer | 3-5h + buffer |

**Total estime** : 80-120h de dev (4-6 semaines a 20h/semaine)

---

## Checklist pre-lancement (from feuille de lancement)

Les items marques sont necessaires avant le go-live Vague 1 (CI, SN, BJ) :

- [ ] Moteur de requetes performant (< 5s pour 10M lignes) — **ABSENT**
- [ ] Connecteurs natifs valides (Excel, CSV, Google Sheets, MySQL, PostgreSQL, API REST) — **PARTIEL**
- [ ] Builder de dashboards drag-and-drop — **PARTIEL**
- [ ] Isolation multi-tenant complete — **ABSENT**
- [ ] API REST complete et documentee — **FAIT**
- [ ] Systeme de permissions granulaire par workspace — **PARTIEL**
- [ ] Gestion des quotas par plan — **PARTIEL**
- [ ] Tests de charge 10K utilisateurs — **ABSENT**
- [ ] Pentest externe — **ABSENT**
- [ ] Chiffrement AES-256 au repos — **ABSENT**
- [ ] PRA/PCA teste (RPO < 1h, RTO < 4h) — **ABSENT**
- [ ] CGU et politique de confidentialite validees — **ABSENT**
- [ ] Declaration APDP/CDP/ARTCI — **ABSENT**
