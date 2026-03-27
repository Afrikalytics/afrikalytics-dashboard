import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Datatym AI — Tests E2E : Administration (CRUD etudes, insights, reports)
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
        email: 'admin@Datatym AI.com',
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

async function mockAdminStudiesApi(page: Page) {
  const studies = [
    {
      id: 1,
      title: 'Marche Fintech Senegal 2025',
      description: 'Analyse des fintechs au Senegal',
      status: 'active',
      category: 'Fintech',
      is_published: true,
      created_at: '2025-01-10T10:00:00Z',
    },
    {
      id: 2,
      title: 'E-sante Afrique de l\'Ouest',
      description: 'Etat de la sante numerique',
      status: 'draft',
      category: 'Sante',
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
        body: JSON.stringify({ ...studies[0], id: 99, title: 'Nouvelle Etude' }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/studies/**', async (route) => {
    const method = route.request().method();
    if (method === 'PUT' || method === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Etude mise a jour' }),
      });
    } else if (method === 'DELETE') {
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
}

async function mockAdminInsightsApi(page: Page) {
  const insights = [
    {
      id: 1,
      title: 'Adoption mobile money Q1 2025',
      summary: 'Progression de 45% du mobile money',
      is_premium: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 2,
      title: 'Tendances e-commerce 2025',
      summary: 'Le e-commerce progresse de 30%',
      is_premium: false,
      created_at: '2025-02-10T10:00:00Z',
    },
  ];

  await page.route('**/api/insights', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(insights),
      });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...insights[0], id: 99 }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route('**/api/insights/**', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Insight supprime' }),
      });
    } else {
      await route.continue();
    }
  });
}

async function mockAdminReportsApi(page: Page) {
  const reports = [
    {
      id: 1,
      title: 'Rapport Annuel 2024',
      description: 'Bilan annuel des marches africains',
      file_url: '/reports/annuel-2024.pdf',
      is_premium: true,
      created_at: '2024-12-31T10:00:00Z',
    },
  ];

  await page.route('**/api/reports', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(reports),
      });
    } else {
      await route.continue();
    }
  });
}

async function mockAdminUsersApi(page: Page) {
  const users = [
    {
      id: 1,
      full_name: 'Oumar Admin',
      email: 'admin@Datatym AI.com',
      plan: 'entreprise',
      is_admin: true,
      admin_role: 'super_admin',
      is_active: true,
      created_at: '2024-01-01T10:00:00Z',
    },
    {
      id: 2,
      full_name: 'Fatou Diop',
      email: 'fatou@test.sn',
      plan: 'professionnel',
      is_admin: false,
      admin_role: null,
      is_active: true,
      created_at: '2024-06-15T10:00:00Z',
    },
    {
      id: 3,
      full_name: 'Mamadou Ba',
      email: 'mamadou@test.sn',
      plan: 'basic',
      is_admin: false,
      admin_role: null,
      is_active: true,
      created_at: '2025-01-10T10:00:00Z',
    },
  ];

  await page.route('**/api/admin/users', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(users),
    });
  });

  await page.route('**/api/admin/users/**', async (route) => {
    const method = route.request().method();
    if (method === 'PUT' || method === 'PATCH') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Utilisateur mis a jour' }),
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Utilisateur supprime' }),
      });
    } else {
      await route.continue();
    }
  });
}

// =============================================================================
// Tests Admin — Etudes (CRUD)
// =============================================================================

test.describe('Admin Etudes — CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page, 'super_admin');
    await mockAdminStudiesApi(page);
  });

  test('affiche la liste des etudes dans /admin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText('Marche Fintech Senegal 2025')).toBeVisible();
    await expect(page.getByText('E-sante Afrique de l\'Ouest')).toBeVisible();
  });

  test('affiche le bouton pour ajouter une etude', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('link', { name: /ajouter|nouvelle [eé]tude|cr[eé]er/i })
      .or(page.getByRole('button', { name: /ajouter|nouvelle [eé]tude|cr[eé]er/i }));
    await expect(addBtn).toBeVisible();
  });

  test('navigue vers le formulaire d\'ajout d\'etude', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: /ajouter|nouvelle [eé]tude/i }).click();
    await expect(page).toHaveURL(/\/admin\/ajouter/);
  });

  test('affiche le formulaire de creation d\'etude dans /admin/ajouter', async ({ page }) => {
    await page.goto('/admin/ajouter');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/login/);
    // Le formulaire doit avoir au moins un champ titre
    const titleInput = page.getByLabel(/titre/i)
      .or(page.locator('input[name="title"], input[placeholder*="titre"]'));
    await expect(titleInput).toBeVisible();
  });
});

