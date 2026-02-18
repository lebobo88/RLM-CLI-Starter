/**
 * AuthHub SDK OAuth Callback Handler
 *
 * Handles the OAuth callback after redirect-based authentication.
 * Exchanges authorization code for tokens.
 *
 * @module @authhub/sdk/auth/callback
 * @feature FTR-051
 */

import type {
  LoginResult,
  AuthUser,
  TokenStorage,
  TokenResponse,
  OAuthCallbackParams,
} from './types';
import { AuthenticationError } from './types';
import { retrievePKCEData, clearPKCEData } from './pkce';
import { createStoredTokenData } from './storage';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for callback handling.
 */
export interface CallbackConfig {
  /** AuthHub API base URL */
  baseUrl: string;
  /** Application slug or ID */
  appSlug: string;
  /** Token storage implementation */
  storage: TokenStorage;
  /** Callback URL registered with the app */
  callbackUrl: string;
  /**
   * API key for protected operations.
   * Optional for redirect-mode authentication (auth endpoints don't require it).
   * @task TASK-501
   * @feature FTR-110
   */
  apiKey?: string;
}

/**
 * Result of callback handling.
 */
export interface CallbackResult extends LoginResult {
  /** URL to redirect to after successful auth (from storePKCEData) */
  redirectTo?: string;
}

// ============================================================================
// Callback Handler Class
// ============================================================================

/**
 * Handles OAuth callbacks from redirect-based authentication.
 *
 * @example
 * ```typescript
 * const handler = new CallbackHandler({
 *   baseUrl: 'https://authhub.example.com',
 *   appSlug: 'my-app',
 *   callbackUrl: 'https://myapp.com/auth/callback',
 *   storage: new LocalStorageTokenStorage(),
 *   apiKey: 'ak_xxxxx',
 * });
 *
 * // On callback page
 * const result = await handler.handleCallback();
 * if (result.success) {
 *   console.log('Logged in as', result.user?.email);
 *   // Redirect to app
 *   window.location.href = result.redirectTo || '/dashboard';
 * }
 * ```
 */
export class CallbackHandler {
  private readonly config: CallbackConfig;

  constructor(config: CallbackConfig) {
    this.config = config;
  }

  /**
   * Handle the OAuth callback.
   *
   * This method:
   * 1. Parses the callback URL for code and state
   * 2. Validates the state parameter against stored value
   * 3. Exchanges the authorization code for tokens (with PKCE verifier)
   * 4. Stores the tokens
   * 5. Cleans up the URL and stored PKCE data
   *
   * @param url - Callback URL (defaults to current window.location)
   * @returns Promise resolving to callback result
   *
   * @example
   * ```typescript
   * // Handle callback with current URL
   * const result = await handler.handleCallback();
   *
   * // Handle callback with specific URL
   * const result = await handler.handleCallback('https://myapp.com/callback?code=xxx&state=yyy');
   * ```
   */
  async handleCallback(url?: string): Promise<CallbackResult> {
    try {
      // Parse callback parameters
      const params = this.parseCallbackUrl(url);

      // Check for error response
      if (params.error) {
        return this.createErrorResult(params.error, params.error_description);
      }

      // Validate required parameters
      if (!params.code) {
        return this.createErrorResult('missing_code', 'Authorization code not found in callback URL');
      }

      // Retrieve stored PKCE data
      const pkceData = retrievePKCEData();

      // Check for expired PKCE data (replay attack prevention)
      if (pkceData.isExpired) {
        return this.createErrorResult('state_expired', 'Authentication session expired. Please try logging in again.');
      }

      // Validate state parameter
      if (!pkceData.state) {
        return this.createErrorResult('missing_state', 'OAuth state not found. Session may have expired.');
      }

      if (params.state !== pkceData.state) {
        return this.createErrorResult('invalid_state', 'OAuth state mismatch. Possible CSRF attack.');
      }

      if (!pkceData.codeVerifier) {
        return this.createErrorResult('missing_verifier', 'PKCE code verifier not found. Session may have expired.');
      }

      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(
        params.code,
        pkceData.codeVerifier
      );

      // Store tokens
      const tokenData = createStoredTokenData(
        tokenResponse.access_token,
        tokenResponse.expires_in,
        tokenResponse.refresh_token
      );
      await this.config.storage.setTokens(tokenData);

      // Get user info from token (or fetch from API)
      const user = await this.getUserFromToken(tokenResponse.access_token);

      // Clean up
      clearPKCEData();
      this.cleanupUrl();

      const result: CallbackResult = {
        success: true,
        user,
        accessToken: tokenResponse.access_token,
        expiresAt: new Date(tokenData.expiresAt),
      };

      // Conditionally add optional properties
      if (tokenResponse.refresh_token) {
        result.refreshToken = tokenResponse.refresh_token;
      }
      if (pkceData.redirectTarget) {
        result.redirectTo = pkceData.redirectTarget;
      }

      return result;
    } catch (error) {
      // Clean up on error
      clearPKCEData();

      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error,
        };
      }

