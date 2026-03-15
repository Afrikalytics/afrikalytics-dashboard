import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EtudesListPage from '../page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: jest.fn() }),
}));

const mockUseAuth = jest.fn();
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

jest.mock('@/components/Sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar" />,
}));

jest.mock('lucide-react', () => ({
  BarChart3:    (props: Record<string, unknown>) => <span data-testid="icon-barchart3" {...props} />,
  Clock:        (props: Record<string, unknown>) => <span data-testid="icon-clock" {...props} />,
  Calendar:     (props: Record<string, unknown>) => <span data-testid="icon-calendar" {...props} />,
  ChevronRight: (props: Record<string, unknown>) => <span data-testid="icon-chevronright" {...props} />,
  Filter:       (props: Record<string, unknown>) => <span data-testid="icon-filter" {...props} />,
  Search:       (props: Record<string, unknown>) => <span data-testid="icon-search" {...props} />,
  Lightbulb:    (props: Record<string, unknown>) => <span data-testid="icon-lightbulb" {...props} />,
  Download:     (props: Record<string, unknown>) => <span data-testid="icon-download" {...props} />,
  Lock:         (props: Record<string, unknown>) => <span data-testid="icon-lock" {...props} />,
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const authUser = {
  id: 1,
  email: 'user@example.com',
  full_name: 'Jean Dupont',
  plan: 'basic' as const,
  is_active: true,
  is_admin: false,
  admin_role: null,
  parent_user_id: null,
  is_verified: true,
  created_at: '2024-01-01T00:00:00Z',
};

const sampleStudies = [
  {
    id: 1,
    title: 'Étude Commerce Dakar',
    description: "Analyse du commerce à Dakar",
    category: 'Commerce',
    status: 'Ouvert',
    is_active: true,
    duration: '25 min',
    deadline: '2024-12-31',
  },
  {
    id: 2,
    title: 'Étude Agriculture Sénégal',
    description: "Secteur agricole au Sénégal",
    category: 'Agriculture',
    status: 'Fermé',
    is_active: true,
    duration: '15 min',
    deadline: null,
  },
  {
    id: 3,
    title: 'Étude Fintech Abidjan',
    description: "Services financiers à Abidjan",
    category: 'Finance',
    status: 'Bientôt',
    is_active: true,
    duration: '20 min',
    deadline: '2025-01-15',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupAuth(token = 'fake-token') {
  mockUseAuth.mockReturnValue({
    user: authUser,
    token,
    isLoading: false,
    isAdmin: false,
    accessDenied: false,
    logout: jest.fn(),
    hasPermission: jest.fn(() => false),
  });
}

/**
 * Configures fetch to return the 3 parallel API calls:
 * studies, insights, reports (in that order).
 */
function mockParallelFetch(
  studies = sampleStudies,
  insights: unknown[] = [],
  reports: unknown[] = [],
) {
  // Promise.all fires 3 parallel fetch calls
  mockFetch
    .mockResolvedValueOnce({ ok: true, json: async () => studies })  // /api/studies
    .mockResolvedValueOnce({ ok: true, json: async () => insights }) // /api/insights
    .mockResolvedValueOnce({ ok: true, json: async () => reports });  // /api/reports
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('EtudesListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the page title after loading', async () => {
    setupAuth();
    mockParallelFetch();

    render(<EtudesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Toutes les Études')).toBeInTheDocument();
    });
  });

  it('should display all studies returned by the API', async () => {
    setupAuth();
    mockParallelFetch();

    render(<EtudesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Étude Commerce Dakar')).toBeInTheDocument();
      expect(screen.getByText('Étude Agriculture Sénégal')).toBeInTheDocument();
      expect(screen.getByText('Étude Fintech Abidjan')).toBeInTheDocument();
    });
  });

  it('should filter studies by title when search term is entered', async () => {
    const user = userEvent.setup();
    setupAuth();
    mockParallelFetch();

    render(<EtudesListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher une étude...')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('Rechercher une étude...'), 'Dakar');

    await waitFor(() => {
      expect(screen.getByText('Étude Commerce Dakar')).toBeInTheDocument();
      expect(screen.queryByText('Étude Agriculture Sénégal')).not.toBeInTheDocument();
      expect(screen.queryByText('Étude Fintech Abidjan')).not.toBeInTheDocument();
    });
  });

  it('should filter studies by status using the status select', async () => {
    const user = userEvent.setup();
    setupAuth();
    mockParallelFetch();

    render(<EtudesListPage />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole('combobox'), 'Fermé');

    await waitFor(() => {
      expect(screen.getByText('Étude Agriculture Sénégal')).toBeInTheDocument();
      expect(screen.queryByText('Étude Commerce Dakar')).not.toBeInTheDocument();
    });
  });

  it('should render a link to the study detail page for each study', async () => {
    setupAuth();
    mockParallelFetch();

    render(<EtudesListPage />);

    await waitFor(() => {
      // Each study card has an anchor href="/dashboard/etudes/{id}"
      const link = screen.getByRole('link', { name: /voir les résultats en temps réel/i });
      expect(link).toHaveAttribute('href', '/dashboard/etudes/1');
    });
  });

  it('should show empty state message when no studies match the search', async () => {
    const user = userEvent.setup();
    setupAuth();
    mockParallelFetch();

    render(<EtudesListPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher une étude...')).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText('Rechercher une étude...'),
      'xxxx_inexistant',
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune étude trouvée.')).toBeInTheDocument();
    });
  });

  it('should show empty state when the API returns an empty studies list', async () => {
    setupAuth();
    mockParallelFetch([], [], []);

    render(<EtudesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucune étude trouvée.')).toBeInTheDocument();
    });
  });

  it('should show "Insight bientôt disponible" when no insight exists for a study', async () => {
    setupAuth();
    mockParallelFetch(sampleStudies, [], []);

    render(<EtudesListPage />);

    await waitFor(() => {
      const lockedInsights = screen.getAllByText('Insight bientôt disponible');
      expect(lockedInsights.length).toBe(sampleStudies.length);
    });
  });

  it('should render insight link when a published insight is associated with a study', async () => {
    setupAuth();
    const insight = { id: 10, study_id: 1, title: 'Insight Dakar', is_published: true };
    mockParallelFetch(sampleStudies, [insight], []);

    render(<EtudesListPage />);

    await waitFor(() => {
      const insightLink = screen.getByRole('link', { name: /lire l.insight/i });
      expect(insightLink).toHaveAttribute('href', '/dashboard/insights/10');
    });
  });

  it('should gracefully handle API fetch failure (no crash, empty list shown)', async () => {
    setupAuth();
    // All 3 parallel calls fail
    mockFetch
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    render(<EtudesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucune étude trouvée.')).toBeInTheDocument();
    });
  });
});
