---
description: Identifie et exécute un refactoring pour réduire la duplication de code (~46%). Cible le sidebar, auth, API, layouts.
argument-hint: [cible: sidebar|auth|api|layout|types|plan]
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(npm run lint), Bash(npm run build)
---

# Refactoring - Afrikalytics Dashboard

**Cible :** $ARGUMENTS (défaut: plan — affiche le plan sans modifier)

## Documents de référence
- [Rapport d'audit](docs/references/audit-rapport-afrikalytics.md)
- [Matrice de pilotage](docs/references/matrice-pilotage.md)

## Cibles de refactoring

### `plan` — Analyse et plan d'action
Analyse la duplication actuelle et produit un plan détaillé sans modifier aucun fichier :
1. Comptabilise les occurrences de chaque pattern dupliqué
2. Estime l'effort de refactoring par cible
3. Propose un ordre de priorité (impact/effort)

### `sidebar` — Extraction du composant Sidebar
1. Identifier toutes les pages avec un sidebar inline (grep pour le pattern de navigation)
2. Créer `components/Sidebar.tsx` avec les props nécessaires (user, activePage, permissions)
3. Remplacer chaque sidebar inline par `<Sidebar />`
4. Vérifier : `npm run build` doit passer

### `auth` — Hook useAuth et middleware
1. Créer `hooks/useAuth.ts` :
   - Lecture `token` et `user` depuis `localStorage`
   - Redirect vers `/login` si absent
   - Expose `{ user, token, logout, isLoading }`
2. Créer `middleware.ts` pour protéger les routes `/dashboard/*` et `/admin/*`
3. Remplacer les blocs auth dupliqués dans chaque page
4. Vérifier : `npm run build` doit passer

### `api` — Service API centralisé
1. Créer `lib/api.ts` :
   - Instance fetch avec `API_URL` depuis `NEXT_PUBLIC_API_URL`
   - Headers `Authorization: Bearer {token}` automatiques
   - Gestion d'erreurs centralisée (401 → redirect login)
   - Méthodes typées : `api.get<T>()`, `api.post<T>()`, `api.put<T>()`, `api.delete<T>()`
2. Remplacer tous les `fetch()` manuels par le service
3. Vérifier : `npm run build` doit passer

### `layout` — Layout dashboard partagé
1. Créer `app/dashboard/layout.tsx` avec Sidebar + conteneur principal
2. Créer `app/admin/layout.tsx` avec Sidebar admin
3. Supprimer le layout inline de chaque page enfant
4. Vérifier : `npm run build` doit passer

### `types` — Types TypeScript centralisés
1. Créer `lib/types.ts` avec les interfaces : `User`, `Study`, `Insight`, `Report`, `DashboardStats`
2. Créer `lib/constants.ts` avec `ADMIN_PERMISSIONS`, plans, routes
3. Remplacer les types inline dans chaque page
4. Vérifier : `npm run build` doit passer

## Règles
- **Toujours** faire `npm run build` après modification pour vérifier la non-régression
- **Une cible à la fois** — ne pas mélanger les refactorings
- **Préserver le comportement** — aucun changement fonctionnel, uniquement structurel
- **Commits atomiques** — un commit par cible de refactoring