      const message = error instanceof Error ? error.message : 'Unknown error during callback';
      return {
        success: false,
        error: new AuthenticationError(message, 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Parse the callback URL for OAuth parameters.
   *
   * @param url - URL to parse (defaults to window.location.href)
   * @returns Parsed OAuth callback parameters
   */
  private parseCallbackUrl(url?: string): OAuthCallbackParams {
    const targetUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
    const urlObj = new URL(targetUrl);
    const searchParams = urlObj.searchParams;

    const result: OAuthCallbackParams = {};

    const code = searchParams.get('code');
    if (code) result.code = code;

    const state = searchParams.get('state');
    if (state) result.state = state;

    const error = searchParams.get('error');
    if (error) result.error = error;

    const errorDesc = searchParams.get('error_description');
    if (errorDesc) result.error_description = errorDesc;

    return result;
  }

  /**
   * Exchange authorization code for tokens.
   *
   * @param code - Authorization code
   * @param codeVerifier - PKCE code verifier
   * @returns Token response
   */
  private async exchangeCodeForTokens(
    code: string,
    codeVerifier: string
  ): Promise<TokenResponse> {
    // Build headers - X-API-Key is optional for auth endpoints (TASK-501)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.callbackUrl,
        code_verifier: codeVerifier,
        app: this.config.appSlug,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = (errorBody as Record<string, unknown>)?.['error'] as string ?? 'Token exchange failed';
      const errorCode = (errorBody as Record<string, unknown>)?.['error_code'] as string ?? 'TOKEN_INVALID';

      throw new AuthenticationError(
        errorMessage,
        this.mapErrorCode(errorCode),
        response.status
      );
    }

    return response.json() as Promise<TokenResponse>;
  }

  /**
   * Get user information from the access token.
   *
   * @param accessToken - Access token
   * @returns User information
   */
  private async getUserFromToken(accessToken: string): Promise<AuthUser> {
    // Build headers - X-API-Key is optional for auth endpoints (TASK-501)
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
    };
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Return minimal user if /me endpoint fails
      // (tokens are valid even if user info fetch fails)
      return {
        id: 'unknown',
        email: 'unknown',
        emailVerified: false,
        createdAt: new Date(),
      };
    }

    const userData = await response.json() as Record<string, unknown>;

    const user: AuthUser = {
      id: String(userData['id'] ?? 'unknown'),
      email: String(userData['email'] ?? 'unknown'),
      emailVerified: Boolean(userData['emailVerified']),
      createdAt: new Date(String(userData['createdAt'] ?? Date.now())),
    };

    // Conditionally add optional properties
    if (userData['name']) {
      user.name = String(userData['name']);
    }
    if (userData['avatarUrl']) {
      user.avatarUrl = String(userData['avatarUrl']);
    }
    if (userData['updatedAt']) {
      user.updatedAt = new Date(String(userData['updatedAt']));
    }
    if (userData['metadata']) {
      user.metadata = userData['metadata'] as Record<string, unknown>;
    }

    return user;
  }

  /**
   * Map error code string to AuthErrorCode.
   */
  private mapErrorCode(code: string): import('./types').AuthErrorCode {
    const codeMap: Record<string, import('./types').AuthErrorCode> = {
      'invalid_credentials': 'INVALID_CREDENTIALS',
      'email_not_verified': 'EMAIL_NOT_VERIFIED',
      'account_locked': 'ACCOUNT_LOCKED',
      'account_disabled': 'ACCOUNT_DISABLED',
      'session_expired': 'SESSION_EXPIRED',
      'token_expired': 'TOKEN_EXPIRED',
      'token_invalid': 'TOKEN_INVALID',
      'token_reuse_detected': 'TOKEN_REUSE_DETECTED',
      'max_sessions_exceeded': 'MAX_SESSIONS_EXCEEDED',
    };

    return codeMap[code.toLowerCase()] ?? 'UNKNOWN_ERROR';
  }

  /**
   * Create an error result.
   */
  private createErrorResult(error: string, description?: string): CallbackResult {
    const message = description ?? error;
    return {
      success: false,
      error: new AuthenticationError(message, this.mapErrorCode(error)),
    };
  }

  /**
   * Clean up the URL by removing OAuth parameters.
   */
  private cleanupUrl(): void {
    if (typeof window === 'undefined' || typeof history === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('state');
    url.searchParams.delete('error');
    url.searchParams.delete('error_description');

    // Use replaceState to update URL without adding history entry
    history.replaceState({}, '', url.toString());
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse OAuth callback parameters from a URL.
 *
 * @param url - URL to parse (defaults to current window.location)
 * @returns Parsed callback parameters
 */
export function parseOAuthCallback(url?: string): OAuthCallbackParams {
  const targetUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const urlObj = new URL(targetUrl);
  const searchParams = urlObj.searchParams;

  const result: OAuthCallbackParams = {};

  const code = searchParams.get('code');
  if (code) result.code = code;

  const state = searchParams.get('state');
  if (state) result.state = state;

  const error = searchParams.get('error');
  if (error) result.error = error;

  const errorDesc = searchParams.get('error_description');
  if (errorDesc) result.error_description = errorDesc;

  return result;
}

/**
 * Check if the current URL is an OAuth callback.
 *
 * @param url - URL to check (defaults to current window.location)
 * @returns True if URL contains OAuth callback parameters
 */
export function isCallbackUrl(url?: string): boolean {
  const params = parseOAuthCallback(url);
  return Boolean(params.code) || Boolean(params.error);
}

/**
 * Check if the callback contains an error.
 *
 * @param url - URL to check (defaults to current window.location)
 * @returns True if callback contains an error
 */
export function hasCallbackError(url?: string): boolean {
  const params = parseOAuthCallback(url);
  return Boolean(params.error);
}