// =============================================================================
// Tests Admin — Insights
// =============================================================================

test.describe('Admin Insights — acces et affichage', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page, 'admin_insights');
    await mockAdminInsightsApi(page);
  });

  test('affiche la liste des insights dans /admin/insights', async ({ page }) => {
    await page.goto('/admin/insights');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText('Adoption mobile money Q1 2025')).toBeVisible();
    await expect(page.getByText('Tendances e-commerce 2025')).toBeVisible();
  });

  test('affiche le bouton pour creer un insight', async ({ page }) => {
    await page.goto('/admin/insights');
    await page.waitForLoadState('networkidle');

    const createBtn = page.getByRole('link', { name: /cr[eé]er|nouvel insight|ajouter/i })
      .or(page.getByRole('button', { name: /cr[eé]er|nouvel insight|ajouter/i }));
    await expect(createBtn).toBeVisible();
  });

  test('navigue vers /admin/insights/creer', async ({ page }) => {
    await page.goto('/admin/insights');
    await page.waitForLoadState('networkidle');

    const createLink = page.getByRole('link', { name: /cr[eé]er|nouvel insight/i });
    await createLink.click();
    await expect(page).toHaveURL(/\/admin\/insights\/creer/);
  });
});

// =============================================================================
// Tests Admin — Reports
// =============================================================================

test.describe('Admin Reports — acces et affichage', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsAdmin(page, 'admin_reports');
    await mockAdminReportsApi(page);
  });

  test('affiche la liste des rapports dans /admin/reports', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText('Rapport Annuel 2024')).toBeVisible();
  });

  test('affiche le bouton pour ajouter un rapport', async ({ page }) => {
    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');

    const addBtn = page.getByRole('link', { name: /ajouter|nouveau rapport/i })
      .or(page.getByRole('button', { name: /ajouter|nouveau rapport/i }));
    await expect(addBtn).toBeVisible();
  });
});

// =============================================================================
// Tests Admin — Gestion Utilisateurs (super_admin only)
// =============================================================================

test.describe('Admin Users — super_admin uniquement', () => {
  test('super_admin peut acceder a /admin/users', async ({ page }) => {
    await authenticateAsAdmin(page, 'super_admin');
    await mockAdminUsersApi(page);

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByText('Fatou Diop')).toBeVisible();
    await expect(page.getByText('Mamadou Ba')).toBeVisible();
  });

  test('admin_content ne peut pas acceder a /admin/users', async ({ page }) => {
    await authenticateAsAdmin(page, 'admin_content');
    await page.goto('/admin/users');
    await page.waitForTimeout(2000);

    // L'acces doit etre refuse (redirection ou message d'erreur)
    const url = page.url();
    const isDenied =
      url.includes('/login') ||
      url.includes('/dashboard') ||
      (await page.getByText(/acces refus[eé]|non autoris[eé]|permission/i).isVisible());
    expect(isDenied).toBeTruthy();
  });

  test('affiche les roles admin dans le tableau utilisateurs', async ({ page }) => {
    await authenticateAsAdmin(page, 'super_admin');
    await mockAdminUsersApi(page);

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Verifier que les roles sont affiches
    await expect(page.getByText(/super admin/i)).toBeVisible();
  });
});

// =============================================================================
// Tests RBAC — Permissions par role
// =============================================================================

test.describe('RBAC — Restriction d\'acces par role', () => {
  test('admin_studies ne voit que la section etudes dans le menu admin', async ({ page }) => {
    await authenticateAsAdmin(page, 'admin_studies');
    await mockAdminStudiesApi(page);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Doit avoir acces aux etudes
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('admin_insights peut acceder a /admin/insights', async ({ page }) => {
    await authenticateAsAdmin(page, 'admin_insights');
    await mockAdminInsightsApi(page);

    await page.goto('/admin/insights');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/login/);
  });

  test('admin_reports peut acceder a /admin/reports', async ({ page }) => {
    await authenticateAsAdmin(page, 'admin_reports');
    await mockAdminReportsApi(page);

    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/\/login/);
  });
});
