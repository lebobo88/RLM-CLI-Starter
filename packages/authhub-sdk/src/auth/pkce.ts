/**
 * AuthHub SDK PKCE Utilities
 *
 * Proof Key for Code Exchange (PKCE) implementation for secure OAuth flows.
 * RFC 7636: https://tools.ietf.org/html/rfc7636
 *
 * @module @authhub/sdk/auth/pkce
 * @feature FTR-051
 */

// ============================================================================
// Constants
// ============================================================================

/** Length of the code verifier in bytes (recommended: 32-96 bytes) */
const CODE_VERIFIER_LENGTH = 64;

/** Characters used for base64url encoding */
const BASE64URL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// ============================================================================
// Types
// ============================================================================

/**
 * PKCE code pair containing verifier and challenge.
 */
export interface PKCECodePair {
  /** Code verifier - random string sent with token request */
  codeVerifier: string;
  /** Code challenge - SHA256 hash of verifier, sent with authorization request */
  codeChallenge: string;
  /** Challenge method (always 'S256' for this implementation) */
  codeChallengeMethod: 'S256';
}

// ============================================================================
// Crypto Utilities
// ============================================================================

/**
 * Generate cryptographically secure random bytes.
 *
 * @param length - Number of bytes to generate
 * @returns Uint8Array of random bytes
 * @throws {Error} If crypto API is not available
 */
function getRandomBytes(length: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  throw new Error(
    'Crypto API not available. PKCE requires a secure random number generator.'
  );
}

/**
 * Compute SHA-256 hash of a string.
 *
 * @param input - String to hash
 * @returns Promise resolving to Uint8Array hash
 * @throws {Error} If SubtleCrypto is not available
 */
async function sha256(input: string): Promise<Uint8Array> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }

  throw new Error(
    'SubtleCrypto API not available. PKCE requires SHA-256 hashing capability.'
  );
}

/**
 * Encode bytes to base64url string (URL-safe base64 without padding).
 *
 * Uses btoa in browser environments, with a manual fallback for Node.js.
 *
 * @param bytes - Bytes to encode
 * @returns Base64url encoded string
 */
function base64urlEncode(bytes: Uint8Array): string {
  // Use btoa if available (browsers)
  if (typeof btoa !== 'undefined') {
    const binaryString = String.fromCharCode(...bytes);
    const base64 = btoa(binaryString);
    // Convert standard base64 to base64url
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  // Node.js fallback using Buffer
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Manual encoding as last resort
  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i] ?? 0;
    const b2 = bytes[i + 1] ?? 0;
    const b3 = bytes[i + 2] ?? 0;

    result += BASE64URL_CHARS[b1 >> 2];
    result += BASE64URL_CHARS[((b1 & 3) << 4) | (b2 >> 4)];

    if (i + 1 < len) {
      result += BASE64URL_CHARS[((b2 & 15) << 2) | (b3 >> 6)];
    }

    if (i + 2 < len) {
      result += BASE64URL_CHARS[b3 & 63];
    }
  }

  return result;
}

// ============================================================================
// PKCE Functions
// ============================================================================

/**
 * Generate a cryptographically random code verifier.
 *
 * The code verifier is a high-entropy random string between 43-128 characters
 * using unreserved characters (A-Z, a-z, 0-9, -, ., _, ~).
 *
 * @returns Code verifier string
 *
 * @example
 * ```typescript
 * const verifier = generateCodeVerifier();
 * // Returns something like: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
 * ```
 */
export function generateCodeVerifier(): string {
  const randomBytes = getRandomBytes(CODE_VERIFIER_LENGTH);
  return base64urlEncode(randomBytes);
}

/**
 * Generate the code challenge from a code verifier using SHA-256.
 *
 * @param verifier - The code verifier string
 * @returns Promise resolving to the code challenge
 *
 * @example
 * ```typescript
 * const verifier = generateCodeVerifier();
 * const challenge = await generateCodeChallenge(verifier);
 * // challenge is the base64url-encoded SHA-256 hash of verifier
 * ```
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await sha256(verifier);
  return base64urlEncode(hash);
}

/**
 * Generate a complete PKCE code pair (verifier + challenge).
 *
 * @returns Promise resolving to PKCECodePair
 *
 * @example
 * ```typescript
 * const pkce = await generatePKCECodePair();
 *
 * // Store verifier securely (e.g., sessionStorage)
 * sessionStorage.setItem('pkce_verifier', pkce.codeVerifier);
 *
 * // Send challenge with authorization request
 * const authUrl = new URL('https://auth.example.com/authorize');
 * authUrl.searchParams.set('code_challenge', pkce.codeChallenge);
 * authUrl.searchParams.set('code_challenge_method', pkce.codeChallengeMethod);
 * ```
 */
