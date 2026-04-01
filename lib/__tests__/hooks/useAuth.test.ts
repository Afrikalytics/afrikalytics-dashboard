import { renderHook, act, waitFor } from '@testing-library/react';
import { makeUser } from '@/__tests__/helpers';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockGetSession = jest.fn();
const mockClearSession = jest.fn().mockResolvedValue(undefined);
const mockApiGet = jest.fn();

jest.mock('../../api', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  clearSession: (...args: unknown[]) => mockClearSession(...args),
  api: { get: (...args: unknown[]) => mockApiGet(...args) },
}));

import { useAuth } from '../../hooks/useAuth';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAuth', () => {
  it('returns user when session is authenticated', async () => {
    const user = makeUser();
    mockGetSession.mockResolvedValueOnce({ authenticated: true, user });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual(user);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.accessDenied).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to /login when session is not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({ authenticated: false, user: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(result.current.user).toBeNull();
  });

  it('sets accessDenied when requireAdmin and user is not admin', async () => {
    const regularUser = makeUser({ is_admin: false });
    mockGetSession.mockResolvedValueOnce({ authenticated: true, user: regularUser });
    mockApiGet.mockResolvedValueOnce(regularUser);

    const { result } = renderHook(() => useAuth({ requireAdmin: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.accessDenied).toBe(true);
    expect(result.current.user).toEqual(regularUser);
  });

  it('grants access when requireAdmin and user is admin', async () => {
    const adminUser = makeUser({ is_admin: true, admin_role: 'super_admin' });
    mockGetSession.mockResolvedValueOnce({ authenticated: true, user: adminUser });
    mockApiGet.mockResolvedValueOnce(adminUser);

    const { result } = renderHook(() => useAuth({ requireAdmin: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.accessDenied).toBe(false);
    expect(result.current.user).toEqual(adminUser);
    expect(result.current.isAdmin).toBe(true);
  });

  it('hasPermission returns correct values for different roles', async () => {
    const studiesAdmin = makeUser({ is_admin: true, admin_role: 'admin_studies' });
    mockGetSession.mockResolvedValueOnce({ authenticated: true, user: studiesAdmin });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasPermission('studies')).toBe(true);
    expect(result.current.hasPermission('insights')).toBe(false);
    expect(result.current.hasPermission('reports')).toBe(false);
    expect(result.current.hasPermission('users')).toBe(false);
  });

  it('hasPermission returns false for non-admin users', async () => {
    const regularUser = makeUser({ is_admin: false });
    mockGetSession.mockResolvedValueOnce({ authenticated: true, user: regularUser });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasPermission('studies')).toBe(false);
  });

  it('logout clears session and redirects to /login', async () => {
    const user = makeUser();
    mockGetSession.mockResolvedValueOnce({ authenticated: true, user });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockClearSession).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
    expect(result.current.user).toBeNull();
  });

  it('does not redirect when optional is true and not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({ authenticated: false, user: null });

    const { result } = renderHook(() => useAuth({ optional: true }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});
