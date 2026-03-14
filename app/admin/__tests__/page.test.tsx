import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: jest.fn() }),
}));

// Mock useAuth — will be reconfigured per test via mockUseAuth
const mockUseAuth = jest.fn();
jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

// Mock Sidebar (heavy component with its own nav logic)
jest.mock('@/components/Sidebar', () => ({
  Sidebar: () => <nav data-testid="sidebar" />,
}));

// Mock @/lib/api
const mockApiGet = jest.fn();
const mockApiDelete = jest.fn();
jest.mock('@/lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    delete: (...args: unknown[]) => mockApiDelete(...args),
  },
  ApiRequestError: class ApiRequestError extends Error {
    status: number;
    constructor(status: number, detail: string) {
      super(detail);
      this.status = status;
    }
  },
}));

jest.mock('lucide-react', () => ({
  Plus:    (props: Record<string, unknown>) => <span data-testid="icon-plus" {...props} />,
  Pencil:  (props: Record<string, unknown>) => <span data-testid="icon-pencil" {...props} />,
  Trash2:  (props: Record<string, unknown>) => <span data-testid="icon-trash2" {...props} />,
  Eye:     (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  EyeOff:  (props: Record<string, unknown>) => <span data-testid="icon-eyeoff" {...props} />,
  ShieldX: (props: Record<string, unknown>) => <span data-testid="icon-shieldx" {...props} />,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const adminUser = {
  id: 1,
  email: 'admin@example.com',
  full_name: 'Admin Test',
  plan: 'basic' as const,
  is_active: true,
  is_admin: true,
  admin_role: 'super_admin',
  parent_user_id: null,
  is_verified: true,
  created_at: '2024-01-01T00:00:00Z',
};

const sampleStudies = [
  {
    id: 1,
    title: 'Étude Marché Dakar',
    description: 'Analyse du marché de Dakar',
    category: 'Commerce',
    status: 'Ouvert',
    is_active: true,
    duration: '30 min',
    deadline: '2024-12-31',
  },
  {
    id: 2,
    title: 'Étude Agriculture',
    description: "Secteur agricole en Afrique de l'Ouest",
    category: 'Agriculture',
    status: 'Fermé',
    is_active: false,
    duration: '20 min',
    deadline: null,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupAuthOk() {
  mockUseAuth.mockReturnValue({
    user: adminUser,
    token: 'fake-token',
    isLoading: false,
    accessDenied: false,
    logout: jest.fn(),
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show access denied screen when user lacks admin permission', () => {
    mockUseAuth.mockReturnValue({
      user: { ...adminUser, is_admin: false },
      token: 'fake-token',
      isLoading: false,
      accessDenied: true,
      logout: jest.fn(),
    });

    render(<AdminPage />);

    expect(screen.getByText('Accès refusé')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /retour au dashboard/i })).toBeInTheDocument();
  });

  it('should render the studies management page title after loading', async () => {
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce(sampleStudies);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Gestion des Études')).toBeInTheDocument();
    });
  });

  it('should render the studies table with study titles', async () => {
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce(sampleStudies);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Étude Marché Dakar').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Étude Agriculture').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should render a link to add a new study', async () => {
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce(sampleStudies);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /nouvelle étude/i })).toBeInTheDocument();
    });
  });

  it('should render edit links for each study', async () => {
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce(sampleStudies);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /modifier étude marché dakar/i }).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should call api.delete and remove study from list when delete is confirmed', async () => {
    const user = userEvent.setup();
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce(sampleStudies);
    mockApiDelete.mockResolvedValueOnce(undefined);

    // Simulate window.confirm = true
    window.confirm = jest.fn(() => true);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /supprimer étude marché dakar/i }).length).toBeGreaterThanOrEqual(1);
    });

    await user.click(screen.getAllByRole('button', { name: /supprimer étude marché dakar/i })[0]);

    await waitFor(() => {
      expect(mockApiDelete).toHaveBeenCalledWith('/api/studies/1');
    });

    // Study should no longer be in the DOM
    expect(screen.queryAllByText('Étude Marché Dakar')).toHaveLength(0);
  });

  it('should not delete study when user cancels the confirm dialog', async () => {
    const user = userEvent.setup();
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce(sampleStudies);

    window.confirm = jest.fn(() => false);

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /supprimer étude marché dakar/i }).length).toBeGreaterThanOrEqual(1);
    });

    await user.click(screen.getAllByRole('button', { name: /supprimer étude marché dakar/i })[0]);

    expect(mockApiDelete).not.toHaveBeenCalled();
    expect(screen.getAllByText('Étude Marché Dakar').length).toBeGreaterThanOrEqual(1);
  });

  it('should show empty state message when no studies are returned', async () => {
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce([]);

    render(<AdminPage />);

    await waitFor(() => {
      expect(
        screen.getAllByText(/aucune étude pour le moment/i).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('should display visibility icon based on study is_active status', async () => {
    setupAuthOk();
    mockApiGet.mockResolvedValueOnce(sampleStudies);

    render(<AdminPage />);

    await waitFor(() => {
      // is_active=true -> Eye icon, is_active=false -> EyeOff icon
      const eyeIcons = screen.getAllByTestId('icon-eye');
      const eyeOffIcons = screen.getAllByTestId('icon-eyeoff');
      expect(eyeIcons.length).toBeGreaterThan(0);
      expect(eyeOffIcons.length).toBeGreaterThan(0);
    });
  });
});
