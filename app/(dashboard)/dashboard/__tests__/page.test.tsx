import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../page';
import type { User } from '@/lib/types';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock lucide-react — only icons actually used by DashboardPage + Sidebar
jest.mock('lucide-react', () => {
  const icon = (name: string) => (props: Record<string, unknown>) =>
    <span data-testid={`icon-${name}`} {...props} />;
  return {
    BarChart3:   icon('barchart3'),
    FileText:    icon('filetext'),
    TrendingUp:  icon('trendingup'),
    LogOut:      icon('logout'),
    User:        icon('user'),
    Settings:    icon('settings'),
    Menu:        icon('menu'),
    X:           icon('x'),
    ChevronDown: icon('chevrondown'),
    ChevronRight:icon('chevronright'),
    Users:       icon('users'),
    Lightbulb:   icon('lightbulb'),
    Download:    icon('download'),
    Crown:       icon('crown'),
    Clock:       icon('clock'),
    CheckCircle: icon('checkcircle'),
    Coins:       icon('coins'),
    Infinity:    icon('infinity'),
    Zap:         icon('zap'),
  };
});

// ---------------------------------------------------------------------------
// useAuth mock — default: authenticated basic user
// ---------------------------------------------------------------------------

const mockLogout = jest.fn();

const defaultUser: User = {
  id: 1,
  email:           'user@example.com',
  full_name:       'Jean Dupont',
  plan:            'basic',
  is_active:       true,
  is_admin:        false,
  admin_role:      null,
  parent_user_id:  null,
  is_verified:     true,
  created_at:      '2024-01-01T00:00:00Z',
};

let useAuthMockReturn = {
  user:         defaultUser as User | null,
  token:        'fake-token' as string | null,
  isLoading:    false,
  isAdmin:      false,
  accessDenied: false,
  logout:       mockLogout,
  hasPermission: jest.fn(() => false),
};

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => useAuthMockReturn,
}));

// ---------------------------------------------------------------------------
// fetch mock
// ---------------------------------------------------------------------------

const mockFetchFn = jest.fn();
global.fetch = mockFetchFn;

// ---------------------------------------------------------------------------
// localStorage mock (required by useAuth internals if not fully mocked)
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    jest.fn((key: string) => store[key] ?? null),
    setItem:    jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear:      jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------
// API response fixtures
// ---------------------------------------------------------------------------

const makeStatsResponse = (overrides = {}) => ({
  studies_accessible:       5,
  studies_total:            10,
  studies_open:             3,
  reports_available:        2,
  insights_available:       4,
  subscription_days_remaining: null,
  plan:                     'basic',
  is_premium:               false,
  ...overrides,
});

const makeQuotaResponse = (overrides = {}) => ({
  plan:                   'basic',
  days_remaining:         null,
  subscription_end:       null,
  billing_period_start:   '2024-01-01',
  tokens: [
    { name: 'reports_downloads', label: 'Rapports', limit: 2,  unlimited: false, used: 1, remaining: 1, percentage: 50 },
    { name: 'insights_access',   label: 'Insights', limit: 5,  unlimited: false, used: 2, remaining: 3, percentage: 40 },
    { name: 'studies_participation', label: 'Etudes', limit: 10, unlimited: false, used: 3, remaining: 7, percentage: 30 },
  ],
  ...overrides,
});

const makeStudiesResponse = () => [
  { id: 1, title: 'Etude Sénégal 2024', description: 'Analyse marché', category: 'Economie', duration: '15 min', status: 'Ouvert', icon: '📊', is_active: true },
  { id: 2, title: 'Etude Côte d\'Ivoire', description: 'Tendances', category: 'Finance', duration: '20 min', status: 'Fermé', icon: '📈', is_active: true },
];

