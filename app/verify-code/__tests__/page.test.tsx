import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyCodePage from '../page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('lucide-react', () => ({
  Shield:   (props: Record<string, unknown>) => <span data-testid="icon-shield" {...props} />,
  Loader2:  (props: Record<string, unknown>) => <span data-testid="icon-loader2" {...props} />,
  ArrowLeft:(props: Record<string, unknown>) => <span data-testid="icon-arrowleft" {...props} />,
  RefreshCw:(props: Record<string, unknown>) => <span data-testid="icon-refreshcw" {...props} />,
}));

const mockFetchFn = jest.fn();
global.fetch = mockFetchFn;

// localStorage mock
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

// sessionStorage mock — always returns the test email
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    jest.fn((key: string) => store[key] ?? null),
    setItem:    jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear:      jest.fn(() => { store = {}; }),
    _set:       (key: string, value: string) => { store[key] = value; },
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// ---------------------------------------------------------------------------
// Helper — type all 6 digits into the OTP inputs
// ---------------------------------------------------------------------------

async function enterCode(
  user: ReturnType<typeof userEvent.setup>,
  code: string,
) {
  const digits = code.split('');
  for (let i = 0; i < digits.length; i++) {
    const input = screen.getByRole('textbox', {
      name: new RegExp(`Chiffre ${i + 1} sur 6`, 'i'),
    });
    await user.type(input, digits[i]);
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('VerifyCodePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    sessionStorageMock.clear();
    // Pre-fill the email so the form renders (not the "Session expirée" fallback)
    sessionStorageMock._set('verify_email', 'user@example.com');
  });

  // ---- Rendu ----------------------------------------------------------------

  it('should render the 6 digit OTP inputs when email is in sessionStorage', () => {
    render(<VerifyCodePage />);

    // Each input has aria-label "Chiffre N sur 6"
    for (let i = 1; i <= 6; i++) {
      expect(
        screen.getByRole('textbox', { name: `Chiffre ${i} sur 6` }),
      ).toBeInTheDocument();
    }
  });

  it('should render the verify button in a disabled state when inputs are empty', () => {
    render(<VerifyCodePage />);
    expect(screen.getByRole('button', { name: /vérifier/i })).toBeDisabled();
  });

  it('should show a "Session expirée" fallback when no email is in sessionStorage', () => {
    sessionStorageMock.clear();
    render(<VerifyCodePage />);
    expect(screen.getByText('Session expirée')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /retour à la connexion/i }),
    ).toBeInTheDocument();
  });

  // ---- Soumission valide -----------------------------------------------------

  it('should save session via httpOnly cookie then redirect to /dashboard on valid code', async () => {
    const user = userEvent.setup();
    const fakeUser = { id: 1, email: 'user@example.com', full_name: 'Test User' };

    // First call: verify-code API, second call: saveSession
    mockFetchFn
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'jwt-token', user: fakeUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<VerifyCodePage />);
    await enterCode(user, '123456');

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/verify-code'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }),
          body: JSON.stringify({ email: 'user@example.com', code: '123456' }),
        }),
      );
    });

    // Verify saveSession was called (httpOnly cookie)
    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledWith(
        '/api/auth/session',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('jwt-token'),
        }),
      );
    });

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  // ---- Code invalide --------------------------------------------------------

  it('should display an error message when the code is invalid', async () => {
    const user = userEvent.setup();

    mockFetchFn.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Code invalide ou expiré' }),
    });

    render(<VerifyCodePage />);
    await enterCode(user, '000000');

    await waitFor(() => {
      expect(
        screen.getByText('Code invalide ou expiré'),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  // ---- Renvoyer le code -----------------------------------------------------

  it('should call the resend-code API when the user clicks "Renvoyer le code"', async () => {
    const user = userEvent.setup();

    mockFetchFn.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<VerifyCodePage />);

    const resendButton = screen.getByRole('button', { name: /renvoyer le code/i });
    await user.click(resendButton);

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/resend-code'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          }),
          body: JSON.stringify({ email: 'user@example.com' }),
        }),
      );
    });
  });

  it('should disable the resend button with a countdown after a successful resend', async () => {
    const user = userEvent.setup();

    mockFetchFn.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<VerifyCodePage />);
    await user.click(screen.getByRole('button', { name: /renvoyer le code/i }));

    await waitFor(() => {
      // After resend, the button shows a countdown and is disabled
      expect(screen.getByRole('button', { name: /renvoyer dans/i })).toBeDisabled();
    });
  });
});
