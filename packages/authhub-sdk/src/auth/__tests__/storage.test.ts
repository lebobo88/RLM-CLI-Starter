/**
 * Tests for Token Storage Classes
 *
 * Task: TASK-500
 * Feature: FTR-109 - SDK Cookie Mode Support
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CookieTokenStorage,
  createTokenStorage,
  MemoryTokenStorage,
  LocalStorageTokenStorage,
  SessionStorageTokenStorage,
} from '../storage';
import type { StoredTokenData } from '../types';

describe('CookieTokenStorage', () => {
  let storage: CookieTokenStorage;

  beforeEach(() => {
    storage = new CookieTokenStorage();
  });

  describe('getTokens', () => {
    it('should return null when not authenticated', () => {
      const tokens = storage.getTokens();
      expect(tokens).toBeNull();
    });

    it('should return cached state after setTokens is called', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() + 3600000, // 1 hour from now
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      const tokens = storage.getTokens();

      expect(tokens).not.toBeNull();
      expect(tokens?.tokenType).toBe('Bearer');
      expect(tokens?.expiresAt).toBe(tokenData.expiresAt);
    });

    it('should return empty accessToken since actual token is in httpOnly cookie', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'actual-token-ignored',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      const tokens = storage.getTokens();

      // Access token should be empty placeholder - actual token is in cookie
      expect(tokens?.accessToken).toBe('');
    });

    it('should return null when token is expired', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() - 1000, // 1 second in the past (expired)
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      const tokens = storage.getTokens();

      expect(tokens).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('should track authentication state', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
      };

      expect(storage.getTokens()).toBeNull();
      storage.setTokens(tokenData);
      expect(storage.getTokens()).not.toBeNull();
    });

    it('should cache expiresAt for UI purposes', () => {
      const expiresAt = Date.now() + 3600000;
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt,
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      expect(storage.getTokens()?.expiresAt).toBe(expiresAt);
    });
  });

  describe('clearTokens', () => {
    it('should clear authentication state', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      expect(storage.getTokens()).not.toBeNull();

      storage.clearTokens();
      expect(storage.getTokens()).toBeNull();
    });

    it('should be safe to call when not authenticated', () => {
      // Should not throw
      expect(() => storage.clearTokens()).not.toThrow();
      expect(storage.getTokens()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false initially', () => {
      expect(storage.isAuthenticated()).toBe(false);
    });

    it('should return true after setTokens', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      expect(storage.isAuthenticated()).toBe(true);
    });

    it('should return false after clearTokens', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      storage.clearTokens();
      expect(storage.isAuthenticated()).toBe(false);
    });

    it('should return false when token is expired', () => {
      const tokenData: StoredTokenData = {
        accessToken: 'test-token',
        expiresAt: Date.now() - 1000, // expired
        tokenType: 'Bearer',
      };

      storage.setTokens(tokenData);
      expect(storage.isAuthenticated()).toBe(false);
    });
  });

  describe('isCookieMode', () => {
    it('should always return true for CookieTokenStorage', () => {
      expect(storage.isCookieMode()).toBe(true);
    });
  });
});

describe('createTokenStorage factory', () => {
  it('should create CookieTokenStorage for "cookie" type', () => {
    const storage = createTokenStorage('cookie');
    expect(storage).toBeInstanceOf(CookieTokenStorage);
  });

  it('should create MemoryTokenStorage for "memory" type', () => {
    const storage = createTokenStorage('memory');
    expect(storage).toBeInstanceOf(MemoryTokenStorage);
  });

  it('should create LocalStorageTokenStorage for "localStorage" type', () => {
    const storage = createTokenStorage('localStorage');
    expect(storage).toBeInstanceOf(LocalStorageTokenStorage);
  });

  it('should create SessionStorageTokenStorage for "sessionStorage" type', () => {
    const storage = createTokenStorage('sessionStorage');
    expect(storage).toBeInstanceOf(SessionStorageTokenStorage);
  });

  it('should throw error for unknown storage type', () => {
    expect(() => createTokenStorage('unknown' as any)).toThrow('Unknown storage type: unknown');
  });
});

describe('StorageType union', () => {
  it('should accept cookie as a valid storage type', () => {
    // This test ensures TypeScript compilation with 'cookie' type
    const type: 'localStorage' | 'sessionStorage' | 'memory' | 'cookie' = 'cookie';
    const storage = createTokenStorage(type);
    expect(storage).toBeInstanceOf(CookieTokenStorage);
  });
});
