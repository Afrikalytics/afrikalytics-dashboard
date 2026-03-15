import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from '../ForgotPasswordForm';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// next/link renders as <a> in tests by default, no explicit mock needed.
// next/navigation is not used by this page but imported transitively.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn() }),
}));

jest.mock('lucide-react', () => ({
  Mail:        (props: Record<string, unknown>) => <span data-testid="icon-mail" {...props} />,
  ArrowLeft:   (props: Record<string, unknown>) => <span data-testid="icon-arrowleft" {...props} />,
  Loader2:     (props: Record<string, unknown>) => <span data-testid="icon-loader2" {...props} />,
  CheckCircle: (props: Record<string, unknown>) => <span data-testid="icon-checkcircle" {...props} />,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the email input and submit button', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText(/adresse email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /envoyer le lien/i })).toBeInTheDocument();
  });

  it('should render the page title and description', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText('Mot de passe oublié ?')).toBeInTheDocument();
    expect(screen.getByText(/entrez votre email/i)).toBeInTheDocument();
  });

  it('should render a link back to /login', () => {
    render(<ForgotPasswordPage />);

    const links = screen.getAllByRole('link', { name: /retour à la connexion/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', '/login');
  });

  it('should disable the submit button when email field is empty', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole('button', { name: /envoyer le lien/i })).toBeDisabled();
  });

  it('should call the forgot-password API and show success screen on valid email', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Email sent' }),
    });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('votre@email.com'), 'jean@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/forgot-password'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ email: 'jean@example.com' }),
        }),
      );
    });

    // Success screen
    await waitFor(() => {
      expect(screen.getByText('Email envoyé !')).toBeInTheDocument();
    });

    // The submitted email is shown on the success screen
    expect(screen.getByText(/jean@example\.com/)).toBeInTheDocument();
  });

  it('should display an error message when the API returns an error', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'Aucun compte associé à cet email' }),
    });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('votre@email.com'), 'unknown@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Aucun compte associé à cet email')).toBeInTheDocument();
    });

    // Should stay on the form page, not the success screen
    expect(screen.queryByText('Email envoyé !')).not.toBeInTheDocument();
  });

  it('should show success screen with a link back to /login', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByPlaceholderText('votre@email.com'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
      expect(screen.getByText('Email envoyé !')).toBeInTheDocument();
    });

    const backLink = screen.getByRole('link', { name: /retour à la connexion/i });
    expect(backLink).toHaveAttribute('href', '/login');
  });
});
