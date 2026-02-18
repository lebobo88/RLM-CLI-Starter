/**
 * AuthHub SDK Token Storage Implementations
 *
 * Provides storage strategies for persisting authentication tokens.
 *
 * @module @authhub/sdk/auth/storage
 * @feature FTR-051
 */

import type { TokenStorage, StoredTokenData } from './types';

// ============================================================================
// Constants
// ============================================================================

/** Default storage key prefix */
const DEFAULT_KEY_PREFIX = 'authhub_';

/** Storage key suffix for token data */
const TOKENS_KEY = 'tokens';

// ============================================================================
// Base Storage Class
// ============================================================================

/**
 * Base class for browser storage implementations.
 * Provides common functionality for localStorage and sessionStorage.
 *
 * @internal
 */
abstract class BrowserTokenStorage implements TokenStorage {
  protected readonly keyPrefix: string;
  protected abstract readonly storage: Storage | null;

  constructor(keyPrefix: string = DEFAULT_KEY_PREFIX) {
    this.keyPrefix = keyPrefix;
  }

  /**
   * Get the full storage key for tokens.
   */
  protected get storageKey(): string {
    return `${this.keyPrefix}${TOKENS_KEY}`;
  }

  /**
   * Check if storage is available.
   */
  protected isStorageAvailable(): boolean {
    if (!this.storage) {
      return false;
    }

    try {
      const testKey = `${this.keyPrefix}test`;
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve stored tokens.
   * Returns null if tokens don't exist, are expired, or storage is unavailable.
   */
  getTokens(): StoredTokenData | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const stored = this.storage!.getItem(this.storageKey);
      if (!stored) {
        return null;
      }

      const data = JSON.parse(stored) as StoredTokenData;

      // Check if token is expired
      if (this.isExpired(data.expiresAt)) {
        this.clearTokens();
        return null;
      }

      return data;
    } catch {
      // Invalid JSON or other error - clear corrupted data
      this.clearTokens();
      return null;
    }
  }

  /**
   * Store token data.
   *
   * @param tokens - Token data to store
   * @throws {Error} If storage quota is exceeded
   */
  setTokens(tokens: StoredTokenData): void {
    if (!this.isStorageAvailable()) {
      console.warn('AuthHub: Storage not available, tokens will not persist');
      return;
    }

    try {
      const serialized = JSON.stringify(tokens);
      this.storage!.setItem(this.storageKey, serialized);
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please clear some data and try again.');
      }
      throw error;
    }
  }

  /**
   * Clear all stored tokens.
   */
  clearTokens(): void {
    if (!this.isStorageAvailable()) {
      return;
    }

    try {
      this.storage!.removeItem(this.storageKey);
    } catch {
      // Ignore errors when clearing
    }
  }

  /**
   * Check if a timestamp is expired.
   *
   * @param expiresAt - Expiration timestamp in milliseconds
   * @returns True if expired
   */
  protected isExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }
}

// ============================================================================
// LocalStorage Implementation
// ============================================================================

/**
 * Token storage using browser localStorage.
 *
 * Tokens persist across browser sessions until explicitly cleared
 * or until they expire.
 *
 * **Security Note:** localStorage is accessible to any JavaScript running
 * on the same origin. For high-security applications, consider using
 * sessionStorage or memory storage.
 *
 * @example
 * ```typescript
 * const storage = new LocalStorageTokenStorage('myapp_');
 *
 * // Store tokens
 * storage.setTokens({
 *   accessToken: 'eyJ...',
 *   refreshToken: 'dGhp...',
 *   expiresAt: Date.now() + 3600000,
 *   tokenType: 'Bearer',
 * });
 *
 * // Retrieve tokens
 * const tokens = storage.getTokens();
 * if (tokens) {
 *   console.log('Access token:', tokens.accessToken);
 * }
 *
 * // Clear tokens on logout
 * storage.clearTokens();
 * ```
 */
export class LocalStorageTokenStorage extends BrowserTokenStorage {
  protected readonly storage: Storage | null;

  /**
   * Create a new localStorage token storage.
   *
   * @param keyPrefix - Prefix for storage keys (default: 'authhub_')
   */
  constructor(keyPrefix: string = DEFAULT_KEY_PREFIX) {
    super(keyPrefix);
    this.storage = typeof window !== 'undefined' ? window.localStorage : null;
  }
}

// ============================================================================
// SessionStorage Implementation
// ============================================================================

