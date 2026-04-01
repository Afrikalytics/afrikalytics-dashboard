import { makeUser } from '@/__tests__/helpers';
import { ApiRequestError } from '../api';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPostPublic = jest.fn();
const mockSaveSession = jest.fn();

jest.mock('../api', () => ({
  ...jest.requireActual('../api'),
  api: { postPublic: mockPostPublic },
  saveSession: mockSaveSession,
}));

// Import after mocks are set up
import {
  loginAndSave,
  registerAndSave,
  forgotPassword,
  resetPassword,
  verifyCodeAndSave,
  resendCode,
} from '../auth-service';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveSession.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// loginAndSave
// ---------------------------------------------------------------------------

describe('loginAndSave', () => {
  it('returns user and saves session on success', async () => {
    const user = makeUser();
    mockPostPublic.mockResolvedValueOnce({
      access_token: 'tok',
      refresh_token: 'ref',
      token_type: 'bearer',
      user,
    });

    const result = await loginAndSave('a@b.com', 'pass');

    expect(mockPostPublic).toHaveBeenCalledWith('/api/auth/login', {
      email: 'a@b.com',
      password: 'pass',
    });
    expect(mockSaveSession).toHaveBeenCalledWith('tok', user, 'ref');
    expect(result).toEqual({ requiresVerification: false, user });
  });

  it('returns requiresVerification when 2FA is needed', async () => {
    mockPostPublic.mockResolvedValueOnce({
      requires_verification: true,
      email: 'a@b.com',
      status: 'verification_required',
      message: 'Code envoyé',
    });

    const result = await loginAndSave('a@b.com', 'pass');

    expect(mockSaveSession).not.toHaveBeenCalled();
    expect(result).toEqual({ requiresVerification: true, email: 'a@b.com' });
  });

  it('throws when API returns an error', async () => {
    mockPostPublic.mockRejectedValueOnce(
      new ApiRequestError(401, 'Email ou mot de passe incorrect'),
    );

    await expect(loginAndSave('a@b.com', 'bad')).rejects.toThrow(ApiRequestError);
    expect(mockSaveSession).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// registerAndSave
// ---------------------------------------------------------------------------

describe('registerAndSave', () => {
  it('registers, saves session with refresh token, and returns user', async () => {
    const user = makeUser({ email: 'new@test.com' });
    mockPostPublic.mockResolvedValueOnce({
      access_token: 'tok2',
      refresh_token: 'ref2',
      token_type: 'bearer',
      user,
    });

    const result = await registerAndSave('Jean', 'new@test.com', 'secret');

    expect(mockPostPublic).toHaveBeenCalledWith('/api/auth/register', {
      name: 'Jean',
      email: 'new@test.com',
      password: 'secret',
    });
    expect(mockSaveSession).toHaveBeenCalledWith('tok2', user, 'ref2');
    expect(result).toEqual(user);
  });
});

// ---------------------------------------------------------------------------
// forgotPassword
// ---------------------------------------------------------------------------

describe('forgotPassword', () => {
  it('calls forgot-password endpoint and returns message', async () => {
    mockPostPublic.mockResolvedValueOnce({ message: 'Email envoyé' });

    const result = await forgotPassword('a@b.com');

    expect(mockPostPublic).toHaveBeenCalledWith('/api/auth/forgot-password', {
      email: 'a@b.com',
    });
    expect(result).toEqual({ message: 'Email envoyé' });
  });
});

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------

describe('resetPassword', () => {
  it('calls reset-password endpoint and returns message', async () => {
    mockPostPublic.mockResolvedValueOnce({ message: 'Mot de passe réinitialisé' });

    const result = await resetPassword('reset-tok', 'newpass123');

    expect(mockPostPublic).toHaveBeenCalledWith('/api/auth/reset-password', {
      token: 'reset-tok',
      new_password: 'newpass123',
    });
    expect(result).toEqual({ message: 'Mot de passe réinitialisé' });
  });
});

// ---------------------------------------------------------------------------
// verifyCodeAndSave
// ---------------------------------------------------------------------------

describe('verifyCodeAndSave', () => {
  it('verifies code, saves session, and returns user', async () => {
    const user = makeUser();
    mockPostPublic.mockResolvedValueOnce({
      access_token: 'tok3',
      refresh_token: 'ref3',
      token_type: 'bearer',
      user,
    });

    const result = await verifyCodeAndSave('a@b.com', '123456');

    expect(mockPostPublic).toHaveBeenCalledWith('/api/auth/verify-code', {
      email: 'a@b.com',
      code: '123456',
    });
    expect(mockSaveSession).toHaveBeenCalledWith('tok3', user, 'ref3');
    expect(result).toEqual(user);
  });
});

// ---------------------------------------------------------------------------
// resendCode
// ---------------------------------------------------------------------------

describe('resendCode', () => {
  it('calls resend-code endpoint and returns message', async () => {
    mockPostPublic.mockResolvedValueOnce({ message: 'Code renvoyé' });

    const result = await resendCode('a@b.com');

    expect(mockPostPublic).toHaveBeenCalledWith('/api/auth/resend-code', {
      email: 'a@b.com',
    });
    expect(result).toEqual({ message: 'Code renvoyé' });
  });
});
