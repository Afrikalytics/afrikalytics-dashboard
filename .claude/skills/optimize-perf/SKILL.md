---
name: optimize-perf
description: Analyse et optimise les performances du projet Next.js (bundle size, rendu, images, fetching). À utiliser quand l'app est lente ou avant un déploiement majeur.
user-invocable: true
disable-model-invocation: true
argument-hint: [cible: bundle|rendering|images|api|all]
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob, Bash(npm *), Bash(npx *), Bash(du *)
---

# Optimisation Performance - Datatym AI Dashboard

**Cible :** $ARGUMENTS (défaut: all)

## Analyse par catégorie

### 1. Bundle Size (`bundle`)
Analyser la taille du bundle :
- Exécuter `npm run build` et lire le rapport de taille
- Identifier les pages/chunks les plus lourds
- Chercher les imports lourds non tree-shakés :
  ```
  Grep: import de bibliothèques entières vs imports nommés
  Exemple: import _ from "lodash" vs import { debounce } from "lodash"
  ```
- Vérifier les dépendances dans `package.json` — y a-t-il des libs inutilisées ?
- Recommander le lazy loading (`next/dynamic`) pour les composants lourds

### 2. Rendu et hydratation (`rendering`)
- **Toutes les pages sont `"use client"`** — identifier celles qui pourraient être SSR/SSG
- Pages statiques candidates (login, register, pages publiques)
- Rechercher les re-renders inutiles :
  - `useEffect` avec dépendances manquantes ou trop larges
  - States qui pourraient être dérivés (computed) plutôt que stockés
  - Objets/arrays créés inline dans le JSX (nouvelle référence à chaque render)
- Vérifier l'utilisation de `React.memo`, `useMemo`, `useCallback` où pertinent

### 3. Images et assets (`images`)
- Rechercher les `<img>` qui devraient utiliser `next/image`
- Vérifier les images sans `width`/`height` (layout shift)
- Identifier les images lourdes sans optimisation
- Vérifier le lazy loading des images below-the-fold
- Favicon et assets statiques dans `/public`

### 4. Fetching et API (`api`)
- Identifier les waterfalls de requêtes (fetches séquentiels qui pourraient être parallèles)
- Vérifier l'absence de cache/revalidation (SWR, React Query, ou cache natif)
- Chercher les fetches dupliqués (même endpoint appelé par plusieurs composants)
- Analyser les `useEffect` qui refetch inutilement
- Vérifier la gestion des états loading (squelettes vs spinners)

## Format de rapport

```
⚡ Performance Report — Datatym AI Dashboard
════════════════════════════════════════════════

📦 Bundle Size
   Total: XXX kB (First Load JS)
   Plus grosse page: /xxx (XX kB)
   → Recommandations: [...]

🖥️ Rendering
   Pages "use client" convertibles en SSR: X/23
   Re-renders suspects: X fichiers
   → Recommandations: [...]

🖼️ Images
   <img> à convertir en next/image: X
   Images sans dimensions: X
   → Recommandations: [...]

🌐 API Fetching
   Waterfalls détectées: X
   Fetches dupliqués: X
   → Recommandations: [...]

════════════════════════════════════════════════
Score performance estimé: X/10
Top 3 quick wins:
1. [...]
2. [...]
3. [...]
```
