import { test, expect, type Page } from '@playwright/test';

// =============================================================================
// Datatym AI — Tests E2E : Dashboard Builder
// =============================================================================
// Teste la creation de tableaux de bord personnalises via le builder :
//  - Palette de widgets (7 types)
//  - Ajout / suppression de widgets
//  - Bascule mode edition / apercu
//  - Sauvegarde du layout
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

// -----------------------------------------------------------------------------
// Helper : Mocker les API appelees par le builder et le dashboard layout
// -----------------------------------------------------------------------------

async function mockBuilderApiRoutes(page: Page) {
  // Stats dashboard (sidebar may call this)
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

  // Quota (sidebar may call this)
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
// Tests : Palette de widgets
// =============================================================================

test.describe('Dashboard Builder — Palette de widgets', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockBuilderApiRoutes(page);
  });

  test('affiche la palette de widgets en mode edition', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Le titre de la palette doit etre visible
    await expect(page.getByText('Ajouter un widget')).toBeVisible();
  });

  test('affiche les 7 types de widgets dans la palette', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Les 7 types de widgets : Barres, Lignes, Aires, Camembert, Statistique, KPI, Tableau
    await expect(page.getByText('Barres')).toBeVisible();
    await expect(page.getByText('Lignes')).toBeVisible();
    await expect(page.getByText('Aires')).toBeVisible();
    await expect(page.getByText('Camembert')).toBeVisible();
    await expect(page.getByText('Statistique')).toBeVisible();
    await expect(page.getByText('KPI')).toBeVisible();
    await expect(page.getByText('Tableau')).toBeVisible();
  });

  test('affiche les descriptions des types de widgets', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Comparaison de valeurs')).toBeVisible();
    await expect(page.getByText('Tendances temporelles')).toBeVisible();
    await expect(page.getByText('Données tabulaires')).toBeVisible();
  });

  test('affiche le titre Dashboard Builder', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Dashboard Builder' })).toBeVisible();
    await expect(page.getByText('Créez votre tableau de bord personnalisé')).toBeVisible();
  });
});

// =============================================================================
// Tests : Ajout de widgets
// =============================================================================

test.describe('Dashboard Builder — Ajout de widgets', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockBuilderApiRoutes(page);
  });

  test('affiche un message quand il n\'y a aucun widget', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Le message vide est affiche dans la grille
    await expect(page.getByText('Aucun widget')).toBeVisible();
  });

  test('ajoute un widget Barres au dashboard', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Cliquer sur le bouton Barres dans la palette
    await page.locator('button', { hasText: 'Barres' }).click();

    // Le widget doit apparaitre dans la grille (grid-cols-12)
    const grid = page.locator('.grid-cols-12');
    await expect(grid.locator('> div')).toHaveCount(1);

    // Le message "Aucun widget" ne doit plus etre visible
    await expect(page.getByText('Aucun widget')).not.toBeVisible();
  });

  test('ajoute un widget Lignes au dashboard', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await page.locator('button', { hasText: 'Lignes' }).click();

    const grid = page.locator('.grid-cols-12');
    await expect(grid.locator('> div')).toHaveCount(1);
  });

  test('ajoute plusieurs widgets de types differents', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await page.locator('button', { hasText: 'Barres' }).click();
    await page.locator('button', { hasText: 'Lignes' }).click();
    await page.locator('button', { hasText: 'Camembert' }).click();

    const grid = page.locator('.grid-cols-12');
    await expect(grid.locator('> div')).toHaveCount(3);
  });

  test('le compteur de widgets se met a jour', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Verifier le compteur initial (0 widgets)
    await expect(page.getByText('0 widget')).toBeVisible();

    // Ajouter un widget
    await page.locator('button', { hasText: 'Barres' }).click();
    await expect(page.getByText('1 widget sur le tableau')).toBeVisible();

    // Ajouter un deuxieme
    await page.locator('button', { hasText: 'Lignes' }).click();
    await expect(page.getByText('2 widgets sur le tableau')).toBeVisible();
  });
});

// =============================================================================
// Tests : Mode edition / apercu
// =============================================================================

