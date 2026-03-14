import { test, expect } from '@playwright/test';

// =============================================================================
// Afrikalytics — Tests E2E : Flux d'authentification
// =============================================================================
// Ces tests couvrent les parcours critiques de la page /login, /register,
// /forgot-password et la protection des routes authentifiees.
//
// Conventions :
//  - Les selectors privilegient les attributs d'accessibilite (role, label, id)
//  - Les tests ne dependent pas d'une API live (pas de vraies credentials)
//  - Les erreurs reseau sont traitees gracefully
// =============================================================================

test.describe('Page de connexion — structure et accessibilite', () => {
  test.beforeEach(async ({ page }) => {
    // Nettoyer le localStorage avant chaque test pour eviter les faux positifs
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto('/login');
  });

  test('affiche le titre de la page et le logo', async ({ page }) => {
    await expect(page).toHaveTitle(/Afrikalytics/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Afrikalytics AI');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Connexion');
  });

  test('affiche les champs email et mot de passe avec leurs labels', async ({ page }) => {
    // Labels associes via htmlFor — verifie l'accessibilite du formulaire
    await expect(page.getByLabel('Adresse email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
  });

  test('affiche le bouton de soumission desactive si les champs sont vides', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /se connecter/i });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeDisabled();
  });

  test('active le bouton de soumission quand les deux champs sont remplis', async ({ page }) => {
    await page.getByLabel('Adresse email').fill('test@example.com');
    await page.getByLabel('Mot de passe').fill('monmotdepasse');
    const submitBtn = page.getByRole('button', { name: /se connecter/i });
    await expect(submitBtn).toBeEnabled();
  });

  test('affiche le lien vers la page d\'inscription', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /cr[eé]er un compte/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });

  test('affiche le lien mot de passe oublie', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /mot de passe oubli[eé]/i });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  test('peut basculer la visibilite du mot de passe', async ({ page }) => {
    const passwordInput = page.getByLabel('Mot de passe');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Cliquer sur le bouton toggle
    const toggleBtn = page.getByRole('button', { name: /afficher le mot de passe/i });
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Re-masquer
    const hideBtn = page.getByRole('button', { name: /masquer le mot de passe/i });
    await hideBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('affiche un message d\'erreur accessible apres soumission invalide', async ({ page }) => {
    await page.getByLabel('Adresse email').fill('invalide@test.com');
    await page.getByLabel('Mot de passe').fill('mauvaismdp');

    // Intercepter la requete API pour simuler une erreur sans API live
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Identifiants incorrects' }),
      });
    });

    await page.getByRole('button', { name: /se connecter/i }).click();

    // Le message d'erreur doit etre visible et accessible via role="alert"
    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/identifiants incorrects/i);
  });

  test('affiche l\'etat de chargement pendant la soumission', async ({ page }) => {
    await page.getByLabel('Adresse email').fill('user@test.com');
    await page.getByLabel('Mot de passe').fill('password123');

    // Simuler une reponse lente
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Erreur' }),
      });
    });

    await page.getByRole('button', { name: /se connecter/i }).click();

    // Pendant le chargement, le texte du bouton change
    await expect(page.getByText(/connexion en cours/i)).toBeVisible();
  });
});

test.describe('Navigation depuis la page de connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto('/login');
  });

  test('navigue vers la page d\'inscription via le lien', async ({ page }) => {
    await page.getByRole('link', { name: /cr[eé]er un compte/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('navigue vers la page mot de passe oublie', async ({ page }) => {
    await page.getByRole('link', { name: /mot de passe oubli[eé]/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe('Connexion reussie — redirection', () => {
  test('redirige vers /dashboard apres connexion valide (sans 2FA)', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto('/login');

    // Mocker une reponse API valide
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
          requires_verification: false,
          user: {
            id: 1,
            full_name: 'Test User',
            email: 'test@afrikalytics.com',
            plan: 'basic',
            is_admin: false,
            admin_role: null,
          },
        }),
      });
    });

    await page.getByLabel('Adresse email').fill('test@afrikalytics.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('redirige vers /verify-code quand la 2FA est requise', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto('/login');

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          requires_verification: true,
          message: 'Code envoye par email',
        }),
      });
    });

    await page.getByLabel('Adresse email').fill('test2fa@afrikalytics.com');
    await page.getByLabel('Mot de passe').fill('password123');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/verify-code/, { timeout: 10000 });
  });
});