export async function generatePKCECodePair(): Promise<PKCECodePair> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

// ============================================================================
// State Parameter
// ============================================================================

/**
 * Generate a cryptographically random state parameter.
 *
 * The state parameter is used for CSRF protection in OAuth flows.
 * It should be stored before redirect and validated on callback.
 *
 * @param length - Length of random bytes (default: 32)
 * @returns Random state string
 *
 * @example
 * ```typescript
 * const state = generateState();
 * sessionStorage.setItem('oauth_state', state);
 *
 * // Include state in authorization URL
 * authUrl.searchParams.set('state', state);
 *
 * // On callback, validate state matches
 * const callbackState = new URLSearchParams(location.search).get('state');
 * if (callbackState !== sessionStorage.getItem('oauth_state')) {
 *   throw new Error('Invalid state parameter');
 * }
 * ```
 */
export function generateState(length: number = 32): string {
  const randomBytes = getRandomBytes(length);
  return base64urlEncode(randomBytes);
}

// ============================================================================
// Storage Keys
// ============================================================================

/** Storage key for PKCE code verifier */
export const PKCE_VERIFIER_KEY = 'authhub_pkce_verifier';

/** Storage key for OAuth state parameter */
export const OAUTH_STATE_KEY = 'authhub_oauth_state';

/** Storage key for redirect target after auth */
export const REDIRECT_TARGET_KEY = 'authhub_redirect_target';

/** Storage key for timestamp to prevent replay attacks */
export const PKCE_TIMESTAMP_KEY = 'authhub_pkce_timestamp';

/** Maximum age for PKCE data in milliseconds (10 minutes) */
export const PKCE_MAX_AGE_MS = 10 * 60 * 1000;

// ============================================================================
// Session Storage Helpers
// ============================================================================

/**
 * Store PKCE data in sessionStorage for callback validation.
 *
 * @param codeVerifier - PKCE code verifier
 * @param state - OAuth state parameter
 * @param redirectTarget - Optional URL to redirect to after auth
 *
 * @example
 * ```typescript
 * const pkce = await generatePKCECodePair();
 * const state = generateState();
 *
 * storePKCEData(pkce.codeVerifier, state, '/dashboard');
 *
 * // Later, on callback:
 * const { codeVerifier, state, redirectTarget } = retrievePKCEData();
 * ```
 */
export function storePKCEData(
  codeVerifier: string,
  state: string,
  redirectTarget?: string
): void {
  if (typeof sessionStorage === 'undefined') {
    console.warn('AuthHub: sessionStorage not available, PKCE data will not persist');
    return;
  }

  sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  sessionStorage.setItem(PKCE_TIMESTAMP_KEY, Date.now().toString());

  if (redirectTarget) {
    sessionStorage.setItem(REDIRECT_TARGET_KEY, redirectTarget);
  }
}

/**
 * Retrieve stored PKCE data from sessionStorage.
 *
 * Returns null values if data has expired (older than PKCE_MAX_AGE_MS).
 * This prevents replay attacks using stale PKCE data.
 *
 * @returns Object with codeVerifier, state, timestamp, and optional redirectTarget
 */
export function retrievePKCEData(): {
  codeVerifier: string | null;
  state: string | null;
  redirectTarget: string | null;
  timestamp: number | null;
  isExpired: boolean;
} {
  if (typeof sessionStorage === 'undefined') {
    return { codeVerifier: null, state: null, redirectTarget: null, timestamp: null, isExpired: true };
  }

  const timestampStr = sessionStorage.getItem(PKCE_TIMESTAMP_KEY);
  const timestamp = timestampStr ? parseInt(timestampStr, 10) : null;
  const isExpired = timestamp ? Date.now() - timestamp > PKCE_MAX_AGE_MS : true;

  // If expired, clear the data and return null values
  if (isExpired && timestamp !== null) {
    clearPKCEData();
    return { codeVerifier: null, state: null, redirectTarget: null, timestamp, isExpired: true };
  }

  return {
    codeVerifier: sessionStorage.getItem(PKCE_VERIFIER_KEY),
    state: sessionStorage.getItem(OAUTH_STATE_KEY),
    redirectTarget: sessionStorage.getItem(REDIRECT_TARGET_KEY),
    timestamp,
    isExpired,
  };
}

/**
 * Clear stored PKCE data from sessionStorage.
 */
export function clearPKCEData(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(REDIRECT_TARGET_KEY);
  sessionStorage.removeItem(PKCE_TIMESTAMP_KEY);
}
