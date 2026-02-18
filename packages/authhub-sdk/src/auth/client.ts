/**
 * AuthHub SDK Auth Client
 *
 * Main auth module facade that integrates all auth components.
 *
 * @module @authhub/sdk/auth/client
 * @feature FTR-051
 */

import type {
  AuthModuleConfig,
  AuthState,
  AuthUser,
  LoginResult,
  RegisterResult,
  RefreshResult,
  PasswordResetResult,
  LoginCredentials,
  RegisterData,
  RedirectLoginOptions,
  TokenStorage,
} from './types';
import { AuthenticationError } from './types';
import { createTokenStorage } from './storage';
import { RedirectMode } from './redirect';
import { CallbackHandler } from './callback';
import { EmbeddedMode } from './embedded';
import { TokenManager } from './token-manager';
import { AuthStateManager } from './state';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for creating an AuthClient.
 */
export interface AuthClientConfig {
  /** AuthHub API base URL */
  baseUrl: string;
  /**
   * API key for protected operations (AI, Database, Secrets).
   * Optional for redirect-mode authentication only.
   * @task TASK-501
   * @feature FTR-110
   */
  apiKey?: string;
  /** Application slug */
  appSlug: string;
  /** Auth module configuration */
  auth?: AuthModuleConfig;
}

// ============================================================================
// Auth Client
// ============================================================================

/**
 * Main auth client that provides a unified interface for authentication.
 *
 * Supports both redirect mode (AuthHub portal) and embedded mode (custom UI).
 *
 * @example
 * ```typescript
 * // Create client in redirect mode
 * const auth = new AuthClient({
 *   baseUrl: 'https://authhub.example.com',
 *   apiKey: 'ak_xxxxx',
 *   appSlug: 'my-app',
 *   auth: {
 *     mode: 'redirect',
 *     callbackUrl: 'https://myapp.com/auth/callback',
 *   },
 * });
 *
 * // Login (redirects to AuthHub)
 * await auth.login();
 *
 * // Handle callback on /auth/callback page
 * if (auth.isCallback()) {
 *   await auth.handleCallback();
 * }
 *
 * // Check auth state
 * const { isAuthenticated, user } = auth.getState();
 * ```
 */
export class AuthClient {
  private readonly config: AuthClientConfig;
  private readonly storage: TokenStorage;
  public readonly stateManager: AuthStateManager;
  public readonly tokenManager: TokenManager;
  public readonly redirectMode: RedirectMode | null = null;
  public readonly embeddedMode: EmbeddedMode | null = null;
  public readonly callbackHandler: CallbackHandler | null = null;
  public readonly mode: 'redirect' | 'embedded';

