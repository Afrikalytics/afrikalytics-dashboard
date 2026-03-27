---
name: review-code
description: Revue de code complète avec checklist sécurité, qualité et conventions projet. Utiliser avant de merger ou commiter des changements importants.
user-invocable: true
disable-model-invocation: true
argument-hint: [fichier ou dossier à reviewer, ou "staged" pour les changements git]
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob, Bash(git diff*), Bash(git log*), Bash(npm run lint), Bash(npm run build)
---

# Code Review - Datatym AI Dashboard

**Cible :** $ARGUMENTS (défaut: changements staged dans git)

## Documents de référence
- [Rapport d'audit](docs/references/audit-rapport-Datatym AI.md)
- [Matrice de pilotage](docs/references/matrice-pilotage.md)

## Étape 1 — Identifier les changements
- Si `$ARGUMENTS` = "staged" ou vide → `git diff --cached` + `git diff`
- Sinon → lire le fichier ou dossier spécifié
- Lister tous les fichiers modifiés/ajoutés

## Étape 2 — Checklist de revue

### Sécurité 🔒
- [ ] Pas de secrets/credentials hardcodés
- [ ] Pas de `dangerouslySetInnerHTML` sans sanitization
- [ ] Inputs utilisateur validés avant envoi API
- [ ] Auth vérifié sur les routes protégées
- [ ] Pas de failles XSS, injection, CSRF

### Qualité du code 📐
- [ ] TypeScript strict — pas de `any` injustifié
- [ ] Pas de `console.log` oubliés
- [ ] Gestion d'erreurs (try/catch, états loading/error)
- [ ] Pas de code mort ou commenté
- [ ] Nommage clair et cohérent

### Conventions projet 📋
- [ ] `"use client"` si composant client
- [ ] Tailwind CSS uniquement (pas de CSS inline ou modules)
- [ ] Couleur `primary-600`/`primary-700` pour les éléments interactifs
- [ ] Icônes Lucide React exclusivement
- [ ] UI en français
- [ ] Imports via `@/*`

### Performance ⚡
- [ ] Pas de re-renders inutiles (dépendances useEffect correctes)
- [ ] Pas de fetches dans les boucles
- [ ] Images optimisées (next/image)
- [ ] Pas de bundles inutilement lourds

### Architecture 🏗️
- [ ] Utilise les composants partagés s'ils existent (Sidebar, useAuth, api.ts)
- [ ] Pas de nouvelle duplication de code
- [ ] Types bien définis (interfaces, pas de `any`)
- [ ] Séparation des concerns respectée

## Étape 3 — Rapport

Pour chaque problème trouvé :
```
[SÉVÉRITÉ] fichier:ligne — Description
  → Suggestion de correction
```

Sévérités : 🔴 Bloquant | 🟠 Important | 🟡 Mineur | 💡 Suggestion

### Résumé final
```
📊 Revue de code — Résumé
─────────────────────────
🔴 Bloquants  : X
🟠 Importants : X
🟡 Mineurs    : X
💡 Suggestions: X
─────────────────────────
Verdict: ✅ Approuvé | ⚠️ Approuvé avec réserves | 🔴 Changements requis
```
