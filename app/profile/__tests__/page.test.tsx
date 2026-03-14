import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../page';

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

jest.mock('lucide-react', () => ({
  User:          (props: Record<string, unknown>) => <span data-testid="icon-user" {...props} />,
  Mail:          (props: Record<string, unknown>) => <span data-testid="icon-mail" {...props} />,
  Shield:        (props: Record<string, unknown>) => <span data-testid="icon-shield" {...props} />,
  Calendar:      (props: Record<string, unknown>) => <span data-testid="icon-calendar" {...props} />,
  Crown:         (props: Record<string, unknown>) => <span data-testid="icon-crown" {...props} />,
  Lock:          (props: Record<string, unknown>) => <span data-testid="icon-lock" {...props} />,
  Eye:           (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  EyeOff:        (props: Record<string, unknown>) => <span data-testid="icon-eyeoff" {...props} />,
  CheckCircle:   (props: Record<string, unknown>) => <span data-testid="icon-checkcircle" {...props} />,
  AlertCircle:   (props: Record<string, unknown>) => <span data-testid="icon-alertcircle" {...props} />,
  ArrowLeft:     (props: Record<string, unknown>) => <span data-testid="icon-arrowleft" {...props} />,
  Loader2:       (props: Record<string, unknown>) => <span data-testid="icon-loader2" role="status" aria-label="Chargement du profil" {...props} />,
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
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
// Fixtures
// ---------------------------------------------------------------------------

const basicUser = {
  id: 1,
  email: 'jean@example.com',
  full_name: 'Jean Dupont',
  plan: 'basic' as string,
  is_active: true,
  is_admin: false,
  admin_role: null as string | null,
  parent_user_id: null as number | null,
  is_verified: true,
  created_at: '2024-01-15T00:00:00Z',
};

const proUser = {
  ...basicUser,
  plan: 'professionnel',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupAuth(user = basicUser, isLoading = false) {
  mockUseAuth.mockReturnValue({
    user,
    token: 'fake-token',
    isLoading,
    isAdmin: user.is_admin,
    accessDenied: false,
    logout: jest.fn(),
    hasPermission: jest.fn(() => false),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localStorageMock.getItem.mockImplementation(((key: string) => {
    if (key === 'token') return 'fake-token';
    return null;
  }) as any);
}

async function fillPasswordForm(
  user: ReturnType<typeof userEvent.setup>,
  current = 'OldPass123!',
  newPwd = 'NewPass456!',
  confirm = 'NewPass456!',
) {
  const inputs = screen.getAllByPlaceholderText('••••••••');
  // Order in DOM: current-password, new-password, confirm-password
  await user.type(inputs[0], current);
  await user.type(inputs[1], newPwd);
  await user.type(inputs[2], confirm);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('should display user name and email in the profile header', () => {
    setupAuth();
    render(<ProfilePage />);

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    // email appears twice: once in the header, once in the info row
    expect(screen.getAllByText('jean@example.com').length).toBeGreaterThanOrEqual(1);
  });

  it('should display the current plan badge (Basic)', () => {
    setupAuth();
    render(<ProfilePage />);

    expect(screen.getByText('Basic')).toBeInTheDocument();
  });

  it('should display the Premium plan badge for professionnel users', () => {
    setupAuth(proUser);
    render(<ProfilePage />);

    expect(screen.getByText('Professionnel')).toBeInTheDocument();
  });

  it('should show upgrade CTA for basic plan users', () => {
    setupAuth(basicUser);
    render(<ProfilePage />);

    expect(screen.getByText('Passez à Premium')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voir les offres/i })).toBeInTheDocument();
  });

  it('should not show upgrade CTA for professionnel users', () => {
    setupAuth(proUser);
    render(<ProfilePage />);

    expect(screen.queryByText('Passez à Premium')).not.toBeInTheDocument();
  });

  it('should show success message after a successful password change', async () => {
    const user = userEvent.setup();
    setupAuth();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password changed' }),
    });

    render(<ProfilePage />);
    await fillPasswordForm(user);

    await user.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/mot de passe modifié avec succès/i),
      ).toBeInTheDocument();
    });
  });

  it('should call the change-password API with correct payload', async () => {
    const user = userEvent.setup();
    setupAuth();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'ok' }),
    });

    render(<ProfilePage />);
    await fillPasswordForm(user, 'OldPass123!', 'NewPass456!', 'NewPass456!');
    await user.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/change-password'),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }),
          body: JSON.stringify({
            current_password: 'OldPass123!',
            new_password:     'NewPass456!',
          }),
        }),
      );
    });
  });

  it('should show an error message when the API returns 400 (wrong current password)', async () => {
    const user = userEvent.setup();
    setupAuth();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Mot de passe actuel incorrect' }),
    });

    render(<ProfilePage />);
    await fillPasswordForm(user);
    await user.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Mot de passe actuel incorrect')).toBeInTheDocument();
    });
  });

  it('should show a client-side error when new passwords do not match', async () => {
    const user = userEvent.setup();
    setupAuth();

    render(<ProfilePage />);
    await fillPasswordForm(user, 'OldPass123!', 'NewPass456!', 'Different999!');
    await user.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas')).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should show a client-side error when new password is too short', async () => {
    const user = userEvent.setup();
    setupAuth();

    render(<ProfilePage />);
    await fillPasswordForm(user, 'OldPass123!', 'short', 'short');
    await user.click(screen.getByRole('button', { name: /changer le mot de passe/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Le nouveau mot de passe doit contenir au moins 8 caractères'),
      ).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should show a loading spinner while auth is resolving', () => {
    setupAuth(basicUser, true);
    render(<ProfilePage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
