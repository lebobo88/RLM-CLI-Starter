/**
 * AuthHub SDK Embedded Mode API
 *
 * Direct API calls for apps with custom authentication UI.
 * Use this when you want full control over the auth experience.
 *
 * @module @authhub/sdk/auth/embedded
 * @feature FTR-051
 */

import type {
  LoginResult,
  RegisterResult,
  PasswordResetResult,
  AuthUser,
  TokenStorage,
  LoginCredentials,
  RegisterData,
} from './types';
import { AuthenticationError } from './types';
import { createStoredTokenData } from './storage';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for embedded mode API.
 */
export interface EmbeddedModeConfig {
  /** AuthHub API base URL */
  baseUrl: string;
  /** Application slug or ID */
  appSlug: string;
  /** Token storage implementation */
  storage: TokenStorage;
  /**
   * API key for protected operations.
   * Optional for embedded-mode authentication (auth endpoints don't require it).
   * @task TASK-501
   * @feature FTR-110
   */
  apiKey?: string;
}

/**
 * Response from user info endpoint.
 */
interface UserInfoResponse {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response from login/register endpoints.
 */
interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  user: UserInfoResponse;
}

/**
 * API error response structure.
 */
interface ApiError {
  error: string;
  error_code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Embedded Mode Class
// ============================================================================

/**
 * Provides direct API access for embedded authentication.
 *
 * Use this for apps that want to build their own login/register UI
 * instead of redirecting to AuthHub's auth portal.
 *
 * @example
 * ```typescript
 * const api = new EmbeddedMode({
 *   baseUrl: 'https://authhub.example.com',
 *   appSlug: 'my-app',
 *   storage: new LocalStorageTokenStorage(),
 *   apiKey: 'ak_xxxxx',
 * });
 *
 * // Login with email/password
 * const result = await api.login({ email, password });
 * if (result.success) {
 *   console.log('Logged in as', result.user?.name);
 * } else {
 *   console.error(result.error?.userMessage);
 * }
 *
 * // Register new user
 * const registerResult = await api.register({
 *   email: 'user@example.com',
 *   password: 'securePassword123!',
 *   name: 'John Doe',
 * });
 * ```
 */
export class EmbeddedMode {
  private readonly config: EmbeddedModeConfig;

  constructor(config: EmbeddedModeConfig) {
    this.config = config;
  }

