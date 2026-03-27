---
name: explore-codebase
description: Explore le codebase Datatym AI en profondeur. Utiliser quand on cherche à comprendre un pattern, trouver des fichiers liés, ou analyser l'architecture.
user-invocable: true
argument-hint: <question ou sujet à explorer>
context: fork
agent: Explore
---

# Exploration du Codebase - Datatym AI Dashboard

**Sujet :** $ARGUMENTS

## Contexte projet
- Stack : Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- ~23 pages client components (`"use client"`)
- ~46% de code dupliqué (sidebar, auth, API headers)
- API externe FastAPI sur Railway
- Couleur custom : `primary` (bleu)

## Instructions

1. **Rechercher** les fichiers pertinents avec `Glob` et `Grep`
2. **Lire** le code source des fichiers trouvés
3. **Analyser** les patterns, la structure, les dépendances
4. **Cartographier** les relations entre les fichiers concernés

## Format de réponse

Fournir :
- **Fichiers trouvés** : liste avec chemins et rôle de chaque fichier
- **Pattern identifié** : comment le code est organisé pour ce sujet
- **Dépendances** : quels fichiers dépendent de quoi
- **Duplication** : si le pattern est dupliqué et où
- **Recommandation** : améliorations possibles (brièvement)

Sois exhaustif dans la recherche mais concis dans le résumé.
