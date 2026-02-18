/**
 * AuthHub SDK Token Manager
 *
 * Manages token lifecycle including automatic refresh before expiration.
 * Integrates with FTR-065's token rotation feature.
 *
 * @module @authhub/sdk/auth/token-manager
 * @feature FTR-051
 */

import type { RefreshResult, TokenStorage, StoredTokenData } from './types';
import { AuthenticationError } from './types';
import { isTokenExpired, createStoredTokenData } from './storage';

// ============================================================================
// Constants
// ============================================================================

/** Default refresh threshold in seconds */
const DEFAULT_REFRESH_THRESHOLD = 60;

/** Minimum refresh threshold to prevent rapid refreshes */
const MIN_REFRESH_THRESHOLD = 10;

/** Maximum retry attempts for token refresh */
const MAX_REFRESH_RETRIES = 2;

/** Backoff delay between retry attempts in ms */
const RETRY_BACKOFF_MS = 1000;

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for the token manager.
 */
export interface TokenManagerConfig {
  /** AuthHub API base URL */
  baseUrl: string;
  /**
   * API key for protected operations.
   * Optional for redirect-mode authentication (refresh endpoint uses JWT only).
   * @task TASK-501
   * @feature FTR-110
   */
  apiKey?: string;
  /** Token storage implementation */
  storage: TokenStorage;
  /** Seconds before expiry to trigger refresh (default: 60) */
  refreshThreshold?: number;
  /** Callback when tokens are refreshed */
  onTokenRefresh?: (tokens: StoredTokenData) => void;
  /** Callback when session expires */
  onSessionExpired?: (error: AuthenticationError) => void;
  /** Callback when token reuse is detected (security breach) */
  onTokenReuseDetected?: () => void;
}

/**
 * Token refresh response from the API.
 */
interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * API error response.
 */
interface ApiError {
  error: string;
  error_code?: string;
  message?: string;
}

// ============================================================================
// Token Manager Class
// ============================================================================

/**
 * Manages token lifecycle with automatic refresh.
 *
 * @example
 * ```typescript
 * const manager = new TokenManager({
 *   baseUrl: 'https://authhub.example.com',
 *   apiKey: 'ak_xxxxx',
 *   storage: new LocalStorageTokenStorage(),
 *   refreshThreshold: 60, // Refresh 60 seconds before expiry
 *   onSessionExpired: () => {
 *     // Redirect to login
 *     window.location.href = '/login';
 *   },
 * });
 *
 * // Start auto-refresh when user logs in
 * manager.startAutoRefresh();
 *
 * // Get a valid token for API calls
 * const token = await manager.getValidToken();
 *
 * // Stop refresh on logout
 * manager.stopAutoRefresh();
 * ```
 */
export class TokenManager {
  private readonly config: TokenManagerConfig;
  private readonly refreshThreshold: number;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<RefreshResult> | null = null;

  constructor(config: TokenManagerConfig) {
    this.config = config;
    this.refreshThreshold = Math.max(
      config.refreshThreshold ?? DEFAULT_REFRESH_THRESHOLD,
      MIN_REFRESH_THRESHOLD
    );
  }

  /**
   * Get a valid access token, refreshing if necessary.
   *
   * @returns Valid access token or null if not authenticated
   *
   * @example
   * ```typescript
   * const token = await manager.getValidToken();
   * if (token) {
   *   await fetch('/api/data', {
   *     headers: { 'Authorization': `Bearer ${token}` }
   *   });
   * }
   * ```
   */
  async getValidToken(): Promise<string | null> {
    const tokens = await this.config.storage.getTokens();

    if (!tokens) {
      return null;
    }

    // Check if token needs refresh
    if (isTokenExpired(tokens, this.refreshThreshold)) {
      const result = await this.refreshToken();
      if (result.success && result.accessToken) {
        return result.accessToken;
      }
      return null;
    }

    return tokens.accessToken;
  }