  /**
   * Log in with email and password.
   *
   * @param credentials - Login credentials
   * @returns Login result with user and tokens
   *
   * @example
   * ```typescript
   * const result = await api.login({
   *   email: 'user@example.com',
   *   password: 'myPassword123!',
   * });
   *
   * if (!result.success) {
   *   switch (result.error?.code) {
   *     case 'INVALID_CREDENTIALS':
   *       alert('Invalid email or password');
   *       break;
   *     case 'EMAIL_NOT_VERIFIED':
   *       // Redirect to verification page
   *       break;
   *     case 'ACCOUNT_LOCKED':
   *       alert('Account locked. Try again later.');
   *       break;
   *   }
   * }
   * ```
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const response = await this.request<AuthResponse>('POST', '/api/v1/auth/login', {
        email: credentials.email,
        password: credentials.password,
        app: this.config.appSlug,
      });

      // Store tokens
      const tokenData = createStoredTokenData(
        response.access_token,
        response.expires_in,
        response.refresh_token
      );
      await this.config.storage.setTokens(tokenData);

      // Build result
      const result: LoginResult = {
        success: true,
        user: this.mapUser(response.user),
        accessToken: response.access_token,
        expiresAt: new Date(tokenData.expiresAt),
      };

      if (response.refresh_token) {
        result.refreshToken = response.refresh_token;
      }

      return result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : 'Login failed';
      return {
        success: false,
        error: new AuthenticationError(message, 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Register a new user.
   *
   * @param data - Registration data
   * @returns Registration result
   *
   * @example
   * ```typescript
   * const result = await api.register({
   *   email: 'newuser@example.com',
   *   password: 'SecurePass123!',
   *   name: 'Jane Doe',
   * });
   *
   * if (result.success) {
   *   if (result.requiresEmailVerification) {
   *     // Show "check your email" message
   *   } else {
   *     // User is already logged in
   *   }
   * }
   * ```
   */
  async register(data: RegisterData): Promise<RegisterResult> {
    try {
      const response = await this.request<AuthResponse & { requiresEmailVerification?: boolean }>(
        'POST',
        '/api/v1/auth/register',
        {
          email: data.email,
          password: data.password,
          name: data.name,
          app: this.config.appSlug,
        }
      );

      // If email verification not required, store tokens
      if (!response.requiresEmailVerification && response.access_token) {
        const tokenData = createStoredTokenData(
          response.access_token,
          response.expires_in,
          response.refresh_token
        );
        await this.config.storage.setTokens(tokenData);
      }

      const result: RegisterResult = {
        success: true,
        user: this.mapUser(response.user),
      };

      if (response.requiresEmailVerification) {
        result.requiresEmailVerification = true;
      }

      return result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : 'Registration failed';
      return {
        success: false,
        error: new AuthenticationError(message, 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Resend verification email.
   *
   * @param email - Email address to send verification to
   * @returns Result indicating success
   *
   * @example
   * ```typescript
   * const result = await api.resendVerification('user@example.com');
   * if (result.success) {
   *   alert('Verification email sent!');
   * }
   * ```
   */
  async resendVerification(email: string): Promise<PasswordResetResult> {
    try {
      await this.request<{ message: string }>('POST', '/api/v1/auth/resend-verification', {
        email,
        app: this.config.appSlug,
      });

      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.',
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : 'Failed to send verification email';
      return {
        success: false,
        error: new AuthenticationError(message, 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Request a password reset email.
   *
   * @param email - Email address for password reset
   * @returns Result indicating success
   *
   * @example
   * ```typescript
   * const result = await api.forgotPassword('user@example.com');
   * if (result.success) {
   *   alert('Password reset email sent!');
   * }
   * ```
   */
  async forgotPassword(email: string): Promise<PasswordResetResult> {
    try {
      await this.request<{ message: string }>('POST', '/api/v1/auth/forgot-password', {
        email,
        app: this.config.appSlug,
      });

      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      return {
        success: false,
        error: new AuthenticationError(message, 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Reset password with token from email.
   *
   * @param token - Reset token from email link
   * @param newPassword - New password to set
   * @returns Result indicating success
   *
   * @example
   * ```typescript
   * const result = await api.resetPassword(token, 'NewSecurePass123!');
   * if (result.success) {
   *   alert('Password reset successfully! Please log in.');
   * }
   * ```
   */
  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
    try {
      await this.request<{ message: string }>('POST', '/api/v1/auth/reset-password', {
        token,
        password: newPassword,
        app: this.config.appSlug,
      });

      return {
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.',
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      return {
        success: false,
        error: new AuthenticationError(message, 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Get current user information.
   *
   * @returns Current user or null if not authenticated
   *
   * @example
   * ```typescript
   * const user = await api.me();
   * if (user) {
   *   console.log('Logged in as:', user.email);
   * } else {
   *   console.log('Not authenticated');
   * }
   * ```
   */
  async me(): Promise<AuthUser | null> {
    const tokens = await this.config.storage.getTokens();
    if (!tokens) {
      return null;
    }

    try {
      // Build headers - X-API-Key is optional for auth endpoints (TASK-501)
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${tokens.accessToken}`,
      };
      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      const response = await fetch(`${this.config.baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear storage
          await this.config.storage.clearTokens();
          return null;
        }
        return null;
      }

      const userData = await response.json() as UserInfoResponse;
      return this.mapUser(userData);
    } catch {
      return null;
    }
  }

  /**
   * Log out the current user.
   * Clears tokens and optionally revokes session on server.
   *
   * @param revokeSession - Whether to revoke server session (default: true)
   */
  async logout(revokeSession: boolean = true): Promise<void> {
    if (revokeSession) {
      const tokens = await this.config.storage.getTokens();
      if (tokens) {
        try {
          // Build headers - X-API-Key is optional for auth endpoints (TASK-501)
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${tokens.accessToken}`,
          };
          if (this.config.apiKey) {
            headers['X-API-Key'] = this.config.apiKey;
          }

          await fetch(`${this.config.baseUrl}/api/v1/auth/logout`, {
            method: 'POST',
            headers,
          });
        } catch {
          // Ignore errors during logout
        }
      }
    }

    await this.config.storage.clearTokens();
  }

  /**
   * Make an authenticated API request.
   * X-API-Key is optional for auth endpoints (TASK-501).
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    // Build headers - X-API-Key is optional for auth endpoints
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.config.baseUrl}${path}`, options);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as ApiError;
      throw this.mapApiError(errorBody, response.status);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Map API error response to AuthenticationError.
   */
  private mapApiError(error: ApiError, statusCode: number): AuthenticationError {
    const message = error.message ?? error.error ?? 'Request failed';
    const code = this.mapErrorCode(error.error_code ?? error.error ?? '');

    return new AuthenticationError(message, code, statusCode, error.details);
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
      'password_too_weak': 'PASSWORD_TOO_WEAK',
      'email_already_exists': 'EMAIL_ALREADY_EXISTS',
      'invalid_reset_token': 'INVALID_RESET_TOKEN',
      'reset_token_expired': 'RESET_TOKEN_EXPIRED',
    };

    return codeMap[code.toLowerCase()] ?? 'UNKNOWN_ERROR';
  }

  /**
   * Map user response to AuthUser.
   */
  private mapUser(userData: UserInfoResponse): AuthUser {
    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      emailVerified: userData.emailVerified,
      createdAt: new Date(userData.createdAt),
    };

    if (userData.name) {
      user.name = userData.name;
    }
    if (userData.avatarUrl) {
      user.avatarUrl = userData.avatarUrl;
    }
    if (userData.updatedAt) {
      user.updatedAt = new Date(userData.updatedAt);
    }
    if (userData.metadata) {
      user.metadata = userData.metadata;
    }

    return user;
  }
}
