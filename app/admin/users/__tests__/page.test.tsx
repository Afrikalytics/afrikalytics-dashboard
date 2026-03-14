import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminUsersPage from '../page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: jest.fn() }),
}));

// Mock @/lib/api
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiPut = jest.fn();
const mockApiDelete = jest.fn();

jest.mock('@/lib/api', () => ({
  api: {
    get:    (...args: unknown[]) => mockApiGet(...args),
    post:   (...args: unknown[]) => mockApiPost(...args),
    put:    (...args: unknown[]) => mockApiPut(...args),
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
  Users:      (props: Record<string, unknown>) => <span data-testid="icon-users" {...props} />,
  Plus:       (props: Record<string, unknown>) => <span data-testid="icon-plus" {...props} />,
  Edit:       (props: Record<string, unknown>) => <span data-testid="icon-edit" {...props} />,
  Trash2:     (props: Record<string, unknown>) => <span data-testid="icon-trash2" {...props} />,
  Search:     (props: Record<string, unknown>) => <span data-testid="icon-search" {...props} />,
  X:          (props: Record<string, unknown>) => <span data-testid="icon-x" {...props} />,
  Shield:     (props: Record<string, unknown>) => <span data-testid="icon-shield" {...props} />,
  UserCheck:  () => null,
  UserX:      () => null,
  ArrowLeft:  (props: Record<string, unknown>) => <span data-testid="icon-arrowleft" {...props} />,
  Eye:        (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  EyeOff:     (props: Record<string, unknown>) => <span data-testid="icon-eyeoff" {...props} />,
  FileText:   (props: Record<string, unknown>) => <span data-testid="icon-filetext" {...props} />,
  Lightbulb:  (props: Record<string, unknown>) => <span data-testid="icon-lightbulb" {...props} />,
  Download:   (props: Record<string, unknown>) => <span data-testid="icon-download" {...props} />,
  Crown:      (props: Record<string, unknown>) => <span data-testid="icon-crown" {...props} />,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const superAdmin = {
  id: 1,
  email: 'super@example.com',
  full_name: 'Super Admin',
  plan: 'basic' as const,
  is_active: true,
  is_admin: true,
  admin_role: 'super_admin',
  parent_user_id: null,
  is_verified: true,
  created_at: '2024-01-01T00:00:00Z',
};

const sampleUsers = [
  {
    id: 1,
    email: 'super@example.com',
    full_name: 'Super Admin',
    plan: 'basic',
    is_active: true,
    is_admin: true,
    admin_role: 'super_admin',
    parent_user_id: null,
    is_verified: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'content@example.com',
    full_name: 'Admin Contenu',
    plan: 'professionnel',
    is_active: true,
    is_admin: true,
    admin_role: 'admin_content',
    parent_user_id: null,
    is_verified: true,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 3,
    email: 'user@example.com',
    full_name: 'Utilisateur Basique',
    plan: 'basic',
    is_active: false,
    is_admin: false,
    admin_role: null,
    parent_user_id: null,
    is_verified: true,
    created_at: '2024-03-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminUsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the user management page title after loading', async () => {
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Gestion des Utilisateurs')).toBeInTheDocument();
    });
  });

  it('should display the total user count', async () => {
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText(`${sampleUsers.length} utilisateurs au total`)).toBeInTheDocument();
    });
  });

  it('should render the users table with all user names', async () => {
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      // "Super Admin" may appear multiple times (full_name + role badge)
      expect(screen.getAllByText('Super Admin').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Admin Contenu').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Utilisateur Basique').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should display admin role badges (Super Admin, Admin Contenu)', async () => {
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      // "Super Admin" appears as both full_name and role badge; getAllByText is safe
      expect(screen.getAllByText('Super Admin').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Admin Contenu').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should show active/inactive status badge for each user', async () => {
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      const actifBadges = screen.getAllByText('Actif');
      const inactifBadges = screen.getAllByText('Inactif');
      expect(actifBadges.length).toBeGreaterThanOrEqual(1);
      expect(inactifBadges.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should open create user modal when "Nouvel utilisateur" is clicked', async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /nouvel utilisateur/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /nouvel utilisateur/i }));

    expect(screen.getByText('Nouvel Utilisateur')).toBeInTheDocument();
  });

  it('should open edit modal with pre-filled data when edit button is clicked', async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      // The edit buttons have title="Modifier"
      const editButtons = screen.getAllByTitle('Modifier');
      expect(editButtons).toHaveLength(sampleUsers.length);
    });

    const editButtons = screen.getAllByTitle('Modifier');
    await user.click(editButtons[0]);

    expect(screen.getByText("Modifier l'Utilisateur")).toBeInTheDocument();
  });

  it('should call api.put with is_active toggled when status badge is clicked', async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValueOnce(sampleUsers);
    mockApiPut.mockResolvedValueOnce(undefined);
    // Second call for fetchUsers after toggle
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Actif').length).toBeGreaterThan(0);
    });

    // Click first "Actif" badge to toggle the first active user
    const actifBadges = screen.getAllByText('Actif');
    await user.click(actifBadges[0]);

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/users/'),
        expect.objectContaining({ is_active: false }),
      );
    });
  });

  it('should filter users by name using the search input', async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/rechercher par nom ou email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/rechercher par nom ou email/i), 'Admin Contenu');

    await waitFor(() => {
      expect(screen.getAllByText('Admin Contenu').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryAllByText('Utilisateur Basique')).toHaveLength(0);
    });
  });

  it('should show empty state when search yields no results', async () => {
    const user = userEvent.setup();
    mockApiGet.mockResolvedValueOnce(sampleUsers);

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/rechercher par nom ou email/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText(/rechercher par nom ou email/i),
      'xxxxinexistant',
    );

    await waitFor(() => {
      expect(screen.getByText('Aucun utilisateur trouvé')).toBeInTheDocument();
    });
  });

  it('should show API error message when fetching users fails with 403', async () => {
    const { ApiRequestError } = await import('@/lib/api');
    mockApiGet.mockRejectedValueOnce(new ApiRequestError(403, 'Forbidden'));

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Vous n'avez pas la permission de gérer les utilisateurs"),
      ).toBeInTheDocument();
    });
  });
});
