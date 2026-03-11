---
name: project-context
description: Contexte complet du projet Afrikalytics. Chargé automatiquement quand Claude a besoin de comprendre l'architecture, les décisions techniques, ou la roadmap du projet.
user-invocable: false
disable-model-invocation: false
---

# Afrikalytics Dashboard — Contexte Projet

## Vision
Plateforme BI premium pour l'Afrique francophone. Dashboard privé avec études de marché, insights IA, et rapports sectoriels.

## État actuel (score audit: 3.2/10)

### Problèmes critiques
- **Sécurité** : API_URL hardcodé dans 20+ fichiers, tokens JWT dans localStorage, pas de middleware auth, pas de headers de sécurité
- **Duplication** : ~46% du code est dupliqué (sidebar, auth checks, API headers copiés-collés dans chaque page)
- **Tests** : 0% de couverture, aucun framework de test configuré
- **CI/CD** : aucun pipeline, déploiement manuel sur Vercel

### Architecture actuelle
```
app/
├── login/page.tsx          # Auth
├── register/page.tsx
├── dashboard/
│   ├── page.tsx            # Dashboard principal
│   ├── etudes/             # Études (liste + détail)
│   ├── insights/           # Insights (liste + détail)
│   └── equipe/             # Gestion équipe (entreprise)
├── admin/
│   ├── page.tsx            # Admin dashboard
│   ├── ajouter/            # CRUD études
│   ├── modifier/[id]/
│   ├── insights/           # CRUD insights
│   ├── reports/            # CRUD rapports
│   └── users/              # Gestion users (super_admin)
├── profile/page.tsx
└── layout.tsx              # Root layout (Inter font)
```

### Patterns récurrents à connaître
1. Chaque page lit `token`/`user` depuis `localStorage` dans un `useEffect`
2. Redirect vers `/login` si pas authentifié
3. Sidebar inline avec navigation copiée-collée
4. `fetch()` manuel avec `Authorization: Bearer {token}`
5. Gestion loading/error avec `useState`

## Roadmap (4 phases)
1. **Fondations** : sécurité, auth centralisée, réduction duplication, CI/CD
2. **MVP Core BI** : composants partagés, layouts, types centralisés, tests 70%
3. **IA & Growth** : agents IA, analytics avancés, notifications
4. **Scale** : performance, monitoring, multi-tenant

## RBAC
| Rôle | Accès |
|------|-------|
| super_admin | Tout |
| admin_content | Études, insights, rapports |
| admin_studies | Études uniquement |
| admin_insights | Insights uniquement |
| admin_reports | Rapports uniquement |

## Plans utilisateurs
- `basic` : accès limité
- `professionnel` : accès complet
- `entreprise` : + gestion équipe (5 users max)

## Décisions techniques à respecter
- Tailwind CSS + couleur `primary` (bleu) uniquement
- Lucide React pour les icônes
- UI en français
- Conventional commits en anglais
- Path alias `@/*`
