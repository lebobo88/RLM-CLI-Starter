/**
 * AuthHub SDK Auth Types
 *
 * Type definitions for authentication and authorization in the SDK.
 *
 * @module @authhub/sdk/auth/types
 * @feature FTR-051
 */

// ============================================================================
// Auth Module Configuration
// ============================================================================

/**
 * Authentication mode for the SDK.
 *
 * - `redirect`: Redirects user to AuthHub's auth portal (recommended for web apps)
 * - `embedded`: Uses direct API calls for authentication (for SPAs with backend)
 */
export type AuthMode = 'redirect' | 'embedded';

/**
 * Token storage strategy.
 *
 * - `localStorage`: Persists across browser sessions (convenient but less secure)
 * - `sessionStorage`: Clears when browser tab closes (more secure)
 * - `memory`: Clears on page refresh (most secure, least convenient)
 * - `custom`: Use a custom TokenStorage implementation
 * - `cookie`: Delegates to server-set httpOnly cookies (most secure for XSS protection)
 */
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'custom' | 'cookie';

/**
 * Configuration for the auth module.
 *
 * @example
 * ```typescript
 * const authConfig: AuthModuleConfig = {
 *   mode: 'redirect',
 *   callbackUrl: 'https://myapp.com/auth/callback',
 *   storage: 'localStorage',
 *   autoRefresh: true,
 * };
 * ```
 */
export interface AuthModuleConfig {
  /**
   * Authentication mode.
   * @default 'redirect'
   */
  mode?: AuthMode;

  /**
   * URL to redirect to after authentication (for redirect mode).
   * Must be registered in the app's allowed callback URLs.
   */
  callbackUrl?: string;

  /**
   * Token storage strategy.
   * @default 'localStorage'
   */
  storage?: StorageType;

  /**
   * Custom token storage implementation (required if storage is 'custom').
   */
  customStorage?: TokenStorage;

  /**
   * Prefix for storage keys.
   * @default 'authhub_'
   */
  storageKeyPrefix?: string;

  /**
   * Automatically refresh tokens before expiration.
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Seconds before expiry to trigger auto-refresh.
   * @default 60
   */
  refreshThreshold?: number;

  /**
   * Callback invoked when auth state changes.
   */
  onAuthStateChange?: (state: AuthState) => void;

  /**
   * Callback invoked when authentication fails.
   */
  onAuthError?: (error: AuthenticationError) => void;
}

// ============================================================================
// Token Storage Interface
// ============================================================================

/**
 * Stored token data structure.
 */
export interface StoredTokenData {
  /** Access token for API requests */
  accessToken: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** Expiration timestamp (Unix epoch in milliseconds) */
  expiresAt: number;
  /** Token type (typically 'Bearer') */
  tokenType: string;
}

/**
 * Interface for custom token storage implementations.
 *
 * Implement this interface to use a custom storage mechanism
 * (e.g., secure storage on mobile, encrypted IndexedDB, etc.)
 *
 * @example
 * ```typescript
 * class SecureStorage implements TokenStorage {
 *   async getTokens(): Promise<StoredTokenData | null> {
 *     const encrypted = await SecureStore.get('tokens');
 *     return encrypted ? decrypt(encrypted) : null;
 *   }
 *   async setTokens(tokens: StoredTokenData): Promise<void> {
 *     await SecureStore.set('tokens', encrypt(tokens));
 *   }
 *   async clearTokens(): Promise<void> {
 *     await SecureStore.delete('tokens');
 *   }
 * }
 * ```
 */
export interface TokenStorage {
  /**
   * Retrieve stored tokens.
   * @returns Token data or null if not stored/expired
   */
  getTokens(): Promise<StoredTokenData | null> | StoredTokenData | null;

  /**
   * Store token data.
   * @param tokens - Token data to store
   */
  setTokens(tokens: StoredTokenData): Promise<void> | void;

  /**
   * Clear all stored tokens.
   */
  clearTokens(): Promise<void> | void;
}

// ============================================================================
// User Types
// ============================================================================

/**
 * Authenticated user information.
 *
 * @example
 * ```typescript
 * const user: AuthUser = {
 *   id: 'usr_abc123',
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   emailVerified: true,
 *   createdAt: new Date('2024-01-15'),
 * };
 * ```
 */
