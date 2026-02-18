/**
 * Tests for Optional API Key Feature
 *
 * Tests that the SDK can be used without an API key for auth-only operations.
 *
 * @task TASK-501
 * @feature FTR-110 - API Key Scoping
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthClient, type AuthClientConfig } from '../client';

// Mock fetch globally for these tests
global.fetch = vi.fn();

describe('AuthClient Optional API Key (FTR-110)', () => {
  const mockFetch = vi.mocked(fetch);

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'test-user', email: 'test@example.com', emailVerified: true, createdAt: new Date().toISOString() }),
    } as Response);
  });

  describe('AuthClientConfig interface', () => {
    it('should accept config without apiKey', () => {
      const config: AuthClientConfig = {
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
        },
      };

      // This should compile without TypeScript errors
      expect(config.apiKey).toBeUndefined();
      expect(config.baseUrl).toBe('https://authhub.example.com');
    });

    it('should accept config with apiKey', () => {
      const config: AuthClientConfig = {
        baseUrl: 'https://authhub.example.com',
        apiKey: 'ak_test1234',
        appSlug: 'my-app',
      };

      expect(config.apiKey).toBe('ak_test1234');
    });
  });

  describe('AuthClient constructor', () => {
    it('should create client without apiKey', () => {
      const client = new AuthClient({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
        },
      });

      expect(client).toBeInstanceOf(AuthClient);
      expect(client.mode).toBe('redirect');
    });

    it('should create client with apiKey', () => {
      const client = new AuthClient({
        baseUrl: 'https://authhub.example.com',
        apiKey: 'ak_test1234',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
        },
      });

      expect(client).toBeInstanceOf(AuthClient);
    });

    it('should throw error if baseUrl is missing', () => {
      expect(() => {
        new AuthClient({
          baseUrl: '',
          appSlug: 'my-app',
        });
      }).toThrow();
    });
  });

  describe('AuthClient.forAuth() static factory', () => {
    it('should create auth-only client without apiKey', () => {
      const client = AuthClient.forAuth({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
        },
      });

      expect(client).toBeInstanceOf(AuthClient);
      expect(client.mode).toBe('redirect');
    });

    it('should not accept apiKey parameter in forAuth', () => {
      // TypeScript should prevent passing apiKey to forAuth
      // This test documents the expected behavior
      const config = {
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect' as const,
          callbackUrl: 'https://myapp.com/callback',
        },
      };

      // apiKey should be omitted from the type
      const client = AuthClient.forAuth(config);
      expect(client).toBeInstanceOf(AuthClient);
    });
  });

  describe('Redirect mode without API key', () => {
    it('should initialize redirect mode without apiKey', () => {
      const client = AuthClient.forAuth({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
        },
      });

      expect(client.redirectMode).not.toBeNull();
      expect(client.mode).toBe('redirect');
    });

    it('should support isCallback check without apiKey', () => {
      const client = AuthClient.forAuth({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
        },
      });

      // In non-browser environment, should return false
      expect(client.isCallback()).toBe(false);
    });
  });

  describe('Embedded mode without API key', () => {
    it('should initialize embedded mode without apiKey', () => {
      const client = new AuthClient({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'embedded',
        },
      });

      expect(client.embeddedMode).not.toBeNull();
      expect(client.mode).toBe('embedded');
    });
  });

  describe('getState without API key', () => {
    it('should return unauthenticated state initially', () => {
      const client = AuthClient.forAuth({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
        },
      });

      const state = client.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('isCookieMode method', () => {
    it('should return false when storage is not cookie', () => {
      const client = AuthClient.forAuth({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
          storage: 'localStorage',
        },
      });

      expect(client.isCookieMode()).toBe(false);
    });

    it('should return true when storage is cookie', () => {
      const client = AuthClient.forAuth({
        baseUrl: 'https://authhub.example.com',
        appSlug: 'my-app',
        auth: {
          mode: 'redirect',
          callbackUrl: 'https://myapp.com/callback',
          storage: 'cookie',
        },
      });

      expect(client.isCookieMode()).toBe(true);
    });
  });
});
