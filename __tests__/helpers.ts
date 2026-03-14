// =============================================================================
// Afrikalytics Dashboard — Shared Test Helpers
// =============================================================================
// Utility factories used across all test suites.
// Import what you need — nothing is auto-applied on import.
// =============================================================================

import React from "react";

// -----------------------------------------------------------------------------
// Router mock
// -----------------------------------------------------------------------------

/**
 * Returns a fresh mockPush jest.fn() and configures the jest.mock for
 * next/navigation. Must be called at the module level (before describe blocks).
 *
 * Usage:
 *   const mockPush = mockRouter();
 *   jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
 *
 * Because jest.mock is hoisted, prefer calling the factory inline:
 *   jest.mock('next/navigation', mockRouter);
 */
export function createRouterMock() {
  const mockPush = jest.fn();
  return {
    mockPush,
    factory: () => ({
      useRouter: () => ({ push: mockPush }),
      useSearchParams: () => ({ get: jest.fn() }),
    }),
  };
}

// -----------------------------------------------------------------------------
// Fetch mock
// -----------------------------------------------------------------------------

/**
 * Configures global.fetch with a sequence of mock responses.
 * Each call to fetch consumes the next response in the array.
 *
 * @param responses - Array of { status, data } objects.
 *   status >= 200 && < 300  => response.ok === true
 *   otherwise               => response.ok === false
 */
export function mockFetch(
  responses: Array<{ status: number; data: unknown }>
): jest.Mock {
  const mock = jest.fn();
  responses.forEach(({ status, data }) => {
    mock.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
    });
  });
  global.fetch = mock;
  return mock;
}

// -----------------------------------------------------------------------------
// localStorage mock
// -----------------------------------------------------------------------------

/**
 * Installs an in-memory localStorage mock on window and optionally pre-fills it.
 * Returns the mock object so tests can assert on setItem / getItem calls.
 *
 * Call this once at module level; reset via localStorageMock.clear() in beforeEach.
 */
export function mockLocalStorage(
  initial: { token?: string; user?: object } = {}
) {
  let store: Record<string, string> = {};

  // Pre-fill
  if (initial.token) store["token"] = initial.token;
  if (initial.user) store["user"] = JSON.stringify(initial.user);

  const mock = {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    /** Direct write helper (bypasses jest.fn tracking) */
    _set: (key: string, value: string) => {
      store[key] = value;
    },
    /** Direct read helper (bypasses jest.fn tracking) */
    _get: (key: string) => store[key] ?? null,
  };

  Object.defineProperty(window, "localStorage", {
    value: mock,
    writable: true,
  });

  return mock;
}

// -----------------------------------------------------------------------------
// sessionStorage mock
// -----------------------------------------------------------------------------

/**
 * Installs an in-memory sessionStorage mock on window and optionally pre-fills it.
 */
export function mockSessionStorage(initial: Record<string, string> = {}) {
  let store: Record<string, string> = { ...initial };

  const mock = {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _set: (key: string, value: string) => {
      store[key] = value;
    },
    _get: (key: string) => store[key] ?? null,
  };

  Object.defineProperty(window, "sessionStorage", {
    value: mock,
    writable: true,
  });

  return mock;
}

// -----------------------------------------------------------------------------
// Lucide-react icons mock
// -----------------------------------------------------------------------------

/**
 * Returns a Jest module factory that replaces every lucide-react icon with a
 * simple <span data-testid="icon-{name}" /> element.
 *
 * Usage:
 *   jest.mock('lucide-react', mockLucideIcons(['Mail', 'Lock', 'Eye']));
 */
export function mockLucideIcons(iconNames: string[]) {
  return () => {
    const mocks: Record<string, unknown> = {};
    iconNames.forEach((name) => {
      mocks[name] = (props: Record<string, unknown>) =>
        React.createElement("span", {
          "data-testid": `icon-${name.toLowerCase()}`,
          ...props,
        });
    });
    return mocks;
  };
}

// -----------------------------------------------------------------------------
// Authenticated user fixture
// -----------------------------------------------------------------------------

/** Returns a fully-formed User object for use in tests. */
export function makeUser(overrides: Partial<{
  id: number;
  email: string;
  full_name: string;
  plan: "basic" | "professionnel" | "entreprise";
  is_active: boolean;
  is_admin: boolean;
  admin_role: string | null;
  parent_user_id: number | null;
  is_verified: boolean;
  created_at: string;
}> = {}) {
  return {
    id: 1,
    email: "user@example.com",
    full_name: "Jean Dupont",
    plan: "basic" as const,
    is_active: true,
    is_admin: false,
    admin_role: null,
    parent_user_id: null,
    is_verified: true,
    created_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}
