import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Afrikalytics — Tests E2E : Import de donnees
// =============================================================================
// Teste les fonctionnalites d'import de donnees via l'interface admin.
// L'endpoint API est POST /api/studies/import mais l'interface frontend
// d'import n'existe pas encore (la page admin/etudes a uniquement un bouton
// "Nouvelle Etude" pour creation manuelle).
//
// Ces tests verifient :
//  - La structure de la page admin des etudes
//  - La presence des controles de gestion
//  - Le comportement attendu pour un futur bouton d'import (spec en attente)
// =============================================================================

// -----------------------------------------------------------------------------
// Helper : Authentification admin
// -----------------------------------------------------------------------------

async function authenticateAsAdmin(
  page: Page,
  role: string = 'super_admin'
) {
  await page.goto('/login');
  await page.evaluate(
    ([token, userJson]) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userJson);
    },
    [
      'mock-admin-jwt-token',
      JSON.stringify({
        id: 1,
        full_name: 'Oumar Admin',
        email: 'admin@afrikalytics.com',
        plan: 'entreprise',
        is_admin: true,
        admin_role: role,
      }),
    ]
  );
}

// -----------------------------------------------------------------------------
// Helper : Mocker les API admin
// -----------------------------------------------------------------------------

async function mockAdminApiRoutes(page: Page) {
  const studies = [
    {
      id: 1,
      title: 'Marche Fintech Senegal 2025',
      description: 'Analyse des fintechs au Senegal',
      status: 'Ouvert',
      category: 'Fintech',
      is_active: true,
      is_published: true,
      created_at: '2025-01-10T10:00:00Z',
    },
    {
      id: 2,
      title: 'E-sante Afrique de l\'Ouest',
      description: 'Etat de la sante numerique',
      status: 'Fermé',
      category: 'Sante',
      is_active: false,
      is_published: false,
      created_at: '2025-02-20T10:00:00Z',
    },
  ];

  await page.route('**/api/studies', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(studies),
      });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...studies[0], id: 99, title: 'Etude Importee' }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/studies/import', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Import reussi',
          imported_count: 5,
          errors: [],
        }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/studies/**', async (route) => {
    const method = route.request().method();
    if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Etude supprimee' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(studies[0]),
      });
    }
  });

  // Dashboard stats (sidebar)
  await page.route('**/api/dashboard/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_studies: 2,
        active_studies: 1,
        total_insights: 5,
        new_this_month: 1,
      }),
    });
  });

  await page.route('**/api/users/quota', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reports_downloads: { used: 0, limit: 10 },
        insights_access: { used: 0, limit: 20 },
        studies_participation: { used: 0, limit: 5 },
        api_requests: { used: 10, limit: 1000 },
      }),
    });
  });
}

// =============================================================================
// Tests : Page admin etudes — structure existante
// =============================================================================

test.describe('Admin Etudes — structure de la page', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page, 'super_admin');
    await mockAdminApiRoutes(page);
  });

  test('la page admin affiche le titre "Gestion des Études"', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /gestion des [eé]tudes/i })).toBeVisible();
  });

  test('affiche le bouton "Nouvelle Étude"', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Nouvelle Étude')).toBeVisible();
  });

  test('affiche le champ de recherche', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('input[placeholder*="Rechercher"]')
    ).toBeVisible();
  });

  test('affiche le filtre par statut', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('select')).toBeVisible();
    await expect(page.getByText('Tous les statuts')).toBeVisible();
  });

  test('affiche la liste des etudes', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Marche Fintech Senegal 2025')).toBeVisible();
    await expect(page.getByText('E-sante Afrique de l\'Ouest')).toBeVisible();
  });

  test('affiche le compteur d\'etudes', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/2 étude/)).toBeVisible();
  });

  test('le bouton Nouvelle Etude navigue vers /admin/ajouter', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.getByText('Nouvelle Étude').click();
    await expect(page).toHaveURL(/\/admin\/ajouter/);
  });
});

// =============================================================================
// Tests : Recherche et filtrage dans la page admin
// =============================================================================

test.describe('Admin Etudes — recherche et filtrage', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page, 'super_admin');
    await mockAdminApiRoutes(page);
  });

  test('filtre les etudes par recherche textuelle', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await searchInput.fill('Fintech');

    // Seule l'etude Fintech doit rester visible
    await expect(page.getByText('Marche Fintech Senegal 2025')).toBeVisible();
    await expect(page.getByText('E-sante Afrique de l\'Ouest')).not.toBeVisible();
  });

  test('filtre les etudes par statut', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.locator('select').selectOption('Fermé');

    // Seule l'etude fermee doit rester visible
    await expect(page.getByText('E-sante Afrique de l\'Ouest')).toBeVisible();
    await expect(page.getByText('Marche Fintech Senegal 2025')).not.toBeVisible();
  });
});

// =============================================================================
// Tests : Import de donnees (specification — fonctionnalite a implementer)
// =============================================================================

test.describe('Import de donnees — specification future', () => {
  test.skip(true, 'Fonctionnalite d\'import non implementee dans le frontend — spec en attente');

  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page, 'super_admin');
    await mockAdminApiRoutes(page);
  });

  test('la page admin a un bouton d\'import', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /import/i })).toBeVisible();
  });

  test('le bouton d\'import ouvre un dialog d\'upload', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /import/i }).click();

    // Un dialog / modal d'upload doit apparaitre
    await expect(page.getByText(/importer.*fichier|t[eé]l[eé]charger/i)).toBeVisible();
  });

  test('accepte un fichier CSV pour import', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /import/i }).click();

    // Trouver l'input file
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Verifier qu'il accepte les CSV
    const accept = await fileInput.getAttribute('accept');
    expect(accept).toContain('.csv');
  });

  test('affiche un message de succes apres import', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /import/i }).click();

    // Simuler un upload de fichier CSV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'etudes.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('title,description,category\nTest,Description,Tech'),
    });

    // Cliquer sur le bouton de validation de l'import
    await page.getByRole('button', { name: /valider|importer/i }).click();

    // Message de succes
    await expect(page.getByText(/import.*r[eé]ussi/i)).toBeVisible();
  });
});

// =============================================================================
// Tests : Acces non-admin — restriction
// =============================================================================

test.describe('Import — restriction d\'acces', () => {
  test('un utilisateur non-admin est redirige depuis /admin', async ({ page }) => {
    // Utilisateur standard sans role admin
    await page.goto('/login');
    await page.evaluate(
      ([token, userJson]) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', userJson);
      },
      [
        'mock-jwt-token-e2e-test',
        JSON.stringify({
          id: 42,
          full_name: 'Aminata Diallo',
          email: 'aminata@test.sn',
          plan: 'basic',
          is_admin: false,
          admin_role: null,
        }),
      ]
    );

    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // L'acces doit etre refuse
    const url = page.url();
    const hasAccessDenied =
      url.includes('/login') ||
      url.includes('/dashboard') ||
      (await page.getByText(/acc[eè]s refus[eé]/i).isVisible());
    expect(hasAccessDenied).toBeTruthy();
  });
});