/**
 * Token storage using browser sessionStorage.
 *
 * Tokens persist only within the current browser tab/window session.
 * When the tab is closed, tokens are automatically cleared.
 *
 * **Security Note:** sessionStorage provides better security than localStorage
 * as tokens don't persist across sessions. However, it's still accessible
 * to JavaScript on the same origin.
 *
 * @example
 * ```typescript
 * const storage = new SessionStorageTokenStorage();
 *
 * // Store tokens - cleared when tab closes
 * storage.setTokens({
 *   accessToken: 'eyJ...',
 *   expiresAt: Date.now() + 3600000,
 *   tokenType: 'Bearer',
 * });
 * ```
 */
export class SessionStorageTokenStorage extends BrowserTokenStorage {
  protected readonly storage: Storage | null;

  /**
   * Create a new sessionStorage token storage.
   *
   * @param keyPrefix - Prefix for storage keys (default: 'authhub_')
   */
  constructor(keyPrefix: string = DEFAULT_KEY_PREFIX) {
    super(keyPrefix);
    this.storage = typeof window !== 'undefined' ? window.sessionStorage : null;
  }
}

// ============================================================================
// Memory Storage Implementation
// ============================================================================

/**
 * Token storage in memory only.
 *
 * Tokens are stored in a JavaScript variable and cleared when the page
 * is refreshed or the tab is closed. This provides the highest security
 * but requires re-authentication on every page load.
 *
 * **Use Cases:**
 * - High-security applications where persistence is not acceptable
 * - Server-side rendering (SSR) environments
 * - Testing and development
 *
 * @example
 * ```typescript
 * const storage = new MemoryTokenStorage();
 *
 * // Store tokens - cleared on page refresh
 * storage.setTokens({
 *   accessToken: 'eyJ...',
 *   expiresAt: Date.now() + 3600000,
 *   tokenType: 'Bearer',
 * });
 *
 * // Later, check if still authenticated
 * const tokens = storage.getTokens();
 * if (!tokens) {
 *   // Re-authenticate user
 * }
 * ```
 */
export class MemoryTokenStorage implements TokenStorage {
  private tokens: StoredTokenData | null = null;

  /**
   * Retrieve stored tokens.
   * Returns null if tokens don't exist or are expired.
   */
  getTokens(): StoredTokenData | null {
    if (!this.tokens) {
      return null;
    }

    // Check if token is expired
    if (Date.now() >= this.tokens.expiresAt) {
      this.clearTokens();
      return null;
    }

    return this.tokens;
  }

  /**
   * Store token data in memory.
   *
   * @param tokens - Token data to store
   */
  setTokens(tokens: StoredTokenData): void {
    this.tokens = { ...tokens };
  }

  /**
   * Clear stored tokens from memory.
   */
  clearTokens(): void {
    this.tokens = null;
  }
}

// ============================================================================
// Cookie Token Storage Implementation
// ============================================================================

/**
 * Cookie-based token storage.
 *
 * Tokens are managed server-side via httpOnly cookies. This class tracks
 * authentication state locally but delegates actual token storage to
 * server-set httpOnly cookies, providing XSS protection.
 *
 * **Security Benefits:**
 * - Tokens are inaccessible to JavaScript (XSS protection)
 * - Browser automatically includes cookies in requests
 * - Server controls token lifecycle
 *
 * @example
 * ```typescript
 * const storage = new CookieTokenStorage();
 *
 * // After server sets cookies, update local state
 * storage.setTokens({
 *   accessToken: '', // Actual token is in httpOnly cookie
 *   expiresAt: Date.now() + 900000, // 15 minutes
 *   tokenType: 'Bearer',
 * });
 *
 * // Check authentication state (for UI purposes)
 * if (storage.isAuthenticated()) {
 *   console.log('User is authenticated');
 * }
 *
 * // Clear local state (server handles cookie clearing)
 * storage.clearTokens();
 * ```
 *
 * @task TASK-500
 * @feature FTR-109
 */
export class CookieTokenStorage implements TokenStorage {
  private _isAuthenticated: boolean = false;
  private _expiresAt: number | null = null;

  /**
   * Get tokens - returns metadata only since actual tokens are in httpOnly cookies.
   * Auth state is determined by server response, not local storage.
   *
   * @returns Token data with empty accessToken (actual token in cookie) or null if not authenticated/expired
   */
  getTokens(): StoredTokenData | null {
    // Cannot read httpOnly cookies from JS - this is by design
    // Return cached state for UI purposes only
    if (this._isAuthenticated && this._expiresAt && Date.now() < this._expiresAt) {
      return {
        accessToken: '', // Placeholder - actual token in cookie
        expiresAt: this._expiresAt,
        tokenType: 'Bearer',
      };
    }
    return null;
  }

