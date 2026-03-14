import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../page';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('lucide-react', () => ({
  BarChart3:  (props: Record<string, unknown>) => <span data-testid="icon-barchart3" {...props} />,
  Mail:       (props: Record<string, unknown>) => <span data-testid="icon-mail" {...props} />,
  Lock:       (props: Record<string, unknown>) => <span data-testid="icon-lock" {...props} />,
  User:       (props: Record<string, unknown>) => <span data-testid="icon-user" {...props} />,
  Eye:        (props: Record<string, unknown>) => <span data-testid="icon-eye" {...props} />,
  EyeOff:     (props: Record<string, unknown>) => <span data-testid="icon-eyeoff" {...props} />,
  ArrowRight: (props: Record<string, unknown>) => <span data-testid="icon-arrowright" {...props} />,
  Check:      (props: Record<string, unknown>) => <span data-testid="icon-check" {...props} />,
}));

const mockFetchFn = jest.fn();
global.fetch = mockFetchFn;

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
// Helpers
// ---------------------------------------------------------------------------

async function fillForm(user: ReturnType<typeof userEvent.setup>, overrides: {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
} = {}) {
  const {
    name            = 'Jean Dupont',
    email           = 'jean@example.com',
    password        = 'Password123!',
    confirmPassword = 'Password123!',
  } = overrides;

  await user.type(screen.getByPlaceholderText('Jean Dupont'), name);
  await user.type(screen.getByPlaceholderText('votre@email.com'), email);

  // The two password inputs share the same placeholder "••••••••" —
  // getAllByPlaceholderText returns them in DOM order: [password, confirmPassword].
  const passwordInputs = screen.getAllByPlaceholderText('••••••••');
  await user.type(passwordInputs[0], password);
  await user.type(passwordInputs[1], confirmPassword);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  // ---- Rendu ----------------------------------------------------------------

  it('should render the name, email, and password inputs', () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    // Two password inputs (password + confirmPassword)
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
  });

  it('should render the page title', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Créer un compte gratuit')).toBeInTheDocument();
  });

  it('should render a link to the login page', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('link', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('should render the plan benefits list', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Plan Basic inclut :')).toBeInTheDocument();
    expect(screen.getByText('Participer aux études')).toBeInTheDocument();
  });

  // ---- Validation cote client -----------------------------------------------

  it('should show an error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, { confirmPassword: 'Different999!' });
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Les mots de passe ne correspondent pas'),
      ).toBeInTheDocument();
    });

    expect(mockFetchFn).not.toHaveBeenCalled();
  });

  it('should show an error when password is shorter than 8 characters', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, { password: 'abc', confirmPassword: 'abc' });
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Le mot de passe doit contenir au moins 8 caractères'),
      ).toBeInTheDocument();
    });

    expect(mockFetchFn).not.toHaveBeenCalled();
  });

  // ---- Soumission valide -----------------------------------------------------

  it('should call the register API and save session via httpOnly cookie on valid submission', async () => {
    const user = userEvent.setup();
    const fakeUser = { id: 1, email: 'jean@example.com', full_name: 'Jean Dupont' };

    // First call: register API, second call: saveSession
    mockFetchFn
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'fake-jwt', user: fakeUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<RegisterPage />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(mockFetchFn).toHaveBeenCalledTimes(2);
    });

    // First call: register API
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/register'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          name:     'Jean Dupont',
          email:    'jean@example.com',
          password: 'Password123!',
        }),
      }),
    );

    // Second call: saveSession (httpOnly cookie)
    expect(mockFetchFn).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('fake-jwt'),
      }),
    );

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  // ---- Erreurs serveur -------------------------------------------------------

  it('should display the server error message on failed registration', async () => {
    const user = userEvent.setup();

    mockFetchFn.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Cette adresse email est déjà utilisée" }),
    });

    render(<RegisterPage />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Cette adresse email est déjà utilisée"),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should display a generic error message when the API returns no detail', async () => {
    const user = userEvent.setup();

    mockFetchFn.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<RegisterPage />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Erreur lors de l'inscription"),
      ).toBeInTheDocument();
    });
  });
});
