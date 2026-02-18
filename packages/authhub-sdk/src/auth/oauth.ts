/**
 * AuthHub SDK OAuth Methods
 *
 * OAuth URL generation and callback parsing for third-party authentication.
 *
 * @module @authhub/sdk/auth/oauth
 * @task TASK-461
 * @feature OAuth SDK Methods and Dashboard Integration
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Supported OAuth providers.
 */
export enum OAuthProvider {
  Google = 'google',
  GitHub = 'github',
}

/**
 * Options for generating OAuth URLs.
 */
export interface OAuthUrlOptions {
  /**
   * Optional state parameter for CSRF protection.
   * If not provided, you should generate one client-side.
   */
  state?: string;

  /**
   * Optional scope override.
   * Defaults to provider-specific scopes configured in AuthHub.
   */
  scope?: string;

  /**
   * Optional prompt parameter for Google OAuth.
   * - 'none': No prompt
   * - 'consent': Force consent screen
   * - 'select_account': Force account selection
   */
  prompt?: 'none' | 'consent' | 'select_account';
}

/**
 * Result of parsing an OAuth callback URL.
 */
export interface OAuthCallbackResult {
  /** Access token (implicit flow) */
  accessToken?: string;

  /** Refresh token (if provided) */
  refreshToken?: string;

  /** Token type (usually 'Bearer') */
  tokenType?: string;

  /** Token expiration in seconds */
  expiresIn?: number;

  /** State parameter for CSRF validation */
  state?: string;

  /** Authorization code (authorization code flow) */
  code?: string;

  /** Error code */
  error?: string;

  /** Error description */
  errorDescription?: string;
}

// ============================================================================
// URL Generation Functions
// ============================================================================

/**
 * Build OAuth URL base with common parameters.
 *
 * @param baseUrl - AuthHub API base URL
 * @param provider - OAuth provider
 * @param appId - Application ID
 * @param redirectUri - Redirect URI after OAuth
 * @param options - Additional options
 * @returns OAuth URL
 * @internal
 */
function buildOAuthUrl(
  baseUrl: string,
  provider: OAuthProvider,
  appId: string,
  redirectUri: string,
  options?: OAuthUrlOptions
): string {
  // Normalize base URL (remove trailing slash)
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  const params = new URLSearchParams();
  params.set('redirect_uri', redirectUri);
  params.set('app_id', appId);

  if (options?.state) {
    params.set('state', options.state);
  }

  if (options?.scope) {
    params.set('scope', options.scope);
  }

  if (options?.prompt) {
    params.set('prompt', options.prompt);
  }

  return `${normalizedBaseUrl}/api/v1/auth/oauth/${provider}?${params.toString()}`;
}

/**
 * Generate Google OAuth authorization URL.
 *
 * @param baseUrl - AuthHub API base URL
 * @param appId - Application ID registered with AuthHub
 * @param redirectUri - URL to redirect to after OAuth (must be registered)
 * @param options - Additional OAuth options
 * @returns Google OAuth authorization URL
 *
 * @example
 * ```typescript
 * const url = getGoogleAuthUrl(
 *   'https://authhub.example.com',
 *   'app_abc123',
 *   'https://myapp.com/auth/callback'
 * );
 * window.location.href = url;
 * ```
 */
export function getGoogleAuthUrl(
  baseUrl: string,
  appId: string,
  redirectUri: string,
  options?: OAuthUrlOptions
): string {
  return buildOAuthUrl(baseUrl, OAuthProvider.Google, appId, redirectUri, options);
}

/**
 * Generate GitHub OAuth authorization URL.
 *
 * @param baseUrl - AuthHub API base URL
 * @param appId - Application ID registered with AuthHub
 * @param redirectUri - URL to redirect to after OAuth (must be registered)
 * @param options - Additional OAuth options
 * @returns GitHub OAuth authorization URL
 *
 * @example
 * ```typescript
 * const url = getGitHubAuthUrl(
 *   'https://authhub.example.com',
 *   'app_abc123',
 *   'https://myapp.com/auth/callback'
 * );
 * window.location.href = url;
 * ```
 */
export function getGitHubAuthUrl(
  baseUrl: string,
  appId: string,
  redirectUri: string,
  options?: OAuthUrlOptions
): string {
  return buildOAuthUrl(baseUrl, OAuthProvider.GitHub, appId, redirectUri, options);
}

/**
 * Generate OAuth authorization URL for a specific provider.
 *
 * @param baseUrl - AuthHub API base URL
 * @param provider - OAuth provider
 * @param appId - Application ID registered with AuthHub
 * @param redirectUri - URL to redirect to after OAuth (must be registered)
 * @param options - Additional OAuth options
 * @returns OAuth authorization URL
 *
 * @example
 * ```typescript
 * const url = getOAuthUrl(
 *   'https://authhub.example.com',
 *   OAuthProvider.Google,
 *   'app_abc123',
 *   'https://myapp.com/auth/callback',
 *   { state: 'random_state_value' }
 * );
 * ```
 */
