---
description: Vérification pré-déploiement complète (build, lint, types, sécurité, git). À exécuter avant chaque push vers production.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm *), Bash(npx *), Bash(git status), Bash(git log*), Bash(git diff*)
---

# Deploy Check - Afrikalytics Dashboard

Vérification complète avant déploiement sur Vercel.

## Checklist automatisée

### 1. État Git
- Vérifier qu'il n'y a pas de changements non commités (`git status`)
- Vérifier qu'on est sur la bonne branche
- Vérifier que la branche est à jour avec le remote

### 2. Build TypeScript
Exécuter `npm run build` :
- Doit passer sans erreur TypeScript
- Doit passer sans erreur de build Next.js
- Reporter les warnings éventuels

### 3. Linting
Exécuter `npm run lint` :
- Doit passer sans erreur
- Reporter les warnings éventuels

### 4. Vérifications de sécurité rapides
- Aucun secret/credential hardcodé dans le code source
- `API_URL` utilise `NEXT_PUBLIC_API_URL` (ou signaler si encore hardcodé)
- Pas de `console.log` oubliés dans le code (hors dev)
- Pas de `// TODO` ou `// FIXME` critiques

### 5. Dépendances
- `npm audit` — signaler les vulnérabilités high/critical
- Vérifier que `package-lock.json` est à jour

### 6. Fichiers sensibles
- `.env` et `.env.local` sont dans `.gitignore`
- Aucun fichier sensible n'est tracké par git

## Format de sortie

```
╔══════════════════════════════════════╗
║       DEPLOY CHECK - Résultats       ║
╠══════════════════════════════════════╣
║ ✅ Git : propre, branche main        ║
║ ✅ Build : succès (0 erreurs)        ║
║ ⚠️  Lint : 3 warnings               ║
║ 🔴 Sécurité : 1 issue critique      ║
║ ✅ Deps : 0 vulnérabilités          ║
║ ✅ Fichiers : OK                     ║
╠══════════════════════════════════════╣
║ VERDICT : ⚠️  DEPLOYER AVEC PRUDENCE ║
╚══════════════════════════════════════╝
```

Verdicts possibles :
- ✅ **PRÊT À DÉPLOYER** — tout est OK
- ⚠️ **DÉPLOYER AVEC PRUDENCE** — warnings non bloquants
- 🔴 **NE PAS DÉPLOYER** — erreurs bloquantes à corriger
