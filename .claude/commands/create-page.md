---
description: Crée une nouvelle page Next.js en suivant les conventions du projet Datatym AI (App Router, client component, Tailwind, Lucide icons).
argument-hint: <route> [type: dashboard|admin|public]
allowed-tools: Read, Glob, Write, Edit, Bash(npm run build)
---

# Créer une nouvelle page - Datatym AI Dashboard

**Route :** $ARGUMENTS[0]
**Type :** $ARGUMENTS[1] (défaut: dashboard)

## Conventions du projet
- Toutes les pages sont des client components (`"use client"`)
- Styling : Tailwind CSS uniquement, couleur `primary-600` / `primary-700` pour les éléments interactifs
- Icônes : Lucide React exclusivement
- UI en français
- Path alias : `@/*` vers la racine du projet

## Étapes

### 1. Vérifier la structure
- La route n'existe pas déjà (`app/$ARGUMENTS[0]/page.tsx`)
- Le type de page est valide (dashboard, admin, public)

### 2. Créer le fichier page
Créer `app/$ARGUMENTS[0]/page.tsx` en suivant le pattern du type :

**Type `dashboard`** — page authentifiée avec sidebar :
- Si `hooks/useAuth.ts` existe → utiliser le hook `useAuth()`
- Sinon → pattern manuel `localStorage` (compatible avec le code existant)
- Si `components/Sidebar.tsx` existe → utiliser `<Sidebar />`
- Sinon → inclure le sidebar inline (compatible avec le code existant)

**Type `admin`** — page admin avec vérification des permissions :
- Mêmes règles que dashboard + vérification `admin_role` dans les permissions
- Utiliser `ADMIN_PERMISSIONS` pour le contrôle d'accès

**Type `public`** — page sans authentification :
- Pas de sidebar, pas de vérification auth
- Layout simple avec header/footer si présents

### 3. Adapter au contexte
- Lire une page existante du même type pour copier le pattern exact
- Respecter les imports existants et la structure des fichiers
- Ajouter les types nécessaires

### 4. Vérifier
- `npm run build` doit passer sans erreur
- La nouvelle page est accessible dans le navigateur

## Template de base (dashboard)
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// imports Lucide selon besoin

export default function NomDeLaPage() {
  // Auth + state
  // Sidebar (composant ou inline)
  // Contenu principal
}
```
