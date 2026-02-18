/**
 * AuthHub Client Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthHubClient } from './client';

describe('AuthHubClient', () => {
  describe('constructor', () => {
    it('should create client with valid config', () => {
      const client = new AuthHubClient({
        baseUrl: 'https://api.example.com',
        apiKey: 'ak_test_key',
      });

      expect(client.baseUrl).toBe('https://api.example.com');
      expect(client.timeout).toBe(30000);
      expect(client.retries).toBe(3);
    });

    it('should remove trailing slash from baseUrl', () => {
      const client = new AuthHubClient({
        baseUrl: 'https://api.example.com/',
        apiKey: 'ak_test_key',
      });

      expect(client.baseUrl).toBe('https://api.example.com');
    });

    it('should use custom timeout when provided', () => {
      const client = new AuthHubClient({
        baseUrl: 'https://api.example.com',
        apiKey: 'ak_test_key',
        timeout: 60000,
      });

      expect(client.timeout).toBe(60000);
    });

    it('should use custom retries when provided', () => {
      const client = new AuthHubClient({
        baseUrl: 'https://api.example.com',
        apiKey: 'ak_test_key',
        retries: 5,
      });

      expect(client.retries).toBe(5);
    });

    it('should throw error when baseUrl is missing', () => {
      expect(() => {
        new AuthHubClient({
          baseUrl: '',
          apiKey: 'ak_test_key',
        });
      }).toThrow('AuthHubClient: baseUrl is required');
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => {
        new AuthHubClient({
          baseUrl: 'https://api.example.com',
          apiKey: '',
        });
      }).toThrow('AuthHubClient: apiKey is required');
    });
  });

  describe('HTTP request handling', () => {
    let client: AuthHubClient;
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      client = new AuthHubClient({
        baseUrl: 'https://api.example.com',
        apiKey: 'ak_test_key',
        retries: 1, // Reduce retries for faster tests
      });

      fetchSpy = vi.spyOn(global, 'fetch');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should set correct headers on requests', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'test' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      // Access protected method via any cast for testing
      await (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test');

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'X-API-Key': 'ak_test_key',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
      );
    });

    it('should include body in POST requests', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const body = { message: 'hello' };
      await (client as unknown as { post: (path: string, body: unknown) => Promise<unknown> }).post('/test', body);

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });

    it('should handle query parameters', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'test' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await (client as unknown as { get: (path: string, params?: Record<string, string | number | boolean | undefined>) => Promise<unknown> })
        .get('/test', { page: 1, limit: 10, active: true });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('active=true'),
        expect.any(Object)
      );
    });

    it('should skip undefined query parameters', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: 'test' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await (client as unknown as { get: (path: string, params?: Record<string, string | number | boolean | undefined>) => Promise<unknown> })
        .get('/test', { page: 1, limit: undefined });

      const calledUrl = fetchSpy.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).not.toContain('limit');
    });

    it('should throw error on 400 response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { code: 'BAD_REQUEST', message: 'Invalid request' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test')
      ).rejects.toThrow('Invalid request');
    });

    it('should throw error on 401 response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test')
      ).rejects.toThrow('Invalid API key');
    });

    it('should return empty object for 204 No Content', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      const result = await (client as unknown as { delete: (path: string) => Promise<unknown> }).delete('/test');
      expect(result).toEqual({});
    });

    it('should parse JSON response correctly', async () => {
      const responseData = { id: 1, name: 'Test', items: ['a', 'b'] };
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test');
      expect(result).toEqual(responseData);
    });
  });

  describe('retry behavior', () => {
    let client: AuthHubClient;
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      client = new AuthHubClient({
        baseUrl: 'https://api.example.com',
        apiKey: 'ak_test_key',
        retries: 3,
        timeout: 1000,
      });

      fetchSpy = vi.spyOn(global, 'fetch');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should retry on 500 server error', async () => {
      fetchSpy
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ error: { message: 'Server error' } }),
            { status: 500 }
          )
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true }), { status: 200 })
        );

      const result = await (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test');
      expect(result).toEqual({ success: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should retry on 429 rate limit', async () => {
      fetchSpy
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({ error: { message: 'Rate limited' } }),
            { status: 429 }
          )
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ success: true }), { status: 200 })
        );

      const result = await (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test');
      expect(result).toEqual({ success: true });
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 400 client error', async () => {
      fetchSpy.mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'Bad request' } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test')
      ).rejects.toThrow(); // Just verify it throws, message parsing depends on Response mock
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      fetchSpy.mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'Server error' } }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        (client as unknown as { get: (path: string) => Promise<unknown> }).get('/test')
      ).rejects.toThrow(); // Throws after exhausting retries
      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });
  });
});
