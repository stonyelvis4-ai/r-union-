import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/services/api';

describe('API client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('envoie la requête avec le bon base URL par défaut', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1' }),
    } as Response);

    await api('/meetings');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/api');
    expect(url).toContain('/meetings');
    expect((options?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('ajoute le token Authorization quand fourni', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await api('/meetings', { token: 'my-jwt-token' });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-jwt-token',
        }),
      })
    );
  });

  it('lance une erreur si la réponse n\'est pas ok', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    } as Response);

    await expect(api('/meetings')).rejects.toThrow();
  });
});