  /**
   * Refresh the current access token.
   *
   * Handles FTR-065's token rotation - stores the new refresh token
   * and detects token reuse attacks.
   *
   * @returns Refresh result
   */
  async refreshToken(): Promise<RefreshResult> {
    // Prevent concurrent refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Internal refresh implementation with retry logic.
   */
  private async doRefresh(): Promise<RefreshResult> {
    const tokens = await this.config.storage.getTokens();

    if (!tokens?.refreshToken) {
      const error = new AuthenticationError(
        'No refresh token available',
        'SESSION_EXPIRED'
      );
      this.handleSessionExpired(error);
      return { success: false, error };
    }

    let lastError: AuthenticationError | null = null;

    for (let attempt = 0; attempt <= MAX_REFRESH_RETRIES; attempt++) {
      try {
        const response = await this.callRefreshEndpoint(tokens.refreshToken);

        // Store new tokens (FTR-065: new refresh token on each refresh)
        const tokenData = createStoredTokenData(
          response.access_token,
          response.expires_in,
          response.refresh_token
        );
        await this.config.storage.setTokens(tokenData);

        // Notify callback
        this.config.onTokenRefresh?.(tokenData);

        // Reschedule auto-refresh
        this.scheduleRefresh(tokenData);

        const result: RefreshResult = {
          success: true,
          accessToken: response.access_token,
          expiresAt: new Date(tokenData.expiresAt),
        };

        if (response.refresh_token) {
          result.refreshToken = response.refresh_token;
        }

        return result;
      } catch (error) {
        if (error instanceof AuthenticationError) {
          // FTR-065: Handle token reuse detection
          if (error.code === 'TOKEN_REUSE_DETECTED') {
            this.config.onTokenReuseDetected?.();
            await this.config.storage.clearTokens();
            this.stopAutoRefresh();

            const securityError = new AuthenticationError(
              'Security breach detected. Please log in again.',
              'TOKEN_REUSE_DETECTED',
              error.statusCode
            );
            this.handleSessionExpired(securityError);
            return { success: false, error: securityError };
          }

          // Non-retryable errors
          if (!error.isRetryable) {
            this.handleSessionExpired(error);
            return { success: false, error };
          }

          lastError = error;
        } else {
          lastError = new AuthenticationError(
            error instanceof Error ? error.message : 'Token refresh failed',
            'NETWORK_ERROR'
          );
        }

        // Wait before retry
        if (attempt < MAX_REFRESH_RETRIES) {
          await this.delay(RETRY_BACKOFF_MS * (attempt + 1));
        }
      }
    }

    // All retries exhausted
    const error = lastError ?? new AuthenticationError(
      'Token refresh failed after retries',
      'SERVER_ERROR'
    );
    this.handleSessionExpired(error);
    return { success: false, error };
  }

  /**
   * Call the token refresh endpoint.
   * X-API-Key is optional for auth endpoints (TASK-501).
   */
  private async callRefreshEndpoint(refreshToken: string): Promise<TokenRefreshResponse> {
    // Build headers - X-API-Key is optional for auth endpoints
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as ApiError;
      const code = this.mapErrorCode(errorBody.error_code ?? errorBody.error ?? '');

      throw new AuthenticationError(
        errorBody.message ?? errorBody.error ?? 'Token refresh failed',
        code,
        response.status
      );
    }

    return response.json() as Promise<TokenRefreshResponse>;
  }

  /**
   * Start automatic token refresh.
   *
   * Call this after successful login or on app initialization.
   */
  async startAutoRefresh(): Promise<void> {
    const tokens = await this.config.storage.getTokens();
    if (tokens) {
      this.scheduleRefresh(tokens);
    }
  }

  /**
   * Stop automatic token refresh.
   *
   * Call this on logout or when the user leaves.
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Schedule the next token refresh.
   */
  private scheduleRefresh(tokens: StoredTokenData): void {
    this.stopAutoRefresh();

    const expiresIn = tokens.expiresAt - Date.now();
    const refreshIn = Math.max(
      expiresIn - this.refreshThreshold * 1000,
      1000 // Minimum 1 second
    );

    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, refreshIn);
  }

  /**
   * Handle session expiration.
   */
  private handleSessionExpired(error: AuthenticationError): void {
    this.stopAutoRefresh();
    this.config.onSessionExpired?.(error);
  }

  /**
   * Map error code string to AuthErrorCode.
   */
  private mapErrorCode(code: string): import('./types').AuthErrorCode {
    const codeMap: Record<string, import('./types').AuthErrorCode> = {
      'token_expired': 'TOKEN_EXPIRED',
      'token_invalid': 'TOKEN_INVALID',
      'token_reuse_detected': 'TOKEN_REUSE_DETECTED',
      'session_expired': 'SESSION_EXPIRED',
      'max_sessions_exceeded': 'MAX_SESSIONS_EXCEEDED',
    };

    return codeMap[code.toLowerCase()] ?? 'UNKNOWN_ERROR';
  }

  /**
   * Delay helper.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// JWT Utilities
// ============================================================================

/**
 * Decode a JWT payload without verification.
 *
 * Note: This does NOT verify the signature. For validation,
 * the server must be trusted.
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    if (!payload) {
      return null;
    }

    // Base64url decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

    let jsonString: string;
    if (typeof atob !== 'undefined') {
      jsonString = atob(padded);
    } else if (typeof Buffer !== 'undefined') {
      jsonString = Buffer.from(padded, 'base64').toString('utf-8');
    } else {
      return null;
    }

    return JSON.parse(jsonString) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Get the expiration timestamp from a JWT.
 *
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if invalid
 */
export function getJwtExpiration(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const exp = payload['exp'];
  if (typeof exp !== 'number') {
    return null;
  }

  // JWT exp is in seconds, convert to milliseconds
  return exp * 1000;
}

/**
 * Check if a JWT is expired.
 *
 * @param token - JWT token string
 * @param thresholdSeconds - Consider expired if within this many seconds
 * @returns True if expired or invalid
 */
export function isJwtExpired(token: string, thresholdSeconds: number = 0): boolean {
  const exp = getJwtExpiration(token);
  if (exp === null) {
    return true; // Treat invalid tokens as expired
  }

  return Date.now() + thresholdSeconds * 1000 >= exp;
}
