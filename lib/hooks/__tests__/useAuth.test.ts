import { renderHook, act, waitFor } from '@testing-library/react';
import { makeUser } from '@/__tests__/helpers';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock clearSession and getSession from api module
const mockGetSession = jest.fn();
const mockClearSession = jest.fn();
jest.mock('../../api', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  clearSession: (...args: unknown[]) => mockClearSession(...args),
}));

// Import after mocks are set up
import { useAuth } from '../useAuth';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const regularUser = makeUser({ is_admin: false, admin_role: null });
const adminUser = makeUser({ is_admin: true, admin_role: 'super_admin' });
const studiesAdmin = makeUser({ is_admin: true, admin_role: 'admin_studies' });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearSession.mockResolvedValue(undefined);
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  it('returns isLoading: true initially', () => {
    mockGetSession.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Session fetch
  // -------------------------------------------------------------------------

  it('fetches the session from /api/auth/session via getSession()', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: regularUser,
      token: 'jwt-123',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetSession).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Valid session
  // -------------------------------------------------------------------------

  it('returns user and token when session is valid', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: regularUser,
      token: 'jwt-123',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(regularUser);
    expect(result.current.token).toBe('jwt-123');
    expect(result.current.isAdmin).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Invalid session → redirect
  // -------------------------------------------------------------------------

  it('redirects to /login when session is not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: false,
      user: null,
      token: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(result.current.user).toBeNull();
  });

  it('redirects to /login when getSession throws', async () => {
    mockGetSession.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('does not redirect when optional: true and session is invalid', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: false,
      user: null,
      token: null,
    });

    const { result } = renderHook(() => useAuth({ optional: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // requireAdmin
  // -------------------------------------------------------------------------

  it('sets accessDenied when requireAdmin is true but user is not admin', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: regularUser,
      token: 'jwt-123',
    });

    const { result } = renderHook(() => useAuth({ requireAdmin: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accessDenied).toBe(true);
    expect(result.current.user).toEqual(regularUser);
  });

  it('does not set accessDenied when user is admin', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: adminUser,
      token: 'jwt-admin',
    });

    const { result } = renderHook(() => useAuth({ requireAdmin: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accessDenied).toBe(false);
    expect(result.current.isAdmin).toBe(true);
  });

  it('sets accessDenied when requireAdmin is a specific permission the user lacks', async () => {
    // admin_studies lacks "insights" permission
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: studiesAdmin,
      token: 'jwt-studies',
    });

    const { result } = renderHook(() =>
      useAuth({ requireAdmin: 'insights' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accessDenied).toBe(true);
  });

  it('does not set accessDenied when user has the required specific permission', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: studiesAdmin,
      token: 'jwt-studies',
    });

    const { result } = renderHook(() =>
      useAuth({ requireAdmin: 'studies' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.accessDenied).toBe(false);
  });

  // -------------------------------------------------------------------------
  // hasPermission()
  // -------------------------------------------------------------------------

  it('hasPermission returns true for allowed permission', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: adminUser,
      token: 'jwt-admin',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasPermission('studies')).toBe(true);
    expect(result.current.hasPermission('users')).toBe(true);
  });

  it('hasPermission returns false for disallowed permission', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: studiesAdmin,
      token: 'jwt-studies',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasPermission('studies')).toBe(true);
    expect(result.current.hasPermission('insights')).toBe(false);
    expect(result.current.hasPermission('users')).toBe(false);
  });

  it('hasPermission returns false for non-admin user', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: regularUser,
      token: 'jwt-regular',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasPermission('studies')).toBe(false);
  });

  // -------------------------------------------------------------------------
  // logout()
  // -------------------------------------------------------------------------

  it('logout clears session and redirects to /login', async () => {
    mockGetSession.mockResolvedValueOnce({
      authenticated: true,
      user: regularUser,
      token: 'jwt-123',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockClearSession).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });
});