export interface AuthUser {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name?: string;
  /** URL to user's avatar/profile image */
  avatarUrl?: string;
  /** Whether the email has been verified */
  emailVerified: boolean;
  /** Account creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Additional user metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Auth State
// ============================================================================

/**
 * Current authentication state.
 *
 * @example
 * ```typescript
 * // Not authenticated
 * const state: AuthState = {
 *   isAuthenticated: false,
 *   isLoading: false,
 *   user: null,
 * };
 *
 * // Authenticated
 * const state: AuthState = {
 *   isAuthenticated: true,
 *   isLoading: false,
 *   user: { id: 'usr_123', email: 'user@example.com', ... },
 *   accessToken: 'eyJ...',
 * };
 * ```
 */
export interface AuthState {
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether authentication state is being determined */
  isLoading: boolean;
  /** Authenticated user (null if not authenticated) */
  user: AuthUser | null;
  /** Current access token (null if not authenticated) */
  accessToken?: string | null;
  /** When the current token expires */
  expiresAt?: Date | null;
  /** Last authentication error (if any) */
  error?: AuthenticationError | null;
}

// ============================================================================
// Auth Results
// ============================================================================

/**
 * Result of a login operation.
 */
export interface LoginResult {
  /** Whether login was successful */
  success: boolean;
  /** Authenticated user (if successful) */
  user?: AuthUser;
  /** Access token (if successful) */
  accessToken?: string;
  /** Refresh token (if successful) */
  refreshToken?: string;
  /** Token expiration timestamp */
  expiresAt?: Date;
  /** Error details (if failed) */
  error?: AuthenticationError;
}

/**
 * Result of a registration operation.
 */
export interface RegisterResult {
  /** Whether registration was successful */
  success: boolean;
  /** Newly created user (if successful) */
  user?: AuthUser;
  /** Whether email verification is required */
  requiresEmailVerification?: boolean;
  /** Error details (if failed) */
  error?: AuthenticationError;
}

/**
 * Result of a token refresh operation.
 */
export interface RefreshResult {
  /** Whether refresh was successful */
  success: boolean;
  /** New access token (if successful) */
  accessToken?: string;
  /** New refresh token (if rotated) */
  refreshToken?: string;
  /** New expiration timestamp */
  expiresAt?: Date;
  /** Error details (if failed) */
  error?: AuthenticationError;
}

/**
 * Result of a password reset request.
 */
export interface PasswordResetResult {
  /** Whether request was accepted */
  success: boolean;
  /** Message to display to user */
  message?: string;
  /** Error details (if failed) */
  error?: AuthenticationError;
}

// ============================================================================
// Auth Module Interface
// ============================================================================

/**
 * Login credentials for embedded mode.
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Registration data for embedded mode.
 */
export interface RegisterData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's display name */
  name?: string;
}

/**
 * Options for initiating redirect-based login.
 */
export interface RedirectLoginOptions {
  /** State parameter for CSRF protection (auto-generated if not provided) */
  state?: string;
  /** URL to redirect to after login (overrides callbackUrl) */
  redirectTo?: string;
}

/**
 * Auth module interface for SDK integration.
 *
 * @example
 * ```typescript
 * // Redirect mode
 * await client.auth.login(); // Redirects to auth portal
 *
 * // Embedded mode
 * const result = await client.auth.login({ email, password });
 *
 * // Check auth state
 * const { isAuthenticated, user } = client.auth.getState();
 *
 * // Logout
 * await client.auth.logout();
 * ```
 */
export interface AuthModule {
  /**
   * Current authentication state.
   */
  getState(): AuthState;

  /**
   * Subscribe to auth state changes.
   * @param callback - Function called when auth state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback: (state: AuthState) => void): () => void;

  /**
   * Initiate login flow.
   *
   * In redirect mode: Redirects to AuthHub auth portal
   * In embedded mode: Authenticates with credentials
   *
   * @param credentials - Login credentials (required for embedded mode)
   * @param options - Login options (for redirect mode)
   */
  login(
    credentials?: LoginCredentials,
    options?: RedirectLoginOptions
  ): Promise<LoginResult | void>;

  /**
   * Register a new user (embedded mode only).
   *
   * @param data - Registration data
   */
  register(data: RegisterData): Promise<RegisterResult>;

  /**
   * Log out the current user.
   * Clears tokens and revokes session on server.
   */
  logout(): Promise<void>;

  /**
   * Handle OAuth callback (redirect mode only).
   * Call this on your callback page to complete authentication.
   *
   * @param url - Current URL with OAuth parameters (uses window.location if not provided)
   */
  handleCallback(url?: string): Promise<LoginResult>;

  /**
   * Refresh the current access token.
   * Called automatically if autoRefresh is enabled.
   */
  refreshToken(): Promise<RefreshResult>;

  /**
   * Request a password reset email.
   *
   * @param email - Email address to send reset link to
   */
  requestPasswordReset(email: string): Promise<PasswordResetResult>;

  /**
   * Reset password with token from email.
   *
   * @param token - Reset token from email
   * @param newPassword - New password to set
   */
  resetPassword(token: string, newPassword: string): Promise<PasswordResetResult>;

  /**
   * Get a valid access token for API requests.
   * Automatically refreshes if expired.
   *
   * @returns Access token or null if not authenticated
   */
  getAccessToken(): Promise<string | null>;