  /**
   * Set tokens - only caches metadata, actual tokens are in httpOnly cookies.
   * Call this after the server has set the httpOnly cookies.
   *
   * @param tokens - Token metadata (accessToken value is ignored, stored in cookie)
   */
  setTokens(tokens: StoredTokenData): void {
    this._isAuthenticated = true;
    this._expiresAt = tokens.expiresAt;
  }

  /**
   * Clear tokens - clears local authentication state.
   * Note: Actual cookie clearing must be done by the server via Set-Cookie with maxAge=0.
   */
  clearTokens(): void {
    this._isAuthenticated = false;
    this._expiresAt = null;
  }

  /**
   * Check if user is authenticated based on cached state.
   * Note: For true authentication status, check with the server.
   *
   * @returns True if authenticated and not expired
   */
  isAuthenticated(): boolean {
    if (!this._isAuthenticated || !this._expiresAt) {
      return false;
    }
    // Check if token is expired
    if (Date.now() >= this._expiresAt) {
      this._isAuthenticated = false;
      this._expiresAt = null;
      return false;
    }
    return true;
  }

  /**
   * Check if this storage uses cookie mode.
   * Useful for determining request configuration (credentials: 'include').
   *
   * @returns Always true for CookieTokenStorage
   */
  isCookieMode(): boolean {
    return true;
  }
}

// ============================================================================
// Storage Factory
// ============================================================================

/**
 * Storage type for the factory function.
 */
export type StorageStrategyType = 'localStorage' | 'sessionStorage' | 'memory' | 'cookie';

/**
 * Create a token storage instance based on the specified type.
 *
 * @param type - Storage type to create
 * @param keyPrefix - Optional key prefix for browser storage
 * @returns TokenStorage instance
 *
 * @example
 * ```typescript
 * // Create localStorage storage
 * const storage = createTokenStorage('localStorage');
 *
 * // Create sessionStorage with custom prefix
 * const storage = createTokenStorage('sessionStorage', 'myapp_');
 *
 * // Create memory storage
 * const storage = createTokenStorage('memory');
 * ```
 */
export function createTokenStorage(
  type: StorageStrategyType,
  keyPrefix: string = DEFAULT_KEY_PREFIX
): TokenStorage {
  switch (type) {
    case 'localStorage':
      return new LocalStorageTokenStorage(keyPrefix);
    case 'sessionStorage':
      return new SessionStorageTokenStorage(keyPrefix);
    case 'memory':
      return new MemoryTokenStorage();
    case 'cookie':
      return new CookieTokenStorage();
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
}

// ============================================================================
// Storage Utilities
// ============================================================================

/**
 * Check if the token data is expired or about to expire.
 *
 * @param tokens - Token data to check
 * @param thresholdSeconds - Consider expired if within this many seconds
 * @returns True if expired or expiring within threshold
 *
 * @example
 * ```typescript
 * const tokens = storage.getTokens();
 * if (tokens && isTokenExpired(tokens, 60)) {
 *   // Token expires within 60 seconds, refresh it
 *   await refreshToken();
 * }
 * ```
 */
export function isTokenExpired(
  tokens: StoredTokenData,
  thresholdSeconds: number = 0
): boolean {
  const thresholdMs = thresholdSeconds * 1000;
  return Date.now() + thresholdMs >= tokens.expiresAt;
}

/**
 * Calculate the time remaining until token expiration.
 *
 * @param tokens - Token data to check
 * @returns Milliseconds until expiration (negative if expired)
 *
 * @example
 * ```typescript
 * const tokens = storage.getTokens();
 * if (tokens) {
 *   const remaining = getTokenExpiresIn(tokens);
 *   console.log(`Token expires in ${Math.floor(remaining / 1000)} seconds`);
 * }
 * ```
 */
export function getTokenExpiresIn(tokens: StoredTokenData): number {
  return tokens.expiresAt - Date.now();
}

/**
 * Create a StoredTokenData object from a token response.
 *
 * @param accessToken - Access token string
 * @param expiresIn - Token validity in seconds
 * @param refreshToken - Optional refresh token
 * @param tokenType - Token type (default: 'Bearer')
 * @returns StoredTokenData object ready for storage
 *
 * @example
 * ```typescript
 * // From API response
 * const response = await api.post('/auth/token', { ... });
 * const tokenData = createStoredTokenData(
 *   response.access_token,
 *   response.expires_in,
 *   response.refresh_token
 * );
 * storage.setTokens(tokenData);
 * ```
 */
export function createStoredTokenData(
  accessToken: string,
  expiresIn: number,
  refreshToken?: string,
  tokenType: string = 'Bearer'
): StoredTokenData {
  const data: StoredTokenData = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
    tokenType,
  };

  // Only include refreshToken if provided
  if (refreshToken !== undefined) {
    data.refreshToken = refreshToken;
  }

  return data;
}
