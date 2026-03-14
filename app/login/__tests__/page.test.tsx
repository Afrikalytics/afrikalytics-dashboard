import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock lucide-react icons to simple spans
jest.mock('lucide-react', () => ({
  Mail: (props: Record<string, unknown>) => <span data-testid="icon-mail" {...props} />,
  Lock: (props: Record<string, unknown>) => <span data-testid="icon-lock" {...props} />,
  Eye: (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  EyeOff: (props: Record<string, unknown>) => <span data-testid="icon-eyeoff" {...props} />,
  Loader2: (props: Record<string, unknown>) => <span data-testid="icon-loader" {...props} />,
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders email and password inputs', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('renders the submit button with correct text', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('renders the page title', () => {
    render(<LoginPage />);
    expect(screen.getByText('Connexion')).toBeInTheDocument();
  });

  it('renders links for registration and forgot password', () => {
    render(<LoginPage />);
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
  });

  it('submit button is disabled when fields are empty', () => {
    render(<LoginPage />);
    const button = screen.getByRole('button', { name: /se connecter/i });
    expect(button).toBeDisabled();
  });

  it('calls fetch on form submit and stores token on success', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'fake-jwt-token',
        user: { id: 1, email: 'test@example.com', full_name: 'Test' },
      }),
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email: 'test@example.com', password: 'Password123!' }),
      }),
    );

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token');
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('displays error message on failed login', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Email ou mot de passe incorrect' }),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('votre@email.com'), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'bad-password');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to verify-code when 2FA is required', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ requires_verification: true }),
    });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText('votre@email.com'), 'twofa@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'Password123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/verify-code');
    });
  });
});