export function getOAuthUrl(
  baseUrl: string,
  provider: OAuthProvider,
  appId: string,
  redirectUri: string,
  options?: OAuthUrlOptions
): string {
  return buildOAuthUrl(baseUrl, provider, appId, redirectUri, options);
}

// ============================================================================
// Callback Parsing Functions
// ============================================================================

/**
 * Parse OAuth callback result from URL.
 *
 * Handles both implicit flow (tokens in hash fragment) and
 * authorization code flow (code in query parameters).
 *
 * @param url - Callback URL to parse
 * @returns Parsed callback result or null if no OAuth parameters found
 *
 * @example
 * ```typescript
 * // Implicit flow (hash fragment)
 * const result = parseOAuthCallbackResult(
 *   'https://myapp.com/callback#access_token=abc123&token_type=Bearer'
 * );
 * if (result?.accessToken) {
 *   // Use token
 * }
 *
 * // Authorization code flow (query params)
 * const result = parseOAuthCallbackResult(
 *   'https://myapp.com/callback?code=auth_code_123&state=xyz'
 * );
 * if (result?.code) {
 *   // Exchange code for tokens
 * }
 *
 * // Error handling
 * const result = parseOAuthCallbackResult(
 *   'https://myapp.com/callback?error=access_denied&error_description=User%20denied'
 * );
 * if (result?.error) {
 *   console.error(result.errorDescription);
 * }
 * ```
 */
export function parseOAuthCallbackResult(url: string): OAuthCallbackResult | null {
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return null;
  }

  const result: OAuthCallbackResult = {};
  let hasParams = false;

  // First, check hash fragment (implicit flow takes precedence)
  const hash = urlObj.hash.slice(1); // Remove leading #
  if (hash) {
    const hashParams = new URLSearchParams(hash);

    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      result.accessToken = accessToken;
      hasParams = true;
    }

    const refreshToken = hashParams.get('refresh_token');
    if (refreshToken) {
      result.refreshToken = refreshToken;
      hasParams = true;
    }

    const tokenType = hashParams.get('token_type');
    if (tokenType) {
      result.tokenType = tokenType;
      hasParams = true;
    }

    const expiresIn = hashParams.get('expires_in');
    if (expiresIn) {
      const parsed = parseInt(expiresIn, 10);
      if (!isNaN(parsed)) {
        result.expiresIn = parsed;
        hasParams = true;
      }
    }

    const state = hashParams.get('state');
    if (state) {
      result.state = state;
      hasParams = true;
    }

    const error = hashParams.get('error');
    if (error) {
      result.error = error;
      hasParams = true;
    }

    const errorDescription = hashParams.get('error_description');
    if (errorDescription) {
      result.errorDescription = errorDescription;
      hasParams = true;
    }
  }

  // Then check query parameters (authorization code flow)
  // Only add if not already found in hash
  const searchParams = urlObj.searchParams;

  const code = searchParams.get('code');
  if (code && !result.accessToken) {
    result.code = code;
    hasParams = true;
  }

  const state = searchParams.get('state');
  if (state && !result.state) {
    result.state = state;
    hasParams = true;
  }

  const error = searchParams.get('error');
  if (error && !result.error) {
    result.error = error;
    hasParams = true;
  }

  const errorDescription = searchParams.get('error_description');
  if (errorDescription && !result.errorDescription) {
    result.errorDescription = errorDescription;
    hasParams = true;
  }

  return hasParams ? result : null;
}

/**
 * Check if a URL contains OAuth callback parameters.
 *
 * @param url - URL to check
 * @returns True if URL contains OAuth callback parameters
 */
export function hasOAuthCallback(url: string): boolean {
  const result = parseOAuthCallbackResult(url);
  return result !== null && (
    Boolean(result.accessToken) ||
    Boolean(result.code) ||
    Boolean(result.error)
  );
}

/**
 * Check if a URL contains an OAuth error.
 *
 * @param url - URL to check
 * @returns True if URL contains OAuth error
 */
export function hasOAuthError(url: string): boolean {
  const result = parseOAuthCallbackResult(url);
  return result !== null && Boolean(result.error);
}

/**
 * Extract OAuth error details from URL.
 *
 * @param url - URL to parse
 * @returns Error details or null if no error
 */
export function getOAuthError(url: string): { error: string; description?: string } | null {
  const result = parseOAuthCallbackResult(url);
  if (!result?.error) {
    return null;
  }

  const errorResult: { error: string; description?: string } = {
    error: result.error,
  };

  if (result.errorDescription) {
    errorResult.description = result.errorDescription;
  }

  return errorResult;
}