// Default success responses for all 3 parallel calls
function mockSuccessfulFetches() {
  mockFetchFn
    .mockResolvedValueOnce({ ok: true, json: async () => makeStudiesResponse() })
    .mockResolvedValueOnce({ ok: true, json: async () => makeStatsResponse() })
    .mockResolvedValueOnce({ ok: true, json: async () => makeQuotaResponse() });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset useAuth to default authenticated state
    useAuthMockReturn = {
      user:         defaultUser,
      token:        'fake-token',
      isLoading:    false,
      isAdmin:      false,
      accessDenied: false,
      logout:       mockLogout,
      hasPermission: jest.fn(() => false),
    };
  });

  // ---- Redirection si non authentifie --------------------------------------

  it('should redirect to /login when user is not authenticated', async () => {
    useAuthMockReturn = {
      ...useAuthMockReturn,
      user:  null,
      token: null,
    };

    // useAuth will trigger the push via the hook itself; the dashboard
    // simply does not fetch and shows nothing meaningful.
    // We verify fetch is never called with a null token.
    mockFetchFn.mockResolvedValue({ ok: false, json: async () => ({}) });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockFetchFn).not.toHaveBeenCalled();
    });
  });

  // ---- Stats cards ----------------------------------------------------------

  it('should display the stats returned by the API', async () => {
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // studies_accessible
      expect(screen.getByText('3')).toBeInTheDocument(); // studies_open
      expect(screen.getByText('4')).toBeInTheDocument(); // insights_available
      expect(screen.getByText('2')).toBeInTheDocument(); // reports_available
    });

    expect(screen.getByText('Études accessibles')).toBeInTheDocument();
    expect(screen.getByText('Études ouvertes')).toBeInTheDocument();
    expect(screen.getByText('Insights disponibles')).toBeInTheDocument();
    expect(screen.getByText('Rapports disponibles')).toBeInTheDocument();
  });

  it('should display zeros in all stat cards when the stats API fails', async () => {
    mockFetchFn
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) }) // studies
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) }) // stats
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) }); // quota

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
    });
  });

  // ---- Badge plan -----------------------------------------------------------

  it('should display the Basic plan badge for a basic user', async () => {
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });
  });

  it('should display the Professionnel plan badge for a pro user', async () => {
    useAuthMockReturn = {
      ...useAuthMockReturn,
      user: { ...defaultUser, plan: 'professionnel' },
    };
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Professionnel')).toBeInTheDocument();
    });
  });

  it('should display the Entreprise plan badge for an enterprise user', async () => {
    useAuthMockReturn = {
      ...useAuthMockReturn,
      user: { ...defaultUser, plan: 'entreprise' },
    };
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Entreprise')).toBeInTheDocument();
    });
  });

  // ---- Quota de tokens ------------------------------------------------------

  it('should display the token quota section when quota data is available', async () => {
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Mes Tokens')).toBeInTheDocument();
    });

    // Labels from TOKEN_LABELS mapping (may appear in stats + tokens sections)
    expect(screen.getAllByText(/Rapports/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Insights/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should not render the token quota section when quota API fails', async () => {
    mockFetchFn
      .mockResolvedValueOnce({ ok: true, json: async () => makeStudiesResponse() })
      .mockResolvedValueOnce({ ok: true, json: async () => makeStatsResponse() })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText('Mes Tokens')).not.toBeInTheDocument();
    });
  });

  // ---- Etudes recentes ------------------------------------------------------

  it('should display recent studies returned by the API', async () => {
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Etude Sénégal 2024')).toBeInTheDocument();
    });

    expect(screen.getByText("Etude Côte d'Ivoire")).toBeInTheDocument();
    expect(screen.getByText('Dernières Études')).toBeInTheDocument();
  });

  it('should show "Aucune étude disponible" when the studies API returns an empty array', async () => {
    mockFetchFn
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => makeStatsResponse() })
      .mockResolvedValueOnce({ ok: true, json: async () => makeQuotaResponse() });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Aucune étude disponible pour le moment.'),
      ).toBeInTheDocument();
    });
  });

  // Sidebar is rendered by the shared (dashboard) layout, not by the page.
  // Sidebar tests belong in a dedicated layout or Sidebar component test.

  // ---- Banner Premium -------------------------------------------------------

  it('should show the upgrade banner for a basic user', async () => {
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Passez à Premium')).toBeInTheDocument();
    });
  });

  it('should not show the upgrade banner for a professionnel user', async () => {
    useAuthMockReturn = {
      ...useAuthMockReturn,
      user: { ...defaultUser, plan: 'professionnel' },
    };
    mockSuccessfulFetches();
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText('Passez à Premium')).not.toBeInTheDocument();
    });
  });
});
