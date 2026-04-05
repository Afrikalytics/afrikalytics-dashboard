# Feuille de Lancement — Statut d'Alignement

> Source : `afrikalytics_feuille_lancement.docx` (Fevrier 2026 - CONFIDENTIEL)
> Derniere mise a jour : **29 mars 2026**
> Objectif : 2 000 a 10 000 clients fin 2026 | Triple marche : Entreprises + Consultants + Particuliers

---

## 1. Vision et positionnement

| Element | Document | Code reel | Aligne ? |
|---------|----------|-----------|----------|
| Plateforme PaaS BI | Oui | Application BI basique (SaaS) | ECART — pas encore PaaS (pas de SDK, pas d'embedded, pas de marketplace active) |
| Triple marche (Entreprise/Consultant/Particulier) | Oui | Plans basic/pro/entreprise uniquement | ECART — pas de plans Consultant (Solo/Pro/Agency) ni Particulier (Gratuit/Learner) |
| Zones UEMOA + CEMAC | Oui | Paiement PayDunya (UEMOA) | PARTIEL — CEMAC non couvert |
| Vague 1 : CI, SN, BJ (T1-T2 2026) | Oui | Deploye globalement via Vercel/Railway | OK (couverture globale) |

---

## 2. Checklist Pre-Lancement

### 2.1 Plateforme et Moteur BI

| Item | Priorite | Statut | Detail |
|------|----------|--------|--------|
| Moteur de requetes < 5s / 10M lignes | CRITIQUE | ABSENT | Pas de moteur analytique dedie |
| Connecteurs CSV, Excel, Google Sheets, MySQL, PostgreSQL, API REST | CRITIQUE | PARTIEL | CSV/Excel via import_service, pas de Google Sheets/MySQL/API REST |
| Connecteurs africains (Orange Money, MTN, Wave, Odoo, Sage, BCEAO) | HAUTE | ABSENT | PayDunya seulement |
| Builder dashboards drag-and-drop | CRITIQUE | PARTIEL | 7 widgets, pas de drag-and-drop reel |
| NLP Francais requetes | HAUTE | ABSENT | Phase 2 |
| Alertes intelligentes | HAUTE | ABSENT | Modele Notification existe mais pas d'alertes auto |
| Export PDF, Excel, PowerPoint, image | HAUTE | ABSENT | Aucun export |
| Scheduling rapports (email, Slack, WhatsApp) | HAUTE | ABSENT | — |
| Templates sectoriels (banque, retail, telecom, agri, sante) | HAUTE | PARTIEL | Modele MarketplaceTemplate, pas de contenu |
| Mode embedded (iframes + SDK JS) | HAUTE | ABSENT | Phase 3 |

### 2.2 PaaS et Multi-tenancy

| Item | Priorite | Statut | Detail |
|------|----------|--------|--------|
| Isolation multi-tenant (donnees, compute, cache) | CRITIQUE | ABSENT | Aucune RLS ni isolation |
| White-labeling (logo, couleurs, domaine custom) | HAUTE | ABSENT | Pas de systeme theme dynamique |
| API REST complete et documentee | CRITIQUE | FAIT | 15 routers, Swagger auto |
| SDK Python et JavaScript | HAUTE | ABSENT | — |
| Marketplace templates et connecteurs (10+) | MOYENNE | PARTIEL | Modele DB ok, pas de contenu |
| Permissions granulaires (viewer/editor/admin/owner) par workspace | CRITIQUE | PARTIEL | 5 roles admin, pas de modele workspace |
| Quotas et limites par plan | CRITIQUE | PARTIEL | Endpoint existe, pas d'enforcement |
| SSO SAML 2.0, OAuth 2.0, LDAP/AD | HAUTE | PARTIEL | Config OAuth Google/Microsoft, pas fonctionnel |

### 2.3 Infrastructure et Performance

| Item | Priorite | Statut | Detail |
|------|----------|--------|--------|
| Tests charge 10K utilisateurs | CRITIQUE | ABSENT | — |
| Pentest externe certifie | CRITIQUE | ABSENT | — |
| CDN < 200ms depuis CI/SN/CM | HAUTE | FAIT | Vercel Edge Network |
| Auto-scaling | HAUTE | PARTIEL | Railway auto-scale basique |
| PRA/PCA (RPO < 1h, RTO < 4h) | CRITIQUE | ABSENT | Pas de plan de reprise |
| Chiffrement AES-256 repos + TLS 1.3 transit | CRITIQUE | PARTIEL | TLS ok (Vercel/Railway), pas de AES-256 colonnes |
| Monitoring (uptime, query perf, usage par tenant) | CRITIQUE | PARTIEL | Sentry seulement |
| Cache multi-niveaux | HAUTE | ABSENT | Redis configure mais pas utilise |
| Performance mobile < 3s sur 3G | HAUTE | NON TESTE | — |

### 2.4 Conformite legale

| Item | Priorite | Statut | Detail |
|------|----------|--------|--------|
| CGU et politique confidentialite (CI, SN, BJ) | CRITIQUE | ABSENT | Pas de pages legales |
| Declaration APDP (Benin), CDP (Senegal), ARTCI (CI) | CRITIQUE | ABSENT | — |
| DPA pour clients entreprises | HAUTE | ABSENT | — |
| Politique retention et purge | HAUTE | ABSENT | SoftDeleteMixin present mais pas de purge auto |
| Conformite BCEAO/BEAC | HAUTE | ABSENT | — |
| Audit fiscal TVA SaaS par juridiction | HAUTE | ABSENT | — |

---

## 3. Securite et Conformite

| Controle | Prevu | Statut |
|----------|-------|--------|
| Isolation donnees par tenant (schema/DB) | RLS defaut, schema Enterprise | ABSENT |
| Chiffrement AES-256 + TLS 1.3 + colonnes sensibles | Oui | PARTIEL (TLS ok) |
| SSO (SAML, OAuth) + MFA admin + LDAP | Oui | PARTIEL (config OAuth, pas MFA) |
| RBAC 4 niveaux + RLS par ligne | Oui | PARTIEL (5 roles admin, pas RLS) |
| Audit trail complet | Oui | FAIT (modele AuditLog) |
| Scan antivirus fichiers uploades | Oui | ABSENT |
| Catalogue donnees + data lineage | Oui | ABSENT |
| Data lineage source-to-viz | Oui | ABSENT |
| Politique retention + purge auto | Oui | ABSENT |
| Droit portabilite (export CSV/JSON/SQL) | Oui | ABSENT |
| Transparence IA (explications, confiance) | Oui | N/A (pas d'IA encore) |
| Opt-out IA | Oui | N/A |

### Certifications

| Certification | Timeline prevue | Statut |
|---------------|----------------|--------|
| Conformite RGPD/APDP/CDP | T1 2026 | ABSENT |
| Conformite BCEAO | T2 2026 | ABSENT |
| ISO 27001 | T3 2026 | ABSENT |
| SOC 2 Type II | T4 2026 | ABSENT |

---

## 4. Pricing — Ecart de modele

### Prevu dans la feuille (8 plans)

| Segment | Plan | Prix |
|---------|------|------|
| Entreprise | Explorer | 13 000-35 000 FCFA/mois |
| Entreprise | Business | 65 000-300 000 FCFA/mois |
| Entreprise | Enterprise | Sur devis |
| Consultant | Solo | 20 000-50 000 FCFA/mois |
| Consultant | Pro | 80 000-200 000 FCFA/mois |
| Consultant | Agency | Sur devis |
| Particulier | Gratuit | 0 FCFA |
| Particulier | Learner | 5 000-10 000 FCFA/mois |

### Implemente dans le code (3 plans)

| Plan | Description |
|------|-------------|
| basic | Acces limite |
| professionnel | Acces complet |
| entreprise | + gestion equipe (5 membres max) |

**ECART** : Le modele de pricing a 3 segments (entreprise/consultant/particulier) avec 8 plans n'est pas reflete dans le code. Le champ `plan` du modele User ne supporte que 3 valeurs.

---

## 5. Go-to-Market — Elements techniques requis

| Element GTM | Dependance technique | Statut |
|-------------|---------------------|--------|
| Early Adopters 100 entreprises | Plateforme fonctionnelle, onboarding | PARTIEL |
| Programme Consultant Partner (50 consultants) | White-label, workspace multi-client | ABSENT |
| Webinaires "Du tableur au dashboard" | Dashboard builder fonctionnel | PARTIEL |
| Hackathon data (datasets publics) | Import datasets, templates | PARTIEL |
| Afrika Data Summit (Abidjan) | Demo live stable | RISQUE |
| Rapport "Etat de la Data en Afrique" | Analytics et exports | ABSENT |
| Certification consultants | Parcours formation, examen | ABSENT |
| Communaute Afrika Data (Slack/Discord) | External, pas de dep technique | POSSIBLE |

---

## 6. Objectifs commerciaux T1 2026 vs capacite technique

| KPI | Cible T1 | Capacite actuelle | Verdict |
|-----|----------|-------------------|---------|
| Clients entreprises | 80-200 | Possible (auth + dashboard basique OK) | RISQUE (pas de multi-tenant) |
| Consultants actifs | 30-50 | IMPOSSIBLE (pas de white-label) | BLOQUE |
| Particuliers inscrits | 500-2000 | Possible (plan free non implemente) | RISQUE |
| MRR total | 10-30K EUR | IMPOSSIBLE (pricing 3 plans vs 8) | BLOQUE |
| Dashboards crees/mois | 500 | Possible avec le builder basique | OK |
| NPS B2B > 30 | — | Non mesurable (pas de PostHog/NPS) | ABSENT |

---

## 7. Score d'alignement global

| Domaine | Score |
|---------|-------|
| Plateforme et Moteur BI | 20% |
| PaaS et Multi-tenancy | 15% |
| Infrastructure et Performance | 35% |
| Securite et Conformite | 20% |
| Conformite legale | 0% |
| Pricing | 30% |
| Go-to-Market technique | 25% |
| **GLOBAL** | **~20%** |

> La feuille de lancement est un document ambitieux visant 2 000-10 000 clients fin 2026. Le code actuel est a environ 20% d'alignement avec ses exigences. Les ecarts les plus critiques sont la multi-tenancy, les connecteurs de donnees, le moteur analytique et la conformite legale.