test.describe('Dashboard Builder — Mode edition et apercu', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockBuilderApiRoutes(page);
  });

  test('bascule entre mode edition et apercu', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Ajouter un widget d'abord pour avoir du contenu
    await page.locator('button', { hasText: 'Barres' }).click();

    // Verifier qu'on est en mode edition (palette visible)
    await expect(page.getByText('Ajouter un widget')).toBeVisible();

    // Cliquer sur Apercu
    await page.locator('button', { hasText: 'Aperçu' }).click();

    // La palette ne doit plus etre visible
    await expect(page.getByText('Ajouter un widget')).not.toBeVisible();

    // Le bouton doit maintenant afficher "Editer"
    await expect(page.locator('button', { hasText: 'Éditer' })).toBeVisible();
  });

  test('le bouton Editer ramene en mode edition', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Passer en mode apercu
    await page.locator('button', { hasText: 'Aperçu' }).click();
    await expect(page.getByText('Ajouter un widget')).not.toBeVisible();

    // Revenir en mode edition
    await page.locator('button', { hasText: 'Éditer' }).click();
    await expect(page.getByText('Ajouter un widget')).toBeVisible();
  });

  test('le bouton Supprimer dernier n\'est pas visible sans widgets', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Pas de widgets -> pas de bouton supprimer
    await expect(page.locator('button', { hasText: 'Supprimer dernier' })).not.toBeVisible();
  });

  test('le bouton Supprimer dernier apparait quand il y a des widgets', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await page.locator('button', { hasText: 'Barres' }).click();

    // Le bouton Supprimer dernier doit apparaitre
    await expect(page.locator('button', { hasText: 'Supprimer dernier' })).toBeVisible();
  });
});

// =============================================================================
// Tests : Suppression de widgets
// =============================================================================

test.describe('Dashboard Builder — Suppression de widgets', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockBuilderApiRoutes(page);
  });

  test('supprime le dernier widget ajoute', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Ajouter 2 widgets
    await page.locator('button', { hasText: 'Barres' }).click();
    await page.locator('button', { hasText: 'Lignes' }).click();

    const grid = page.locator('.grid-cols-12');
    await expect(grid.locator('> div')).toHaveCount(2);

    // Supprimer le dernier
    await page.locator('button', { hasText: 'Supprimer dernier' }).click();
    await expect(grid.locator('> div')).toHaveCount(1);
  });

  test('supprimer tous les widgets affiche le message vide', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Ajouter puis supprimer
    await page.locator('button', { hasText: 'Barres' }).click();
    await expect(page.locator('.grid-cols-12').locator('> div')).toHaveCount(1);

    await page.locator('button', { hasText: 'Supprimer dernier' }).click();

    // Le message vide doit reapparaitre
    await expect(page.getByText('Aucun widget')).toBeVisible();
  });

  test('le bouton Supprimer dernier disparait en mode apercu', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await page.locator('button', { hasText: 'Barres' }).click();
    await expect(page.locator('button', { hasText: 'Supprimer dernier' })).toBeVisible();

    // Passer en apercu
    await page.locator('button', { hasText: 'Aperçu' }).click();

    // Le bouton Supprimer ne doit plus etre visible
    await expect(page.locator('button', { hasText: 'Supprimer dernier' })).not.toBeVisible();
  });
});

// =============================================================================
// Tests : Sauvegarde
// =============================================================================

test.describe('Dashboard Builder — Sauvegarde', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockBuilderApiRoutes(page);
  });

  test('le bouton Sauvegarder est toujours visible', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('button', { hasText: 'Sauvegarder' })).toBeVisible();
  });

  test('cliquer sur Sauvegarder affiche une confirmation', async ({ page }) => {
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Ajouter un widget
    await page.locator('button', { hasText: 'Barres' }).click();

    // Intercepter le dialog alert()
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Layout sauvegardé');
      await dialog.accept();
    });

    await page.locator('button', { hasText: 'Sauvegarder' }).click();
  });
});

// =============================================================================
// Tests responsive — Dashboard Builder
// =============================================================================

test.describe('Responsive — Dashboard Builder', () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page);
    await mockBuilderApiRoutes(page);
  });

  test('le builder s\'affiche sur desktop (1280px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Ajouter un widget')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dashboard Builder' })).toBeVisible();
  });

  test('le builder s\'affiche sur mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/builder');
    await page.waitForLoadState('networkidle');

    // Le heading doit rester visible
    await expect(page.getByRole('heading', { name: 'Dashboard Builder' })).toBeVisible();
  });
});
