---
name: doc-api
description: Documente les endpoints API utilisés dans le projet. Utiliser quand on travaille avec l'API FastAPI backend ou quand on ajoute un nouvel endpoint.
user-invocable: true
argument-hint: [endpoint ou "all" pour tout documenter]
context: fork
agent: Explore
---

# Documentation API - Datatym AI Dashboard

**Cible :** $ARGUMENTS (défaut: all)

## Instructions

### 1. Scanner le codebase
Rechercher tous les appels `fetch()` dans les fichiers `.tsx` et `.ts` :
- Extraire l'URL de chaque appel
- Identifier la méthode HTTP (GET, POST, PUT, DELETE)
- Identifier les headers envoyés
- Identifier le body (pour POST/PUT)
- Identifier comment la réponse est traitée

### 2. Cataloguer les endpoints

Pour chaque endpoint trouvé, documenter :

```
### [METHOD] /api/path
- **Fichier(s)** : où il est appelé dans le frontend
- **Auth requise** : oui/non (présence du header Authorization)
- **Body** : structure JSON envoyée (si POST/PUT)
- **Réponse attendue** : structure JSON reçue (déduite du code)
- **Gestion d'erreurs** : comment les erreurs sont gérées
```

### 3. Regrouper par domaine

Organiser les endpoints par domaine fonctionnel :
- **Auth** : `/api/auth/*`
- **Users** : `/api/users/*`
- **Studies** : `/api/studies/*`
- **Insights** : `/api/insights/*`
- **Dashboard** : `/api/dashboard/*`
- **Reports** : `/api/reports/*`
- **Team** : `/api/team/*`

### 4. Identifier les incohérences
- Endpoints appelés mais potentiellement inexistants
- Différences de structure entre les appels (même endpoint, body différent)
- Endpoints sans gestion d'erreurs
- Endpoints appelés depuis plusieurs fichiers (duplication)

### 5. Format de sortie

```
📡 API Documentation — Datatym AI Dashboard
══════════════════════════════════════════════

Base URL: ${API_URL} (hardcodé ou env var)

🔐 Auth
──────
POST /api/auth/login        → LoginPage         [public]
POST /api/auth/register     → RegisterPage       [public]
POST /api/auth/verify-code  → VerifyCodePage     [public]
...

📊 Studies
──────────
GET  /api/studies           → EtudesPage         [auth]
GET  /api/studies/{id}      → EtudeDetailPage    [auth]
POST /api/studies           → AdminAjouterPage   [admin]
...

══════════════════════════════════════════════
Total: XX endpoints | XX fichiers | XX appels fetch
Couverture auth: XX% des endpoints protégés
Duplication: XX endpoints appelés depuis 2+ fichiers
```