  /**
   * Check if user has a valid session.
   * Verifies token with server.
   */
  validateSession(): Promise<boolean>;
}

// ============================================================================
// Auth Errors
// ============================================================================

/**
 * Error codes for authentication failures.
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_DISABLED'
  | 'SESSION_EXPIRED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'TOKEN_REUSE_DETECTED'
  | 'MAX_SESSIONS_EXCEEDED'
  | 'PASSWORD_TOO_WEAK'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_RESET_TOKEN'
  | 'RESET_TOKEN_EXPIRED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Authentication error with detailed information.
 *
 * @example
 * ```typescript
 * try {
 *   await client.auth.login({ email, password });
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     switch (error.code) {
 *       case 'INVALID_CREDENTIALS':
 *         showError('Invalid email or password');
 *         break;
 *       case 'EMAIL_NOT_VERIFIED':
 *         showError('Please verify your email first');
 *         break;
 *       case 'ACCOUNT_LOCKED':
 *         showError('Account locked. Try again later.');
 *         break;
 *     }
 *   }
 * }
 * ```
 */
export class AuthenticationError extends Error {
  /** Error code for programmatic handling */
  readonly code: AuthErrorCode;

  /** HTTP status code (if applicable) */
  readonly statusCode: number | undefined;

  /** Additional error details */
  readonly details: Record<string, unknown> | undefined;

  /** Whether this error is transient and worth retrying */
  readonly isRetryable: boolean;

  constructor(
    message: string,
    code: AuthErrorCode,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Determine if error is retryable
    this.isRetryable = [
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'TOKEN_EXPIRED',
    ].includes(code);

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }

  /**
   * Get a user-friendly error message.
   */
  get userMessage(): string {
    switch (this.code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      case 'EMAIL_NOT_VERIFIED':
        return 'Please verify your email address before signing in.';
      case 'ACCOUNT_LOCKED':
        return 'Your account has been temporarily locked. Please try again later.';
      case 'ACCOUNT_DISABLED':
        return 'Your account has been disabled. Please contact support.';
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please sign in again.';
      case 'TOKEN_EXPIRED':
        return 'Your session has expired. Please sign in again.';
      case 'TOKEN_INVALID':
        return 'Invalid authentication. Please sign in again.';
      case 'TOKEN_REUSE_DETECTED':
        return 'Security alert: Session may be compromised. Please sign in again.';
      case 'MAX_SESSIONS_EXCEEDED':
        return 'Maximum sessions exceeded. Please sign out from another device.';
      case 'PASSWORD_TOO_WEAK':
        return 'Password is too weak. Please use a stronger password.';
      case 'EMAIL_ALREADY_EXISTS':
        return 'An account with this email already exists.';
      case 'INVALID_RESET_TOKEN':
        return 'Invalid password reset link. Please request a new one.';
      case 'RESET_TOKEN_EXPIRED':
        return 'Password reset link has expired. Please request a new one.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      case 'SERVER_ERROR':
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get troubleshooting suggestions.
   */
  get suggestion(): string {
    switch (this.code) {
      case 'INVALID_CREDENTIALS':
        return 'Double-check your email and password. Use "Forgot Password" if needed.';
      case 'EMAIL_NOT_VERIFIED':
        return 'Check your email inbox (and spam folder) for the verification link.';
      case 'ACCOUNT_LOCKED':
        return 'Wait 15 minutes or contact support to unlock your account.';
      case 'TOKEN_REUSE_DETECTED':
        return 'For security, sign out from all devices and change your password.';
      case 'PASSWORD_TOO_WEAK':
        return 'Use at least 8 characters with uppercase, lowercase, number, and special character.';
      default:
        return '';
    }
  }
}

// ============================================================================
// OAuth Types (for redirect mode)
// ============================================================================

/**
 * OAuth callback parameters.
 */
export interface OAuthCallbackParams {
  /** Authorization code from OAuth flow */
  code?: string;
  /** State parameter for CSRF validation */
  state?: string;
  /** Error code (if authorization failed) */
  error?: string;
  /** Error description */
  error_description?: string;
}

/**
 * Token exchange request (internal use).
 */
export interface TokenExchangeRequest {
  /** Authorization code */
  code: string;
  /** Redirect URI used in authorization */
  redirect_uri: string;
  /** Grant type (always 'authorization_code') */
  grant_type: 'authorization_code';
}

/**
 * Token response from OAuth token endpoint.
 */
export interface TokenResponse {
  /** Access token for API requests */
  access_token: string;
  /** Token type (typically 'Bearer') */
  token_type: string;
  /** Token validity in seconds */
  expires_in: number;
  /** Refresh token for obtaining new access tokens */
  refresh_token?: string;
  /** Granted scopes */
  scope?: string;
}
