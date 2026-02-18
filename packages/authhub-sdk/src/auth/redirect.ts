/**
 * AuthHub SDK Redirect Mode Authentication
 *
 * Implements OAuth 2.0 authorization code flow with PKCE for secure
 * redirect-based authentication.
 *
 * @module @authhub/sdk/auth/redirect
 * @feature FTR-051
 */

import type { RedirectLoginOptions, TokenStorage } from './types';
import {
  generatePKCECodePair,
  generateState,
  storePKCEData,
} from './pkce';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for redirect mode authentication.
 */
export interface RedirectModeConfig {
  /** AuthHub API base URL */
  baseUrl: string;
  /** Application slug or ID */
  appSlug: string;
  /** Default callback URL after authentication */
  callbackUrl: string;
  /** Token storage implementation */
  storage: TokenStorage;
  /** Optional key prefix for storage */
  keyPrefix?: string;
  /**
   * Storage mode to signal to the backend during OAuth callback.
   * When 'cookie', backend will set httpOnly cookies instead of returning tokens.
   * @default 'bearer'
   * @task TASK-500
   * @feature FTR-109
   */
  storageMode?: 'bearer' | 'cookie';
}

/**
 * Options for redirect operations.
 */
export interface RedirectOptions {
  /** Override the default callback URL */
  redirectUri?: string;
  /** Custom state parameter (auto-generated if not provided) */
  state?: string;
  /** URL to return to after successful auth (stored for callback) */
  returnTo?: string;
  /** Additional query parameters to include */
  additionalParams?: Record<string, string>;
}

/**
 * Options specific to registration.
 */
export interface RegisterRedirectOptions extends RedirectOptions {
  /** Pre-fill email in registration form */
  email?: string;
  /** Pre-fill name in registration form */
  name?: string;
}

/**
 * Options for logout.
 */
export interface LogoutOptions {
  /** Whether to redirect to AuthHub logout endpoint */
  redirectToAuthHub?: boolean;
  /** URL to redirect to after logout (if redirectToAuthHub is true) */
  returnTo?: string;
  /** Whether to perform a global logout (all sessions) */
  globalLogout?: boolean;
}

// ============================================================================
// Redirect Mode Class
// ============================================================================

/**
 * Handles redirect-based authentication flows.
 *
 * @example
 * ```typescript
 * const redirectMode = new RedirectMode({
 *   baseUrl: 'https://authhub.example.com',
 *   appSlug: 'my-app',
 *   callbackUrl: 'https://myapp.com/auth/callback',
 *   storage: new LocalStorageTokenStorage(),
 * });
 *
 * // Redirect to login
 * await redirectMode.login();
 *
 * // Redirect to register
 * await redirectMode.register({ email: 'user@example.com' });
 *
 * // Logout
 * await redirectMode.logout();
 * ```
 */
export class RedirectMode {
  private readonly config: RedirectModeConfig;

  constructor(config: RedirectModeConfig) {
    this.config = config;
  }

  /**
   * Build the authorization URL for OAuth flow.
   *
   * @param endpoint - Auth portal endpoint ('login' | 'register')
   * @param options - Redirect options
   * @returns Authorization URL and generated state
   */
  private async buildAuthUrl(
    endpoint: 'login' | 'register',
    options: RedirectOptions = {}
  ): Promise<{ url: string; state: string; codeVerifier: string }> {
    // Generate PKCE code pair
    const pkce = await generatePKCECodePair();

    // Generate or use provided state
    const state = options.state ?? generateState();

    // Build the authorization URL
    const authUrl = new URL(`/auth/${endpoint}`, this.config.baseUrl);

    // Required parameters
    authUrl.searchParams.set('app', this.config.appSlug);
    authUrl.searchParams.set('redirect_uri', options.redirectUri ?? this.config.callbackUrl);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);

    // PKCE parameters
    authUrl.searchParams.set('code_challenge', pkce.codeChallenge);
    authUrl.searchParams.set('code_challenge_method', pkce.codeChallengeMethod);

    // Storage mode - signals backend to use cookies instead of returning tokens
    // @task TASK-500, @feature FTR-109
    if (this.config.storageMode === 'cookie') {
      authUrl.searchParams.set('storage_mode', 'cookie');
    }

    // Additional parameters
    if (options.additionalParams) {
      for (const [key, value] of Object.entries(options.additionalParams)) {
        authUrl.searchParams.set(key, value);
      }
    }

