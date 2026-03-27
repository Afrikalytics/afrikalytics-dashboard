import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Datatym AI — Tests E2E : Dashboard Templates
// =============================================================================
// NOTE : La page /dashboard/templates n'existe pas encore dans le codebase.
// Ces tests documentent le comportement attendu et echoueront tant que la page
// ne sera pas implementee. Ils servent de specification executable.
// =============================================================================

// -----------------------------------------------------------------------------
// Helper : Injecter une session utilisateur mock dans localStorage
// -----------------------------------------------------------------------------

async function authenticateAs(page: Page) {
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
        plan: 'professionnel',
        is_admin: false,
        admin_role: null,
      }),
    ]
  );
}

async function mockApiRoutes(page: Page) {
  await page.route('**/api/dashboard/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_studies: 5,
        active_studies: 2,
        total_insights: 10,
        new_this_month: 3,
      }),
    });
  });

  await page.route('**/api/users/quota', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reports_downloads: { used: 1, limit: 10 },
        insights_access: { used: 3, limit: 20 },
        studies_participation: { used: 1, limit: 5 },
        api_requests: { used: 50, limit: 1000 },
      }),
    });
  });
}

// =============================================================================
// Tests : Page templates (specification — page a implementer)
// =============================================================================

test.describe('Dashboard Templates — affichage', () => {
  test.skip(true, 'Page /dashboard/templates non implementee — spec en attente');

  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockApiRoutes(page);
  });

  test('affiche les templates sectoriels', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');

    // Verifier la presence de quelques secteurs
    await expect(page.getByText('Retail')).toBeVisible();
    await expect(page.getByText('Finance')).toBeVisible();
  });

  test('chaque template a un bouton "Utiliser ce template"', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');

    const useButtons = page.getByRole('button', { name: /utiliser ce template/i });
    await expect(useButtons.first()).toBeVisible();
  });

  test('selectionner un template redirige vers le builder', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /utiliser ce template/i }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/builder\?template=/);
  });
});

test.describe('Dashboard Templates — chargement dans le builder', () => {
  test.skip(true, 'Page /dashboard/templates non implementee — spec en attente');

  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockApiRoutes(page);
  });

  test('le builder charge les widgets du template', async ({ page }) => {
    await page.goto('/dashboard/builder?template=retail');
    await page.waitForLoadState('networkidle');

    // Un template doit pre-remplir des widgets dans la grille
    const grid = page.locator('.grid-cols-12');
    const widgetCount = await grid.locator('> div').count();
    expect(widgetCount).toBeGreaterThan(0);
  });
});
