/**
 * Tests du module API mobile
 */
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockFetch = jest.fn();

describe('API mobile', () => {
  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('getApiBase retourne l’URL de base', () => {
    const { getApiBase } = require('@/services/api');
    expect(getApiBase()).toContain('localhost');
    expect(getApiBase()).toContain('/api');
  });

  it('api envoie la requête avec le bon path', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '1' }),
    });

    const { api } = require('@/services/api');
    await api('/meetings');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('/meetings');
  });

  it('api ajoute le token Authorization quand fourni', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const { api } = require('@/services/api');
    await api('/meetings', { token: 'abc123' });

    const options = mockFetch.mock.calls[0][1];
    expect(options.headers).toHaveProperty('Authorization', 'Bearer abc123');
  });
});
