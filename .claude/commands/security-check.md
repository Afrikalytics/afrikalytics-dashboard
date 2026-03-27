---
description: Vérifie les vulnérabilités de sécurité du projet (OWASP Top 10, auth, secrets, headers). Utiliser avant chaque déploiement ou après des modifications sensibles.
argument-hint: [scope: full|auth|secrets|headers|deps]
allowed-tools: Read, Grep, Glob, Bash(npm audit*), Bash(npx *)
---

# Security Check - Datatym AI Dashboard

**Scope demandé :** $ARGUMENTS (défaut: full)

## Documents de référence
- [Rapport d'audit - section sécurité](docs/references/audit-rapport-Datatym AI.md)

## Vérifications

### 1. Secrets et données sensibles
Recherche dans tout le codebase :
- URLs d'API hardcodées (`https://web-production-ef657.up.railway.app` ou autres URLs)
- Tokens/clés API en clair dans le code source
- Mots de passe ou credentials en dur
- Fichiers `.env` commités (vérifier `.gitignore`)

```
Grep: pattern="(API_URL|api_url|apiUrl|https?://.*railway\.app|sk-|api[_-]?key|password|secret|token)" dans tous les fichiers .ts/.tsx
```

### 2. Authentification et autorisation
- Vérifier que `localStorage.getItem("token")` est utilisé de manière sécurisée
- Vérifier la présence d'un middleware d'auth (`middleware.ts`)
- Vérifier la validation des rôles admin (RBAC) côté client ET serveur
- Vérifier l'expiration des tokens JWT
- Vérifier la protection CSRF

### 3. Injection et XSS
- Rechercher `dangerouslySetInnerHTML` — chaque usage doit être justifié et sanitisé
- Vérifier que les inputs utilisateur sont validés avant envoi API
- Vérifier l'échappement des données affichées dynamiquement

### 4. Headers de sécurité
- Vérifier `next.config.js` ou `next.config.mjs` pour les security headers :
  - `Content-Security-Policy`
  - `Strict-Transport-Security`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`

### 5. Dépendances
- Exécuter `npm audit` pour les vulnérabilités connues
- Vérifier les packages obsolètes ou non maintenus

## Format de sortie
Pour chaque vulnérabilité trouvée, rapporter :
- **Sévérité** : 🔴 Critique | 🟠 Haute | 🟡 Moyenne | 🔵 Basse
- **Fichier(s)** : chemin et ligne
- **Description** : nature du problème
- **Remédiation** : action corrective recommandée

Résumé final avec nombre de vulnérabilités par sévérité.