test.describe('Page d\'inscription — structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto('/register');
  });

  test('affiche le formulaire d\'inscription complet', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /cr[eé]er un compte/i })).toBeVisible();
    await expect(page.getByLabel('Nom complet')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
  });

  test('affiche les avantages du plan Basic', async ({ page }) => {
    await expect(page.getByText(/plan basic inclut/i)).toBeVisible();
    await expect(page.getByText(/participer aux [eé]tudes/i)).toBeVisible();
  });

  test('affiche un message d\'erreur si les mots de passe ne correspondent pas', async ({ page }) => {
    await page.getByLabel('Nom complet').fill('Jean Test');
    await page.getByLabel('Email').fill('jean@test.com');
    await page.getByLabel('Mot de passe').fill('password123');
    // Remplir "Confirmer" — selectionner par placeholder car le label peut varier
    await page.locator('input[placeholder="••••••••"]').last().fill('autrepassword');

    await page.getByRole('button', { name: /cr[eé]er mon compte|s'inscrire/i }).click();

    await expect(page.getByRole('alert')).toContainText(/mots de passe ne correspondent pas/i);
  });

  test('affiche une erreur si le mot de passe est trop court', async ({ page }) => {
    await page.getByLabel('Nom complet').fill('Jean Test');
    await page.getByLabel('Email').fill('jean@test.com');
    await page.getByLabel('Mot de passe').fill('court');
    await page.locator('input[placeholder="••••••••"]').last().fill('court');

    await page.getByRole('button', { name: /cr[eé]er mon compte|s'inscrire/i }).click();

    await expect(page.getByRole('alert')).toContainText(/8 caract[eè]res/i);
  });
});

test.describe('Protection des routes — redirection vers /login', () => {
  test.beforeEach(async ({ page }) => {
    // S'assurer qu'aucun token n'est present
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
  });

  test('redirige /dashboard vers /login si non connecte', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('redirige /dashboard/etudes vers /login si non connecte', async ({ page }) => {
    await page.goto('/dashboard/etudes');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('redirige /profile vers /login si non connecte', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('redirige /admin vers /login si non connecte', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe('Accessibilite de la page de connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('les champs du formulaire ont des labels associes', async ({ page }) => {
    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-password');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('le message d\'erreur utilise role="alert" pour l\'accessibilite', async ({ page }) => {
    await page.getByLabel('Adresse email').fill('x@x.com');
    await page.getByLabel('Mot de passe').fill('badpass');

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Erreur test' }),
      });
    });

    await page.getByRole('button', { name: /se connecter/i }).click();
    // Verifier que l'element d'erreur a bien role="alert" (accessibility)
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
  });

  test('navigation au clavier possible sur le formulaire', async ({ page }) => {
    // Le focus doit pouvoir passer sur les elements interactifs via Tab
    const emailInput = page.getByLabel('Adresse email');
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab');
    // Apres email -> le focus devrait aller sur le champ suivant ou un lien
    // On verifie juste que l'email n'a plus le focus (Tab fonctionne)
    await expect(emailInput).not.toBeFocused();
  });
});

test.describe('Responsive — page de connexion', () => {
  test('s\'affiche correctement sur mobile (viewport 375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByLabel('Adresse email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });

  test('s\'affiche correctement sur tablette (viewport 768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');

    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.getByLabel('Adresse email')).toBeVisible();
  });
});
