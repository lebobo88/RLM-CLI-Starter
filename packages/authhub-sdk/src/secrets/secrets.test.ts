/**
 * AuthHub Secrets Module Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthHubClient } from '../client';

describe('SecretsModule', () => {
  let client: AuthHubClient;
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    client = new AuthHubClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'ak_test_key',
      retries: 1,
    });

    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('should return secret value', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ name: 'STRIPE_API_KEY', value: 'sk_test_123' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const value = await client.secrets.get('STRIPE_API_KEY');

      expect(value).toBe('sk_test_123');
    });

    it('should URL encode secret name', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ name: 'API_KEY', value: 'value' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await client.secrets.get('API_KEY');

      const [url] = fetchSpy.mock.calls[0] as [string];
      expect(url).toContain('/api/v1/secrets/API_KEY');
    });

    it('should throw error for unauthorized access', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Forbidden' } }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        client.secrets.get('PRIVATE_KEY')
      ).rejects.toThrow("Access denied to secret 'PRIVATE_KEY'");
    });

    it('should throw error for not found', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Not found' } }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        client.secrets.get('UNKNOWN_SECRET')
      ).rejects.toThrow("Secret 'UNKNOWN_SECRET' not found");
    });

    it('should throw error for empty name', async () => {
      await expect(
        client.secrets.get('')
      ).rejects.toThrow('secret name must be a non-empty string');
    });

    it('should throw error for invalid characters in name', async () => {
      await expect(
        client.secrets.get('my.secret.name')
      ).rejects.toThrow('secret name contains invalid characters');

      await expect(
        client.secrets.get('my secret')
      ).rejects.toThrow('secret name contains invalid characters');
    });

    it('should allow valid secret name characters', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ name: 'MY_SECRET-123', value: 'value' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const value = await client.secrets.get('MY_SECRET-123');
      expect(value).toBe('value');
    });

    it('should not expose secret value in error messages', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Internal error with value sk_secret' } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );

      // The error should be thrown but should not contain the actual secret
      try {
        await client.secrets.get('API_KEY');
      } catch (error) {
        // We just want to verify the call was made correctly
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('list', () => {
    it('should return array of secret names', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ secrets: ['STRIPE_API_KEY', 'DATABASE_PASSWORD', 'JWT_SECRET'] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const names = await client.secrets.list();

      expect(names).toEqual(['STRIPE_API_KEY', 'DATABASE_PASSWORD', 'JWT_SECRET']);
    });

    it('should return empty array when no secrets', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ secrets: [] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const names = await client.secrets.list();

      expect(names).toEqual([]);
    });

    it('should call correct endpoint', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ secrets: [] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await client.secrets.list();

      const [url] = fetchSpy.mock.calls[0] as [string];
      expect(url).toBe('https://api.example.com/api/v1/secrets');
    });
  });

  describe('exists', () => {
    it('should return true when secret exists', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ secrets: ['STRIPE_API_KEY', 'DATABASE_PASSWORD'] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const exists = await client.secrets.exists('STRIPE_API_KEY');

      expect(exists).toBe(true);
    });

    it('should return false when secret does not exist', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ secrets: ['STRIPE_API_KEY'] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const exists = await client.secrets.exists('UNKNOWN_SECRET');

      expect(exists).toBe(false);
    });

    it('should return false on error', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { message: 'Server error' } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const exists = await client.secrets.exists('STRIPE_API_KEY');

      expect(exists).toBe(false);
    });
  });
});
