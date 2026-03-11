---
name: generate-tests
description: Génère des tests unitaires et d'intégration pour le projet Afrikalytics. Utiliser quand on demande d'ajouter des tests ou d'améliorer la couverture.
user-invocable: true
argument-hint: <fichier ou composant à tester>
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npm *), Bash(npx *)
---

# Génération de Tests - Afrikalytics Dashboard

**Cible :** $ARGUMENTS

## Contexte
- Couverture actuelle : **0%** (aucun test configuré)
- Objectif : **70%** de couverture
- Stack cible : Jest + React Testing Library + Playwright (e2e)

## Étape 1 — Vérifier l'infrastructure de test

Vérifier si le framework de test est configuré :
1. `jest.config.js` ou `jest.config.ts` existe ?
2. `@testing-library/react` dans `package.json` ?
3. `playwright.config.ts` existe ?

**Si non configuré**, proposer l'installation :
```bash
npm install -D jest @jest/globals @types/jest ts-jest
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D jest-environment-jsdom
```

Créer les fichiers de config nécessaires :
- `jest.config.ts` — config Jest pour Next.js
- `jest.setup.ts` — setup Testing Library

Ajouter dans `package.json` :
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## Étape 2 — Analyser le code à tester

1. Lire le fichier cible
2. Identifier :
   - Les props/inputs
   - Les états (useState)
   - Les effets (useEffect) et appels API
   - Les interactions utilisateur (click, submit, navigation)
   - Les cas limites et erreurs
3. Déterminer le type de test approprié :
   - **Unitaire** : hooks, fonctions utilitaires, logique pure
   - **Composant** : rendu, interactions, états
   - **Intégration** : flux complets avec mocks API

## Étape 3 — Générer les tests

### Conventions de nommage
- Fichier : `__tests__/[nom-du-fichier].test.tsx` à côté du fichier source
- Describe : nom du composant ou de la fonction
- It/test : description en anglais, format "should [action] when [condition]"

### Structure type
```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ComponentName from "../page";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useParams: () => ({ id: "1" }),
}));

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

describe("ComponentName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === "token") return "mock-token";
      if (key === "user") return JSON.stringify({ id: 1, name: "Test" });
      return null;
    });
  });

  it("should render correctly", () => { /* ... */ });
  it("should redirect to login if no token", () => { /* ... */ });
  it("should fetch data on mount", () => { /* ... */ });
  it("should handle API errors", () => { /* ... */ });
});
```

### Patterns spécifiques au projet
- **Pages avec auth** : tester redirect si pas de token, affichage si authentifié
- **Pages avec sidebar** : tester la navigation, le menu actif
- **Pages avec fetch** : mocker `fetch()`, tester loading/success/error
- **Pages admin** : tester les permissions RBAC
- **Formulaires** : tester validation, soumission, erreurs

## Étape 4 — Vérifier

1. `npm test` — les tests passent
2. `npm run test:coverage` — vérifier la couverture
3. Pas de tests flaky (re-run pour confirmer)

## Règles
- Mocker les appels réseau, jamais d'appels réels
- Mocker `localStorage`, `useRouter`, `useParams`
- Tester le comportement utilisateur, pas l'implémentation
- Un fichier de test par fichier source
- Minimum 3 cas de test par composant (rendu, interaction, erreur)
