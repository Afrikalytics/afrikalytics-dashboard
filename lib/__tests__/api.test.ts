import { api, ApiRequestError, saveSession, clearSession, getSession } from '../api';
import { makeUser } from '@/__tests__/helpers';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock constants — provide API_URL and ROUTES
jest.mock('../constants', () => ({
  API_URL: 'https://api.example.com',
  ROUTES: { LOGIN: '/login' },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Suppress jsdom "Not implemented: navigation" errors from window.location.href assignment
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'object' && args[0] !== null
      ? String(args[0])
      : String(args[0] ?? '');
    if (msg.includes('Not implemented: navigation')) return;
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(status: number, data: unknown, contentType = 'application/json') {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (key: string) => (key === 'content-type' ? contentType : null),
    },
    json: async () => data,
  };
}

// ---------------------------------------------------------------------------
// Tests — ApiService (singleton `api`)
// ---------------------------------------------------------------------------

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // api.get()
  // -------------------------------------------------------------------------
  describe('get()', () => {
    it('sends a GET to /api/proxy/ + the path', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(200, { id: 1 }));

      const result = await api.get('/studies');

      expect(mockFetch).toHaveBeenCalledWith('/api/proxy/studies', {
        method: 'GET',
      });
      expect(result).toEqual({ id: 1 });
    });
  });

  // -------------------------------------------------------------------------
  // api.post()
  // -------------------------------------------------------------------------
  describe('post()', () => {
    it('sends a POST with JSON body through the proxy', async () => {
      const body = { title: 'Nouvelle étude' };
      mockFetch.mockResolvedValueOnce(jsonResponse(201, { id: 42 }));

      const result = await api.post('/studies', body);

      expect(mockFetch).toHaveBeenCalledWith('/api/proxy/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(result).toEqual({ id: 42 });
    });

    it('sends a POST without body when body is undefined', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

      await api.post('/action');

      expect(mockFetch).toHaveBeenCalledWith('/api/proxy/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });
  });

  // -------------------------------------------------------------------------
  // api.put()
  // -------------------------------------------------------------------------
  describe('put()', () => {
    it('sends a PUT with JSON body through the proxy', async () => {
      const body = { title: 'Updated' };
      mockFetch.mockResolvedValueOnce(jsonResponse(200, { id: 1, title: 'Updated' }));

      const result = await api.put('/studies/1', body);

      expect(mockFetch).toHaveBeenCalledWith('/api/proxy/studies/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      expect(result).toEqual({ id: 1, title: 'Updated' });
    });
  });

  // -------------------------------------------------------------------------
  // api.delete()
  // -------------------------------------------------------------------------
  describe('delete()', () => {
    it('sends a DELETE through the proxy', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(200, undefined, 'text/plain'));

      await api.delete('/studies/1');

      expect(mockFetch).toHaveBeenCalledWith('/api/proxy/studies/1', {
        method: 'DELETE',
      });
    });
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------
  describe('error handling', () => {
    it('throws on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(api.get('/fail')).rejects.toThrow('Network failure');
    });

    it('throws ApiRequestError with status 401 and calls clearSession', async () => {
      // 401 response + clearSession fetch call
      mockFetch
        .mockResolvedValueOnce(jsonResponse(401, { detail: 'Unauthorized' }))
        .mockResolvedValueOnce({ ok: true }); // clearSession DELETE call

      await expect(api.get('/protected')).rejects.toThrow(ApiRequestError);

      // First call: the GET, second call: clearSession (DELETE /api/auth/session)
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/proxy/protected', { method: 'GET' });
      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/auth/session', { method: 'DELETE' });
    });

    it('throws ApiRequestError with correct message on 401', async () => {
      mockFetch
        .mockResolvedValueOnce(jsonResponse(401, { detail: 'Unauthorized' }))
        .mockResolvedValueOnce({ ok: true });

      try {
        await api.get('/protected');
        fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiRequestError);
        expect((err as ApiRequestError).status).toBe(401);
        expect((err as ApiRequestError).detail).toBe('Session expiree. Veuillez vous reconnecter.');
      }
    });

    it('throws ApiRequestError with status 404', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(404, { detail: 'Etude non trouvée' })
      );

      try {
        await api.get('/studies/999');
        fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiRequestError);
        expect((err as ApiRequestError).status).toBe(404);
        expect((err as ApiRequestError).detail).toBe('Etude non trouvée');
      }
    });

    it('uses default error message when response has no detail', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(500, {})
      );

      try {
        await api.get('/error');
        fail('Should have thrown');
      } catch (err) {
        expect((err as ApiRequestError).detail).toBe('Erreur 500');
      }
    });
  });

  // -------------------------------------------------------------------------
  // api.postPublic()
  // -------------------------------------------------------------------------
  describe('postPublic()', () => {
    it('sends POST directly to API_URL (not through proxy)', async () => {
      const body = { email: 'a@b.com', password: 'secret' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'tok' }),
      });

      const result = await api.postPublic('/api/auth/login', body);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(body),
        })
      );
      expect(result).toEqual({ access_token: 'tok' });
    });

    it('throws ApiRequestError on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ detail: 'Validation error' }),
      });

      await expect(
        api.postPublic('/api/auth/register', { email: 'bad' })
      ).rejects.toThrow(ApiRequestError);
    });
  });
});

// ---------------------------------------------------------------------------
// Tests — Session helpers
// ---------------------------------------------------------------------------

describe('Session helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveSession()', () => {
    it('POSTs token and user to /api/auth/session', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const user = makeUser();

      await saveSession('jwt-token', user);

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'jwt-token', user }),
      });
    });
  });

  describe('clearSession()', () => {
    it('sends DELETE to /api/auth/session', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await clearSession();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'DELETE',
      });
    });
  });

  describe('getSession()', () => {
    it('sends GET to /api/auth/session and returns parsed JSON', async () => {
      const session = { authenticated: true, user: makeUser(), token: 'tok' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => session,
      });

      const result = await getSession();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session');
      expect(result).toEqual(session);
    });

    it('returns unauthenticated session when no cookie', async () => {
      const session = { authenticated: false, user: null, token: null };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => session,
      });

      const result = await getSession();

      expect(result.authenticated).toBe(false);
      expect(result.user).toBeNull();
    });
  });
});
