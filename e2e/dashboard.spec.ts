import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Afrikalytics — Tests E2E : Dashboard et navigation principale
// =============================================================================
// Les tests qui necessitent une session authentifiee utilisent le helper
// `authenticateAs()` qui injecte un token mock via localStorage et simule
// les reponses API. Cela rend les tests independants d'une API live.
// =============================================================================

// -----------------------------------------------------------------------------
// Helper : Injecter une session utilisateur mock dans localStorage
// -----------------------------------------------------------------------------

interface MockUser {
  id?: number;
  full_name?: string;
  email?: string;
  plan?: 'basic' | 'professionnel' | 'entreprise';
  is_admin?: boolean;
  admin_role?: string | null;
}

async function authenticateAs(page: Page, user: MockUser = {}) {
  const defaultUser = {
    id: 42,
    full_name: 'Aminata Diallo',
    email: 'aminata@test.sn',
    plan: 'professionnel' as const,
    is_admin: false,
    admin_role: null,
    ...user,
  };

  // Aller sur une page quelconque pour avoir acces au localStorage du bon domaine
  await page.goto('/login');
  await page.evaluate(
    ([token, userJson]) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userJson);
    },
    ['mock-jwt-token-e2e-test', JSON.stringify(defaultUser)]
  );
}

// -----------------------------------------------------------------------------
// Helper : Mocker toutes les requetes API du dashboard
// -----------------------------------------------------------------------------

async function mockDashboardApiRoutes(page: Page) {
  // Stats dashboard
  await page.route('**/api/dashboard/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_studies: 12,
        active_studies: 3,
        total_insights: 25,
        new_this_month: 5,
      }),
    });
  });

  // Etudes actives
  await page.route('**/api/studies/active', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          title: 'Etude Marche Digital Senegal 2025',
          description: 'Analyse du marche digital au Senegal',
          status: 'active',
          category: 'Digital',
          created_at: '2025-01-15T10:00:00Z',
        },
        {
          id: 2,
          title: 'Rapport Consommation Mobile Afrique',
          description: 'Tendances mobile en Afrique de l\'Ouest',
          status: 'active',
          category: 'Mobile',
          created_at: '2025-02-01T10:00:00Z',
        },
      ]),
    });
  });

  // Quota utilisateur
  await page.route('**/api/users/quota', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reports_downloads: { used: 2, limit: 10 },
        insights_access: { used: 5, limit: 20 },
        studies_participation: { used: 1, limit: 5 },
        api_requests: { used: 100, limit: 1000 },
      }),
    });
  });

  // Liste complete des etudes
  await page.route('**/api/studies', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          title: 'Etude Marche Digital Senegal 2025',
          description: 'Analyse du marche digital au Senegal',
          status: 'active',
          category: 'Digital',
          created_at: '2025-01-15T10:00:00Z',
        },
        {
          id: 2,
          title: 'Rapport Consommation Mobile Afrique',
          description: 'Tendances mobile en Afrique de l\'Ouest',
          status: 'active',
          category: 'Mobile',
          created_at: '2025-02-01T10:00:00Z',
        },
        {
          id: 3,
          title: 'E-commerce Cote d\'Ivoire 2025',
          description: 'Etude sur la croissance du e-commerce',
          status: 'completed',
          category: 'E-commerce',
          created_at: '2025-03-01T10:00:00Z',
        },
      ]),
    });
  });

  // Insights
  await page.route('**/api/insights', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          title: 'Croissance mobile money 2025',
          summary: 'Le mobile money progresse de 45% en Afrique de l\'Ouest',
          is_premium: false,
          created_at: '2025-01-20T10:00:00Z',
        },
      ]),
    });
  });

  // Reports
  await page.route('**/api/reports', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

// =============================================================================
// Tests du dashboard principal
// =============================================================================

test.describe('Dashboard principal — structure et affichage', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockDashboardApiRoutes(page);
  });

  test('affiche la page dashboard apres authentification', async ({ page }) => {
    await page.goto('/dashboard');
    // Le dashboard doit se charger sans redirection vers /login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('affiche la sidebar de navigation', async ({ page }) => {
    await page.goto('/dashboard');
    // Attendre la fin du chargement (le skeleton disparait)
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('affiche le nom de l\'utilisateur connecte dans la sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Aminata Diallo')).toBeVisible();
  });

  test('affiche les cartes de statistiques', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Les stats API sont mockees — verifier qu'elles s'affichent
    await expect(page.getByText('12')).toBeVisible(); // total_studies
  });

  test('affiche les etudes recentes', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Etude Marche Digital Senegal 2025')).toBeVisible();
  });

  test('affiche le badge du plan utilisateur', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // L'utilisateur mock a le plan 'professionnel'
    await expect(page.getByText(/professionnel/i)).toBeVisible();
  });
});