    return {
      url: authUrl.toString(),
      state,
      codeVerifier: pkce.codeVerifier,
    };
  }

  /**
   * Initiate login by redirecting to AuthHub login page.
   *
   * This method:
   * 1. Generates PKCE code verifier and challenge
   * 2. Generates state parameter for CSRF protection
   * 3. Stores verifier and state in sessionStorage
   * 4. Redirects browser to AuthHub login page
   *
   * @param options - Login options
   * @returns Never returns (redirects browser)
   *
   * @example
   * ```typescript
   * // Basic login
   * await redirectMode.login();
   *
   * // Login with return URL
   * await redirectMode.login({
   *   returnTo: '/dashboard',
   * });
   *
   * // Login with custom callback
   * await redirectMode.login({
   *   redirectUri: 'https://myapp.com/custom-callback',
   * });
   * ```
   */
  async login(options: RedirectLoginOptions & RedirectOptions = {}): Promise<void> {
    const { url, state, codeVerifier } = await this.buildAuthUrl('login', options);

    // Store PKCE data for callback validation
    storePKCEData(codeVerifier, state, options.returnTo);

    // Redirect to login page
    this.redirect(url);
  }

  /**
   * Initiate registration by redirecting to AuthHub register page.
   *
   * @param options - Registration options
   * @returns Never returns (redirects browser)
   *
   * @example
   * ```typescript
   * // Basic registration
   * await redirectMode.register();
   *
   * // Pre-fill email
   * await redirectMode.register({
   *   email: 'user@example.com',
   * });
   *
   * // Pre-fill email and name
   * await redirectMode.register({
   *   email: 'user@example.com',
   *   name: 'John Doe',
   * });
   * ```
   */
  async register(options: RegisterRedirectOptions = {}): Promise<void> {
    const additionalParams: Record<string, string> = { ...options.additionalParams };

    // Pre-fill form fields
    if (options.email) {
      additionalParams['email'] = options.email;
    }
    if (options.name) {
      additionalParams['name'] = options.name;
    }

    const { url, state, codeVerifier } = await this.buildAuthUrl('register', {
      ...options,
      additionalParams,
    });

    // Store PKCE data for callback validation
    storePKCEData(codeVerifier, state, options.returnTo);

    // Redirect to register page
    this.redirect(url);
  }

  /**
   * Log out the current user.
   *
   * This method:
   * 1. Clears tokens from storage
   * 2. Optionally redirects to AuthHub logout endpoint
   *
   * @param options - Logout options
   *
   * @example
   * ```typescript
   * // Clear tokens only (no redirect)
   * await redirectMode.logout();
   *
   * // Clear tokens and redirect to AuthHub logout
   * await redirectMode.logout({
   *   redirectToAuthHub: true,
   *   returnTo: 'https://myapp.com/',
   * });
   *
   * // Global logout (all sessions)
   * await redirectMode.logout({
   *   redirectToAuthHub: true,
   *   globalLogout: true,
   * });
   * ```
   */
  async logout(options: LogoutOptions = {}): Promise<void> {
    // Clear tokens from storage
    await this.config.storage.clearTokens();

    // Optionally redirect to AuthHub logout
    if (options.redirectToAuthHub) {
      const logoutUrl = new URL('/auth/logout', this.config.baseUrl);
      logoutUrl.searchParams.set('app', this.config.appSlug);

      if (options.returnTo) {
        logoutUrl.searchParams.set('redirect_uri', options.returnTo);
      }

      if (options.globalLogout) {
        logoutUrl.searchParams.set('global', 'true');
      }

      this.redirect(logoutUrl.toString());
    }
  }

  /**
   * Get the login URL without redirecting.
   *
   * Useful for custom redirect handling or opening in a popup.
   *
   * @param options - Login options
   * @returns Promise with URL, state, and code verifier
   *
   * @example
   * ```typescript
   * const { url, state, codeVerifier } = await redirectMode.getLoginUrl();
   *
   * // Store PKCE data manually
   * storePKCEData(codeVerifier, state);
   *
   * // Open in popup
   * window.open(url, 'authPopup', 'width=500,height=600');
   * ```
   */
  async getLoginUrl(options: RedirectOptions = {}): Promise<{
    url: string;
    state: string;
    codeVerifier: string;
  }> {
    return this.buildAuthUrl('login', options);
  }

  /**
   * Get the register URL without redirecting.
   *
   * @param options - Registration options
   * @returns Promise with URL, state, and code verifier
   */
  async getRegisterUrl(options: RegisterRedirectOptions = {}): Promise<{
    url: string;
    state: string;
    codeVerifier: string;
  }> {
    const additionalParams: Record<string, string> = { ...options.additionalParams };

    if (options.email) {
      additionalParams['email'] = options.email;
    }
    if (options.name) {
      additionalParams['name'] = options.name;
    }

    return this.buildAuthUrl('register', {
      ...options,
      additionalParams,
    });
  }

  /**
   * Get the logout URL.
   *
   * @param options - Logout options
   * @returns Logout URL
   */
  getLogoutUrl(options: LogoutOptions = {}): string {
    const logoutUrl = new URL('/auth/logout', this.config.baseUrl);
    logoutUrl.searchParams.set('app', this.config.appSlug);

    if (options.returnTo) {
      logoutUrl.searchParams.set('redirect_uri', options.returnTo);
    }

    if (options.globalLogout) {
      logoutUrl.searchParams.set('global', 'true');
    }

    return logoutUrl.toString();
  }

  /**
   * Redirect the browser to a URL.
   *
   * @param url - URL to redirect to
   */
  private redirect(url: string): void {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    } else {
      throw new Error(
        'Cannot redirect: window is not available. ' +
        'Use getLoginUrl() or getRegisterUrl() for server-side rendering.'
      );
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if the current environment supports redirect mode.
 *
 * @returns True if running in a browser environment
 */
export function isRedirectModeSupported(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if the current page is an OAuth callback.
 *
 * @param callbackPath - Expected callback path (default: '/auth/callback')
 * @returns True if current URL matches callback path and has code parameter
 */
export function isOAuthCallback(callbackPath: string = '/auth/callback'): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);

  return pathname === callbackPath && params.has('code');
}
