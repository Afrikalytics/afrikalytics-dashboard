---
description: Corrige un problème en consultant d'abord les documents de référence (audit, matrice pilotage) pour vérifier si c'est un issue connu.
argument-hint: <description du problème ou numéro d'issue GitHub>
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(npm *), Bash(git diff*), Bash(gh issue view*)
---

# Fix Issue - Afrikalytics Dashboard

**Problème :** $ARGUMENTS

## Méthodologie

### Étape 1 — Consulter les références
Avant toute modification, vérifier si le problème est documenté :
1. Lire [audit-rapport-afrikalytics.md](docs/references/audit-rapport-afrikalytics.md) — chercher si c'est un finding connu
2. Lire [matrice-pilotage.md](docs/references/matrice-pilotage.md) — vérifier si c'est planifié dans la roadmap
3. Si un numéro d'issue GitHub est fourni, récupérer les détails avec `gh issue view`

### Étape 2 — Diagnostiquer
1. Identifier les fichiers concernés avec `Grep` et `Glob`
2. Lire le code pertinent pour comprendre le contexte
3. Identifier la cause racine (pas juste le symptôme)
4. Vérifier si le problème affecte d'autres fichiers (pattern dupliqué = bug dupliqué)

### Étape 3 — Planifier la correction
Avant de coder, présenter :
- **Cause racine** identifiée
- **Fichiers à modifier** (liste)
- **Approche** de correction
- **Impact** sur les autres parties du code
- **Risque de régression** (faible/moyen/élevé)

### Étape 4 — Corriger
- Appliquer le fix minimal nécessaire (pas de refactoring opportuniste)
- Si le bug est dupliqué dans plusieurs fichiers, corriger TOUS les fichiers
- Respecter les conventions du projet (Tailwind, Lucide, français pour l'UI)

### Étape 5 — Vérifier
1. `npm run build` — doit passer
2. `npm run lint` — pas de nouvelles erreurs
3. Vérification manuelle : le fix résout bien le problème décrit
4. Pas de régression visible dans les fichiers modifiés

### Étape 6 — Résumer
Fournir un résumé :
- Ce qui a été corrigé
- Fichiers modifiés
- Si ça adresse un finding de l'audit → le mentionner
- Recommandations éventuelles (tests à ajouter, refactoring à planifier)

## Règles
- Ne jamais introduire de vulnérabilité de sécurité (OWASP Top 10)
- Préférer la correction ciblée au refactoring large
- Si le fix nécessite un changement architectural, le signaler et demander confirmation