test.describe('Dashboard — liens de navigation', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockDashboardApiRoutes(page);
  });

  test('le lien Etudes dans la sidebar navigue vers /dashboard/etudes', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Trouver le lien Etudes dans la sidebar (nav)
    const etudesLink = page.locator('nav').getByRole('link', { name: /[eé]tudes/i });
    await expect(etudesLink).toBeVisible();
    await etudesLink.click();
    await expect(page).toHaveURL(/\/dashboard\/etudes/);
  });

  test('le lien Dashboard dans la sidebar navigue vers /dashboard', async ({ page }) => {
    await page.goto('/dashboard/etudes');
    await page.waitForLoadState('networkidle');

    const dashboardLink = page.locator('nav').getByRole('link', { name: /^dashboard$/i });
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});

// =============================================================================
// Tests de la page Etudes
// =============================================================================

test.describe('Page Etudes — liste et filtres', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockDashboardApiRoutes(page);
  });

  test('affiche la liste des etudes', async ({ page }) => {
    await page.goto('/dashboard/etudes');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Etude Marche Digital Senegal 2025')).toBeVisible();
    await expect(page.getByText('Rapport Consommation Mobile Afrique')).toBeVisible();
  });

  test('affiche le champ de recherche', async ({ page }) => {
    await page.goto('/dashboard/etudes');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByRole('searchbox').or(
      page.locator('input[placeholder*="echercher"], input[placeholder*="Recherche"]')
    );
    await expect(searchInput).toBeVisible();
  });

  test('filtre les etudes par recherche textuelle', async ({ page }) => {
    await page.goto('/dashboard/etudes');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"], input[placeholder*="echercher"]').first();
    await searchInput.fill('Digital');

    // Apres filtrage, seule l'etude Digital doit etre visible
    await expect(page.getByText('Etude Marche Digital Senegal 2025')).toBeVisible();
    await expect(page.getByText('Rapport Consommation Mobile Afrique')).not.toBeVisible();
  });
});

// =============================================================================
// Tests de la deconnexion
// =============================================================================

test.describe('Deconnexion', () => {
  test('le bouton de deconnexion supprime la session et redirige vers /login', async ({ page }) => {
    await authenticateAs(page);
    await mockDashboardApiRoutes(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Trouver le bouton de deconnexion dans la sidebar
    const logoutBtn = page.getByRole('button', { name: /d[eé]connexion|se d[eé]connecter/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Doit rediriger vers /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Verifier que le localStorage est vide
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});

// =============================================================================
// Tests de la section Admin
// =============================================================================

test.describe('Section Admin — acces et restriction', () => {
  test('un utilisateur non-admin ne peut pas acceder a /admin', async ({ page }) => {
    // Utilisateur standard sans role admin
    await authenticateAs(page, { is_admin: false });
    await page.goto('/admin');

    // Doit etre redirige (vers /login ou afficher un message d'acces refuse)
    await page.waitForTimeout(2000);
    const url = page.url();
    const isBlocked = url.includes('/login') || url.includes('/dashboard');
    expect(isBlocked).toBeTruthy();
  });

  test('un super_admin peut acceder a /admin', async ({ page }) => {
    await authenticateAs(page, {
      is_admin: true,
      admin_role: 'super_admin',
      plan: 'entreprise',
    });

    // Mocker les API de la page admin
    await page.route('**/api/studies', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // La page admin ne doit pas rediriger vers /login
    await expect(page).not.toHaveURL(/\/login/);
  });
});

// =============================================================================
// Tests responsive — Dashboard
// =============================================================================

test.describe('Responsive — Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockDashboardApiRoutes(page);
  });

  test('la sidebar est accessible sur desktop (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('le contenu principal s\'adapte sur mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Le main content doit etre visible meme sur mobile
    await expect(page.locator('main, [role="main"], .min-h-screen')).toBeVisible();
  });

  test('le contenu est lisible sur tablette (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Les stats cards doivent etre visibles
    await expect(page.getByText('12')).toBeVisible();
  });
});
