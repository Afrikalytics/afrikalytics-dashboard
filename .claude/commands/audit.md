---
description: Analyse le code du projet vs les findings de l'audit technique (score 3.2/10). Utiliser pour vérifier la progression des corrections.
argument-hint: [catégorie: security|duplication|architecture|all]
allowed-tools: Read, Grep, Glob, Bash(wc *)
---

# Audit Technique - Afrikalytics Dashboard

## Contexte
Le projet a obtenu un score de 3.2/10 lors de l'audit technique. Cette commande analyse l'état actuel du code par rapport aux findings identifiés.

**Catégorie demandée :** $ARGUMENTS (défaut: all)

## Documents de référence
Consulte OBLIGATOIREMENT ces documents avant toute analyse :
- [Rapport d'audit](docs/references/audit-rapport-afrikalytics.md)
- [Matrice de pilotage](docs/references/matrice-pilotage.md)

## Checklist d'analyse

### 1. Sécurité (critique)
- [ ] `API_URL` hardcodé vs variable d'environnement `NEXT_PUBLIC_API_URL`
- [ ] Tokens JWT dans `localStorage` — présence de `httpOnly` cookies
- [ ] Validation des rôles côté serveur (middleware Next.js)
- [ ] Headers de sécurité (CSP, HSTS, X-Frame-Options)
- [ ] Sanitization des inputs utilisateur

### 2. Duplication de code (~46%)
- [ ] Sidebar copiée-collée dans chaque page vs composant partagé `<Sidebar />`
- [ ] Auth check dupliqué vs hook `useAuth()`
- [ ] API headers répétés vs service centralisé `lib/api.ts`
- [ ] Layout dashboard dupliqué vs `app/dashboard/layout.tsx`

### 3. Architecture
- [ ] Présence de `lib/types.ts` pour les types partagés
- [ ] Présence de `lib/constants.ts` pour les constantes
- [ ] Séparation des concerns (composants, hooks, services)
- [ ] Gestion d'état centralisée (Zustand/Context)

### 4. Qualité
- [ ] Couverture de tests (cible: 70%)
- [ ] Pipeline CI/CD configurée
- [ ] ESLint sans erreurs (`npm run lint`)
- [ ] Build TypeScript sans erreurs (`npm run build`)

## Instructions
1. Analyse le code source pour chaque point de la catégorie demandée
2. Compte les fichiers affectés par chaque problème (utilise `Grep` et `Glob`)
3. Attribue un score par catégorie (0-10)
4. Calcule un score global pondéré
5. Génère un rapport structuré avec :
   - Score actuel vs score initial (3.2/10)
   - Problèmes résolus ✅
   - Problèmes en cours 🔄
   - Problèmes restants ❌
   - Prochaines actions prioritaires