  constructor(config: AuthClientConfig) {
    this.config = config;
    this.mode = config.auth?.mode ?? 'redirect';

    // Initialize storage
    const storageType = config.auth?.storage ?? 'localStorage';
    if (storageType === 'custom' && config.auth?.customStorage) {
      this.storage = config.auth.customStorage;
    } else if (storageType === 'custom') {
      throw new Error('Custom storage selected but customStorage not provided');
    } else if (storageType === 'cookie') {
      // Cookie mode - use CookieTokenStorage
      this.storage = createTokenStorage('cookie');
    } else {
      this.storage = createTokenStorage(storageType, config.auth?.storageKeyPrefix);
    }

    // Initialize state manager
    const stateManagerConfig: import('./state').AuthStateManagerConfig = {
      storage: this.storage,
    };
    if (config.auth?.mode === 'embedded') {
      stateManagerConfig.fetchUser = async (token) => {
        // Build headers - X-API-Key is optional for auth endpoints (TASK-501)
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`,
        };
        if (config.apiKey) {
          headers['X-API-Key'] = config.apiKey;
        }
        const response = await fetch(`${config.baseUrl}/api/v1/auth/me`, {
          headers,
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
      };
    }
    this.stateManager = new AuthStateManager(stateManagerConfig);

    // Initialize token manager - apiKey is optional for auth endpoints (TASK-501)
    const tokenManagerConfig: import('./token-manager').TokenManagerConfig = {
      baseUrl: config.baseUrl,
      storage: this.storage,
      refreshThreshold: config.auth?.refreshThreshold ?? 60,
      onTokenRefresh: (tokens) => {
        this.stateManager.setTokenRefreshed(tokens);
        config.auth?.onAuthStateChange?.(this.stateManager.getState());
      },
      onSessionExpired: (error) => {
        this.stateManager.setSessionExpired(error);
        config.auth?.onAuthError?.(error);
      },
      onTokenReuseDetected: () => {
        config.auth?.onAuthError?.(
          new AuthenticationError(
            'Security breach detected. Session invalidated.',
            'TOKEN_REUSE_DETECTED'
          )
        );
      },
    };
    if (config.apiKey) {
      tokenManagerConfig.apiKey = config.apiKey;
    }
    this.tokenManager = new TokenManager(tokenManagerConfig);

    // Initialize mode-specific components
    if (this.mode === 'redirect' && config.auth?.callbackUrl) {
      this.redirectMode = new RedirectMode({
        baseUrl: config.baseUrl,
        appSlug: config.appSlug,
        callbackUrl: config.auth.callbackUrl,
        storage: this.storage,
        // Pass storageMode to signal backend to use cookies - @task TASK-500, @feature FTR-109
        storageMode: config.auth?.storage === 'cookie' ? 'cookie' : 'bearer',
      });

      // apiKey is optional for redirect mode callback handling (TASK-501)
      const callbackConfig: import('./callback').CallbackConfig = {
        baseUrl: config.baseUrl,
        appSlug: config.appSlug,
        callbackUrl: config.auth.callbackUrl,
        storage: this.storage,
      };
      if (config.apiKey) {
        callbackConfig.apiKey = config.apiKey;
      }
      this.callbackHandler = new CallbackHandler(callbackConfig);
    } else if (this.mode === 'embedded') {
      // apiKey is optional for embedded mode (TASK-501)
      const embeddedConfig: import('./embedded').EmbeddedModeConfig = {
        baseUrl: config.baseUrl,
        appSlug: config.appSlug,
        storage: this.storage,
      };
      if (config.apiKey) {
        embeddedConfig.apiKey = config.apiKey;
      }
      this.embeddedMode = new EmbeddedMode(embeddedConfig);
    }
  }

  /**
   * Initialize auth state from storage.
   * Call this on app startup.
   */
  async initialize(): Promise<void> {
    await this.stateManager.initialize();

    // Start auto-refresh if authenticated and enabled
    if (this.stateManager.isAuthenticated() && this.config.auth?.autoRefresh !== false) {
      await this.tokenManager.startAutoRefresh();
    }
  }

  /**
   * Get current auth state.
   */
  getState(): AuthState {
    return this.stateManager.getState();
  }

  /**
   * Get current user.
   */
  getUser(): AuthUser | null {
    return this.stateManager.getUser();
  }

  /**
   * Check if authenticated.
   */
  isAuthenticated(): boolean {
    return this.stateManager.isAuthenticated();
  }

  /**
   * Subscribe to auth state changes.
   */
  onStateChange(callback: (state: AuthState) => void): () => void {
    return this.stateManager.onStateChange(callback);
  }

  /**
   * Log in.
   * In redirect mode: redirects to AuthHub portal
   * In embedded mode: authenticates with credentials
   */
  async login(
    credentials?: LoginCredentials,
    options?: RedirectLoginOptions
  ): Promise<LoginResult | void> {
    if (this.mode === 'redirect' && this.redirectMode) {
      await this.redirectMode.login(options);
      return;
    }

    if (this.mode === 'embedded' && this.embeddedMode) {
      if (!credentials) {
        throw new Error('Credentials required for embedded mode');
      }
      const result = await this.embeddedMode.login(credentials);
      if (result.success && result.user) {
        const tokens = await this.storage.getTokens();
        if (tokens) {
          this.stateManager.setSignedIn(result.user, tokens);
          if (this.config.auth?.autoRefresh !== false) {
            await this.tokenManager.startAutoRefresh();
          }
        }
      }
      return result;
    }

    throw new Error(`Login not available in ${this.mode} mode`);
  }

  /**
   * Register a new user.
   */
  async register(data: RegisterData): Promise<RegisterResult> {
    if (this.mode === 'redirect' && this.redirectMode) {
      const registerOptions: import('./redirect').RegisterRedirectOptions = { email: data.email };
      if (data.name) {
        registerOptions.name = data.name;
      }
      await this.redirectMode.register(registerOptions);
      return { success: true };
    }

    if (this.mode === 'embedded' && this.embeddedMode) {
      return this.embeddedMode.register(data);
    }

    throw new Error(`Register not available in ${this.mode} mode`);
  }

  /**
   * Log out.
   */
  async logout(): Promise<void> {
    this.tokenManager.stopAutoRefresh();

    if (this.mode === 'redirect' && this.redirectMode) {
      await this.redirectMode.logout();
    } else if (this.mode === 'embedded' && this.embeddedMode) {
      await this.embeddedMode.logout();
    } else {
      await this.storage.clearTokens();
    }

    this.stateManager.setSignedOut();
  }

  /**
   * Handle OAuth callback (redirect mode only).
   */
  async handleCallback(url?: string): Promise<LoginResult> {
    if (!this.callbackHandler) {
      throw new Error('Callback handler not available (redirect mode required)');
    }

    const result = await this.callbackHandler.handleCallback(url);

    if (result.success && result.user) {
      const tokens = await this.storage.getTokens();
      if (tokens) {
        this.stateManager.setSignedIn(result.user, tokens);
        if (this.config.auth?.autoRefresh !== false) {
          await this.tokenManager.startAutoRefresh();
        }
      }
    }

    return result;
  }

  /**
   * Check if current URL is a callback.
   */
  isCallback(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.has('code') || params.has('error');
  }

  /**
   * Refresh the current token.
   */
  async refreshToken(): Promise<RefreshResult> {
    return this.tokenManager.refreshToken();
  }

  /**
   * Get a valid access token.
   *
   * In cookie mode, returns null since tokens are stored in httpOnly cookies
   * and cannot be accessed by JavaScript. Use `credentials: 'include'` in
   * fetch requests to have the browser automatically include cookies.
   *
   * @returns Access token or null (null in cookie mode by design)
   */
  async getAccessToken(): Promise<string | null> {
    // In cookie mode, tokens are in httpOnly cookies - not accessible to JS
    if (this.config.auth?.storage === 'cookie') {
      // Dev-mode warning to help developers understand cookie mode behavior
      if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] !== 'production') {
        console.warn(
          '[AuthHub SDK] getAccessToken() returns null in cookie mode. ' +
          'This is expected behavior - tokens are stored in httpOnly cookies. ' +
          'Use `credentials: "include"` in fetch requests, or use isCookieMode() ' +
          'to check the storage mode before calling getAccessToken().'
        );
      }
      return null;
    }
    return this.tokenManager.getValidToken();
  }

  /**
   * Check if the SDK is configured to use cookie mode.
   * When true, API requests should use `credentials: 'include'`.
   *
   * @returns True if using cookie storage mode
   */
  isCookieMode(): boolean {
    return this.config.auth?.storage === 'cookie';
  }

  /**
   * Request password reset (embedded mode).
   */
  async requestPasswordReset(email: string): Promise<PasswordResetResult> {
    if (!this.embeddedMode) {
      throw new Error('Password reset requires embedded mode');
    }
    return this.embeddedMode.forgotPassword(email);
  }

  /**
   * Reset password with token (embedded mode).
   */
  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
    if (!this.embeddedMode) {
      throw new Error('Password reset requires embedded mode');
    }
    return this.embeddedMode.resetPassword(token, newPassword);
  }

  /**
   * Create an auth-only client without API key.
   *
   * Use this factory method when you only need authentication functionality
   * (redirect-mode login, logout, session management) and don't need access
   * to protected operations (AI, Database, Secrets).
   *
   * @param config - Configuration without apiKey
   * @returns AuthClient instance configured for auth-only usage
   *
   * @example
   * ```typescript
   * // Auth-only client for redirect-mode authentication
   * const auth = AuthClient.forAuth({
   *   baseUrl: 'https://authhub.example.com',
   *   appSlug: 'my-app',
   *   auth: {
   *     mode: 'redirect',
   *     callbackUrl: 'https://myapp.com/auth/callback',
   *   },
   * });
   *
   * // Login (redirects to AuthHub portal)
   * await auth.login();
   * ```
   *
   * @task TASK-501
   * @feature FTR-110
   */
  static forAuth(config: Omit<AuthClientConfig, 'apiKey'>): AuthClient {
    return new AuthClient(config);
  }
}

/**
 * Create an auth client with configuration.
 */
export function createAuthClient(config: AuthClientConfig): AuthClient {
  return new AuthClient(config);
}
