"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AIError: () => AIError,
  AIModule: () => AIModule,
  AuthClient: () => AuthClient,
  AuthError: () => AuthError,
  AuthHubClient: () => AuthHubClient,
  AuthHubError: () => AuthHubError,
  AuthenticationError: () => AuthenticationError,
  DBModule: () => DBModule,
  DebugModule: () => DebugModule,
  LocalStorageTokenStorage: () => LocalStorageTokenStorage,
  MemoryTokenStorage: () => MemoryTokenStorage,
  NetworkError: () => NetworkError,
  NotFoundError: () => NotFoundError,
  OAuthProvider: () => OAuthProvider,
  RateLimitError: () => RateLimitError,
  SDK_CLIENT: () => SDK_CLIENT,
  SDK_VERSION: () => SDK_VERSION,
  SecretsModule: () => SecretsModule,
  ServerError: () => ServerError,
  SessionStorageTokenStorage: () => SessionStorageTokenStorage,
  ValidationError: () => ValidationError,
  createAuthClient: () => createAuthClient,
  createStoredTokenData: () => createStoredTokenData,
  createTokenStorage: () => createTokenStorage,
  getGitHubAuthUrl: () => getGitHubAuthUrl,
  getGoogleAuthUrl: () => getGoogleAuthUrl,
  getOAuthError: () => getOAuthError,
  getOAuthUrl: () => getOAuthUrl,
  getTokenExpiresIn: () => getTokenExpiresIn,
  hasOAuthCallback: () => hasOAuthCallback,
  hasOAuthError: () => hasOAuthError,
  isTokenExpired: () => isTokenExpired,
  parseOAuthCallbackResult: () => parseOAuthCallbackResult
});
module.exports = __toCommonJS(index_exports);

// src/auth/types.ts
var AuthenticationError = class _AuthenticationError extends Error {
  constructor(message, code, statusCode, details) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isRetryable = [
      "NETWORK_ERROR",
      "SERVER_ERROR",
      "TOKEN_EXPIRED"
    ].includes(code);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _AuthenticationError);
    }
  }
  /**
   * Get a user-friendly error message.
   */
  get userMessage() {
    switch (this.code) {
      case "INVALID_CREDENTIALS":
        return "Invalid email or password. Please try again.";
      case "EMAIL_NOT_VERIFIED":
        return "Please verify your email address before signing in.";
      case "ACCOUNT_LOCKED":
        return "Your account has been temporarily locked. Please try again later.";
      case "ACCOUNT_DISABLED":
        return "Your account has been disabled. Please contact support.";
      case "SESSION_EXPIRED":
        return "Your session has expired. Please sign in again.";
      case "TOKEN_EXPIRED":
        return "Your session has expired. Please sign in again.";
      case "TOKEN_INVALID":
        return "Invalid authentication. Please sign in again.";
      case "TOKEN_REUSE_DETECTED":
        return "Security alert: Session may be compromised. Please sign in again.";
      case "MAX_SESSIONS_EXCEEDED":
        return "Maximum sessions exceeded. Please sign out from another device.";
      case "PASSWORD_TOO_WEAK":
        return "Password is too weak. Please use a stronger password.";
      case "EMAIL_ALREADY_EXISTS":
        return "An account with this email already exists.";
      case "INVALID_RESET_TOKEN":
        return "Invalid password reset link. Please request a new one.";
      case "RESET_TOKEN_EXPIRED":
        return "Password reset link has expired. Please request a new one.";
      case "NETWORK_ERROR":
        return "Network error. Please check your connection and try again.";
      case "SERVER_ERROR":
        return "Server error. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
  /**
   * Get troubleshooting suggestions.
   */
  get suggestion() {
    switch (this.code) {
      case "INVALID_CREDENTIALS":
        return 'Double-check your email and password. Use "Forgot Password" if needed.';
      case "EMAIL_NOT_VERIFIED":
        return "Check your email inbox (and spam folder) for the verification link.";
      case "ACCOUNT_LOCKED":
        return "Wait 15 minutes or contact support to unlock your account.";
      case "TOKEN_REUSE_DETECTED":
        return "For security, sign out from all devices and change your password.";
      case "PASSWORD_TOO_WEAK":
        return "Use at least 8 characters with uppercase, lowercase, number, and special character.";
      default:
        return "";
    }
  }
};

// src/auth/storage.ts
var DEFAULT_KEY_PREFIX = "authhub_";
var TOKENS_KEY = "tokens";
var BrowserTokenStorage = class {
  constructor(keyPrefix = DEFAULT_KEY_PREFIX) {
    this.keyPrefix = keyPrefix;
  }
  /**
   * Get the full storage key for tokens.
   */
  get storageKey() {
    return `${this.keyPrefix}${TOKENS_KEY}`;
  }
  /**
   * Check if storage is available.
   */
  isStorageAvailable() {
    if (!this.storage) {
      return false;
    }
    try {
      const testKey = `${this.keyPrefix}test`;
      this.storage.setItem(testKey, "test");
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
  getTokens() {
    if (!this.isStorageAvailable()) {
      return null;
    }
    try {
      const stored = this.storage.getItem(this.storageKey);
      if (!stored) {
        return null;
      }
      const data = JSON.parse(stored);
      if (this.isExpired(data.expiresAt)) {
        this.clearTokens();
        return null;
      }
      return data;
    } catch {
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
  setTokens(tokens) {
    if (!this.isStorageAvailable()) {
      console.warn("AuthHub: Storage not available, tokens will not persist");
      return;
    }
    try {
      const serialized = JSON.stringify(tokens);
      this.storage.setItem(this.storageKey, serialized);
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new Error("Storage quota exceeded. Please clear some data and try again.");
      }
      throw error;
    }
  }
  /**
   * Clear all stored tokens.
   */
  clearTokens() {
    if (!this.isStorageAvailable()) {
      return;
    }
    try {
      this.storage.removeItem(this.storageKey);
    } catch {
    }
  }
  /**
   * Check if a timestamp is expired.
   *
   * @param expiresAt - Expiration timestamp in milliseconds
   * @returns True if expired
   */
  isExpired(expiresAt) {
    return Date.now() >= expiresAt;
  }
};
var LocalStorageTokenStorage = class extends BrowserTokenStorage {
  /**
   * Create a new localStorage token storage.
   *
   * @param keyPrefix - Prefix for storage keys (default: 'authhub_')
   */
  constructor(keyPrefix = DEFAULT_KEY_PREFIX) {
    super(keyPrefix);
    this.storage = typeof window !== "undefined" ? window.localStorage : null;
  }
};
var SessionStorageTokenStorage = class extends BrowserTokenStorage {
  /**
   * Create a new sessionStorage token storage.
   *
   * @param keyPrefix - Prefix for storage keys (default: 'authhub_')
   */
  constructor(keyPrefix = DEFAULT_KEY_PREFIX) {
    super(keyPrefix);
    this.storage = typeof window !== "undefined" ? window.sessionStorage : null;
  }
};
var MemoryTokenStorage = class {
  constructor() {
    this.tokens = null;
  }
  /**
   * Retrieve stored tokens.
   * Returns null if tokens don't exist or are expired.
   */
  getTokens() {
    if (!this.tokens) {
      return null;
    }
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
  setTokens(tokens) {
    this.tokens = { ...tokens };
  }
  /**
   * Clear stored tokens from memory.
   */
  clearTokens() {
    this.tokens = null;
  }
};
var CookieTokenStorage = class {
  constructor() {
    this._isAuthenticated = false;
    this._expiresAt = null;
  }
  /**
   * Get tokens - returns metadata only since actual tokens are in httpOnly cookies.
   * Auth state is determined by server response, not local storage.
   *
   * @returns Token data with empty accessToken (actual token in cookie) or null if not authenticated/expired
   */
  getTokens() {
    if (this._isAuthenticated && this._expiresAt && Date.now() < this._expiresAt) {
      return {
        accessToken: "",
        // Placeholder - actual token in cookie
        expiresAt: this._expiresAt,
        tokenType: "Bearer"
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
  setTokens(tokens) {
    this._isAuthenticated = true;
    this._expiresAt = tokens.expiresAt;
  }
  /**
   * Clear tokens - clears local authentication state.
   * Note: Actual cookie clearing must be done by the server via Set-Cookie with maxAge=0.
   */
  clearTokens() {
    this._isAuthenticated = false;
    this._expiresAt = null;
  }
  /**
   * Check if user is authenticated based on cached state.
   * Note: For true authentication status, check with the server.
   *
   * @returns True if authenticated and not expired
   */
  isAuthenticated() {
    if (!this._isAuthenticated || !this._expiresAt) {
      return false;
    }
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
  isCookieMode() {
    return true;
  }
};
function createTokenStorage(type, keyPrefix = DEFAULT_KEY_PREFIX) {
  switch (type) {
    case "localStorage":
      return new LocalStorageTokenStorage(keyPrefix);
    case "sessionStorage":
      return new SessionStorageTokenStorage(keyPrefix);
    case "memory":
      return new MemoryTokenStorage();
    case "cookie":
      return new CookieTokenStorage();
    default:
      throw new Error(`Unknown storage type: ${type}`);
  }
}
function isTokenExpired(tokens, thresholdSeconds = 0) {
  const thresholdMs = thresholdSeconds * 1e3;
  return Date.now() + thresholdMs >= tokens.expiresAt;
}
function getTokenExpiresIn(tokens) {
  return tokens.expiresAt - Date.now();
}
function createStoredTokenData(accessToken, expiresIn, refreshToken, tokenType = "Bearer") {
  const data = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1e3,
    tokenType
  };
  if (refreshToken !== void 0) {
    data.refreshToken = refreshToken;
  }
  return data;
}

// src/auth/pkce.ts
var CODE_VERIFIER_LENGTH = 64;
var BASE64URL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
function getRandomBytes(length) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
  }
  throw new Error(
    "Crypto API not available. PKCE requires a secure random number generator."
  );
}
async function sha256(input) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return new Uint8Array(hashBuffer);
  }
  throw new Error(
    "SubtleCrypto API not available. PKCE requires SHA-256 hashing capability."
  );
}
function base64urlEncode(bytes) {
  if (typeof btoa !== "undefined") {
    const binaryString = String.fromCharCode(...bytes);
    const base64 = btoa(binaryString);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i] ?? 0;
    const b2 = bytes[i + 1] ?? 0;
    const b3 = bytes[i + 2] ?? 0;
    result += BASE64URL_CHARS[b1 >> 2];
    result += BASE64URL_CHARS[(b1 & 3) << 4 | b2 >> 4];
    if (i + 1 < len) {
      result += BASE64URL_CHARS[(b2 & 15) << 2 | b3 >> 6];
    }
    if (i + 2 < len) {
      result += BASE64URL_CHARS[b3 & 63];
    }
  }
  return result;
}
function generateCodeVerifier() {
  const randomBytes = getRandomBytes(CODE_VERIFIER_LENGTH);
  return base64urlEncode(randomBytes);
}
async function generateCodeChallenge(verifier) {
  const hash = await sha256(verifier);
  return base64urlEncode(hash);
}
async function generatePKCECodePair() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256"
  };
}
function generateState(length = 32) {
  const randomBytes = getRandomBytes(length);
  return base64urlEncode(randomBytes);
}
var PKCE_VERIFIER_KEY = "authhub_pkce_verifier";
var OAUTH_STATE_KEY = "authhub_oauth_state";
var REDIRECT_TARGET_KEY = "authhub_redirect_target";
var PKCE_TIMESTAMP_KEY = "authhub_pkce_timestamp";
var PKCE_MAX_AGE_MS = 10 * 60 * 1e3;
function storePKCEData(codeVerifier, state, redirectTarget) {
  if (typeof sessionStorage === "undefined") {
    console.warn("AuthHub: sessionStorage not available, PKCE data will not persist");
    return;
  }
  sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  sessionStorage.setItem(PKCE_TIMESTAMP_KEY, Date.now().toString());
  if (redirectTarget) {
    sessionStorage.setItem(REDIRECT_TARGET_KEY, redirectTarget);
  }
}
function retrievePKCEData() {
  if (typeof sessionStorage === "undefined") {
    return { codeVerifier: null, state: null, redirectTarget: null, timestamp: null, isExpired: true };
  }
  const timestampStr = sessionStorage.getItem(PKCE_TIMESTAMP_KEY);
  const timestamp = timestampStr ? parseInt(timestampStr, 10) : null;
  const isExpired = timestamp ? Date.now() - timestamp > PKCE_MAX_AGE_MS : true;
  if (isExpired && timestamp !== null) {
    clearPKCEData();
    return { codeVerifier: null, state: null, redirectTarget: null, timestamp, isExpired: true };
  }
  return {
    codeVerifier: sessionStorage.getItem(PKCE_VERIFIER_KEY),
    state: sessionStorage.getItem(OAUTH_STATE_KEY),
    redirectTarget: sessionStorage.getItem(REDIRECT_TARGET_KEY),
    timestamp,
    isExpired
  };
}
function clearPKCEData() {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(REDIRECT_TARGET_KEY);
  sessionStorage.removeItem(PKCE_TIMESTAMP_KEY);
}

// src/auth/redirect.ts
var RedirectMode = class {
  constructor(config) {
    this.config = config;
  }
  /**
   * Build the authorization URL for OAuth flow.
   *
   * @param endpoint - Auth portal endpoint ('login' | 'register')
   * @param options - Redirect options
   * @returns Authorization URL and generated state
   */
  async buildAuthUrl(endpoint, options = {}) {
    const pkce = await generatePKCECodePair();
    const state = options.state ?? generateState();
    const authUrl = new URL(`/auth/${endpoint}`, this.config.baseUrl);
    authUrl.searchParams.set("app", this.config.appSlug);
    authUrl.searchParams.set("redirect_uri", options.redirectUri ?? this.config.callbackUrl);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge", pkce.codeChallenge);
    authUrl.searchParams.set("code_challenge_method", pkce.codeChallengeMethod);
    if (this.config.storageMode === "cookie") {
      authUrl.searchParams.set("storage_mode", "cookie");
    }
    if (options.additionalParams) {
      for (const [key, value] of Object.entries(options.additionalParams)) {
        authUrl.searchParams.set(key, value);
      }
    }
    return {
      url: authUrl.toString(),
      state,
      codeVerifier: pkce.codeVerifier
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
  async login(options = {}) {
    const { url, state, codeVerifier } = await this.buildAuthUrl("login", options);
    storePKCEData(codeVerifier, state, options.returnTo);
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
  async register(options = {}) {
    const additionalParams = { ...options.additionalParams };
    if (options.email) {
      additionalParams["email"] = options.email;
    }
    if (options.name) {
      additionalParams["name"] = options.name;
    }
    const { url, state, codeVerifier } = await this.buildAuthUrl("register", {
      ...options,
      additionalParams
    });
    storePKCEData(codeVerifier, state, options.returnTo);
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
  async logout(options = {}) {
    await this.config.storage.clearTokens();
    if (options.redirectToAuthHub) {
      const logoutUrl = new URL("/auth/logout", this.config.baseUrl);
      logoutUrl.searchParams.set("app", this.config.appSlug);
      if (options.returnTo) {
        logoutUrl.searchParams.set("redirect_uri", options.returnTo);
      }
      if (options.globalLogout) {
        logoutUrl.searchParams.set("global", "true");
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
  async getLoginUrl(options = {}) {
    return this.buildAuthUrl("login", options);
  }
  /**
   * Get the register URL without redirecting.
   *
   * @param options - Registration options
   * @returns Promise with URL, state, and code verifier
   */
  async getRegisterUrl(options = {}) {
    const additionalParams = { ...options.additionalParams };
    if (options.email) {
      additionalParams["email"] = options.email;
    }
    if (options.name) {
      additionalParams["name"] = options.name;
    }
    return this.buildAuthUrl("register", {
      ...options,
      additionalParams
    });
  }
  /**
   * Get the logout URL.
   *
   * @param options - Logout options
   * @returns Logout URL
   */
  getLogoutUrl(options = {}) {
    const logoutUrl = new URL("/auth/logout", this.config.baseUrl);
    logoutUrl.searchParams.set("app", this.config.appSlug);
    if (options.returnTo) {
      logoutUrl.searchParams.set("redirect_uri", options.returnTo);
    }
    if (options.globalLogout) {
      logoutUrl.searchParams.set("global", "true");
    }
    return logoutUrl.toString();
  }
  /**
   * Redirect the browser to a URL.
   *
   * @param url - URL to redirect to
   */
  redirect(url) {
    if (typeof window !== "undefined") {
      window.location.href = url;
    } else {
      throw new Error(
        "Cannot redirect: window is not available. Use getLoginUrl() or getRegisterUrl() for server-side rendering."
      );
    }
  }
};

// src/auth/callback.ts
var CallbackHandler = class {
  constructor(config) {
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
  async handleCallback(url) {
    try {
      const params = this.parseCallbackUrl(url);
      if (params.error) {
        return this.createErrorResult(params.error, params.error_description);
      }
      if (!params.code) {
        return this.createErrorResult("missing_code", "Authorization code not found in callback URL");
      }
      const pkceData = retrievePKCEData();
      if (pkceData.isExpired) {
        return this.createErrorResult("state_expired", "Authentication session expired. Please try logging in again.");
      }
      if (!pkceData.state) {
        return this.createErrorResult("missing_state", "OAuth state not found. Session may have expired.");
      }
      if (params.state !== pkceData.state) {
        return this.createErrorResult("invalid_state", "OAuth state mismatch. Possible CSRF attack.");
      }
      if (!pkceData.codeVerifier) {
        return this.createErrorResult("missing_verifier", "PKCE code verifier not found. Session may have expired.");
      }
      const tokenResponse = await this.exchangeCodeForTokens(
        params.code,
        pkceData.codeVerifier
      );
      const tokenData = createStoredTokenData(
        tokenResponse.access_token,
        tokenResponse.expires_in,
        tokenResponse.refresh_token
      );
      await this.config.storage.setTokens(tokenData);
      const user = await this.getUserFromToken(tokenResponse.access_token);
      clearPKCEData();
      this.cleanupUrl();
      const result = {
        success: true,
        user,
        accessToken: tokenResponse.access_token,
        expiresAt: new Date(tokenData.expiresAt)
      };
      if (tokenResponse.refresh_token) {
        result.refreshToken = tokenResponse.refresh_token;
      }
      if (pkceData.redirectTarget) {
        result.redirectTo = pkceData.redirectTarget;
      }
      return result;
    } catch (error) {
      clearPKCEData();
      if (error instanceof AuthenticationError) {
        return {
          success: false,
          error
        };
      }
      const message = error instanceof Error ? error.message : "Unknown error during callback";
      return {
        success: false,
        error: new AuthenticationError(message, "UNKNOWN_ERROR")
      };
    }
  }
  /**
   * Parse the callback URL for OAuth parameters.
   *
   * @param url - URL to parse (defaults to window.location.href)
   * @returns Parsed OAuth callback parameters
   */
  parseCallbackUrl(url) {
    const targetUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
    const urlObj = new URL(targetUrl);
    const searchParams = urlObj.searchParams;
    const result = {};
    const code = searchParams.get("code");
    if (code) result.code = code;
    const state = searchParams.get("state");
    if (state) result.state = state;
    const error = searchParams.get("error");
    if (error) result.error = error;
    const errorDesc = searchParams.get("error_description");
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
  async exchangeCodeForTokens(code, codeVerifier) {
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/token`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.config.callbackUrl,
        code_verifier: codeVerifier,
        app: this.config.appSlug
      })
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody?.["error"] ?? "Token exchange failed";
      const errorCode = errorBody?.["error_code"] ?? "TOKEN_INVALID";
      throw new AuthenticationError(
        errorMessage,
        this.mapErrorCode(errorCode),
        response.status
      );
    }
    return response.json();
  }
  /**
   * Get user information from the access token.
   *
   * @param accessToken - Access token
   * @returns User information
   */
  async getUserFromToken(accessToken) {
    const headers = {
      "Authorization": `Bearer ${accessToken}`
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/me`, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      return {
        id: "unknown",
        email: "unknown",
        emailVerified: false,
        createdAt: /* @__PURE__ */ new Date()
      };
    }
    const userData = await response.json();
    const user = {
      id: String(userData["id"] ?? "unknown"),
      email: String(userData["email"] ?? "unknown"),
      emailVerified: Boolean(userData["emailVerified"]),
      createdAt: new Date(String(userData["createdAt"] ?? Date.now()))
    };
    if (userData["name"]) {
      user.name = String(userData["name"]);
    }
    if (userData["avatarUrl"]) {
      user.avatarUrl = String(userData["avatarUrl"]);
    }
    if (userData["updatedAt"]) {
      user.updatedAt = new Date(String(userData["updatedAt"]));
    }
    if (userData["metadata"]) {
      user.metadata = userData["metadata"];
    }
    return user;
  }
  /**
   * Map error code string to AuthErrorCode.
   */
  mapErrorCode(code) {
    const codeMap = {
      "invalid_credentials": "INVALID_CREDENTIALS",
      "email_not_verified": "EMAIL_NOT_VERIFIED",
      "account_locked": "ACCOUNT_LOCKED",
      "account_disabled": "ACCOUNT_DISABLED",
      "session_expired": "SESSION_EXPIRED",
      "token_expired": "TOKEN_EXPIRED",
      "token_invalid": "TOKEN_INVALID",
      "token_reuse_detected": "TOKEN_REUSE_DETECTED",
      "max_sessions_exceeded": "MAX_SESSIONS_EXCEEDED"
    };
    return codeMap[code.toLowerCase()] ?? "UNKNOWN_ERROR";
  }
  /**
   * Create an error result.
   */
  createErrorResult(error, description) {
    const message = description ?? error;
    return {
      success: false,
      error: new AuthenticationError(message, this.mapErrorCode(error))
    };
  }
  /**
   * Clean up the URL by removing OAuth parameters.
   */
  cleanupUrl() {
    if (typeof window === "undefined" || typeof history === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    url.searchParams.delete("error");
    url.searchParams.delete("error_description");
    history.replaceState({}, "", url.toString());
  }
};

// src/auth/embedded.ts
var EmbeddedMode = class {
  constructor(config) {
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
  async login(credentials) {
    try {
      const response = await this.request("POST", "/api/v1/auth/login", {
        email: credentials.email,
        password: credentials.password,
        app: this.config.appSlug
      });
      const tokenData = createStoredTokenData(
        response.access_token,
        response.expires_in,
        response.refresh_token
      );
      await this.config.storage.setTokens(tokenData);
      const result = {
        success: true,
        user: this.mapUser(response.user),
        accessToken: response.access_token,
        expiresAt: new Date(tokenData.expiresAt)
      };
      if (response.refresh_token) {
        result.refreshToken = response.refresh_token;
      }
      return result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : "Login failed";
      return {
        success: false,
        error: new AuthenticationError(message, "UNKNOWN_ERROR")
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
  async register(data) {
    try {
      const response = await this.request(
        "POST",
        "/api/v1/auth/register",
        {
          email: data.email,
          password: data.password,
          name: data.name,
          app: this.config.appSlug
        }
      );
      if (!response.requiresEmailVerification && response.access_token) {
        const tokenData = createStoredTokenData(
          response.access_token,
          response.expires_in,
          response.refresh_token
        );
        await this.config.storage.setTokens(tokenData);
      }
      const result = {
        success: true,
        user: this.mapUser(response.user)
      };
      if (response.requiresEmailVerification) {
        result.requiresEmailVerification = true;
      }
      return result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : "Registration failed";
      return {
        success: false,
        error: new AuthenticationError(message, "UNKNOWN_ERROR")
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
  async resendVerification(email) {
    try {
      await this.request("POST", "/api/v1/auth/resend-verification", {
        email,
        app: this.config.appSlug
      });
      return {
        success: true,
        message: "Verification email sent. Please check your inbox."
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : "Failed to send verification email";
      return {
        success: false,
        error: new AuthenticationError(message, "UNKNOWN_ERROR")
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
  async forgotPassword(email) {
    try {
      await this.request("POST", "/api/v1/auth/forgot-password", {
        email,
        app: this.config.appSlug
      });
      return {
        success: true,
        message: "Password reset email sent. Please check your inbox."
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      return {
        success: false,
        error: new AuthenticationError(message, "UNKNOWN_ERROR")
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
  async resetPassword(token, newPassword) {
    try {
      await this.request("POST", "/api/v1/auth/reset-password", {
        token,
        password: newPassword,
        app: this.config.appSlug
      });
      return {
        success: true,
        message: "Password reset successfully. You can now log in with your new password."
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return { success: false, error };
      }
      const message = error instanceof Error ? error.message : "Failed to reset password";
      return {
        success: false,
        error: new AuthenticationError(message, "UNKNOWN_ERROR")
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
  async me() {
    const tokens = await this.config.storage.getTokens();
    if (!tokens) {
      return null;
    }
    try {
      const headers = {
        "Authorization": `Bearer ${tokens.accessToken}`
      };
      if (this.config.apiKey) {
        headers["X-API-Key"] = this.config.apiKey;
      }
      const response = await fetch(`${this.config.baseUrl}/api/v1/auth/me`, {
        method: "GET",
        headers
      });
      if (!response.ok) {
        if (response.status === 401) {
          await this.config.storage.clearTokens();
          return null;
        }
        return null;
      }
      const userData = await response.json();
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
  async logout(revokeSession = true) {
    if (revokeSession) {
      const tokens = await this.config.storage.getTokens();
      if (tokens) {
        try {
          const headers = {
            "Authorization": `Bearer ${tokens.accessToken}`
          };
          if (this.config.apiKey) {
            headers["X-API-Key"] = this.config.apiKey;
          }
          await fetch(`${this.config.baseUrl}/api/v1/auth/logout`, {
            method: "POST",
            headers
          });
        } catch {
        }
      }
    }
    await this.config.storage.clearTokens();
  }
  /**
   * Make an authenticated API request.
   * X-API-Key is optional for auth endpoints (TASK-501).
   */
  async request(method, path, body) {
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    const options = {
      method,
      headers
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`${this.config.baseUrl}${path}`, options);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw this.mapApiError(errorBody, response.status);
    }
    return response.json();
  }
  /**
   * Map API error response to AuthenticationError.
   */
  mapApiError(error, statusCode) {
    const message = error.message ?? error.error ?? "Request failed";
    const code = this.mapErrorCode(error.error_code ?? error.error ?? "");
    return new AuthenticationError(message, code, statusCode, error.details);
  }
  /**
   * Map error code string to AuthErrorCode.
   */
  mapErrorCode(code) {
    const codeMap = {
      "invalid_credentials": "INVALID_CREDENTIALS",
      "email_not_verified": "EMAIL_NOT_VERIFIED",
      "account_locked": "ACCOUNT_LOCKED",
      "account_disabled": "ACCOUNT_DISABLED",
      "session_expired": "SESSION_EXPIRED",
      "token_expired": "TOKEN_EXPIRED",
      "token_invalid": "TOKEN_INVALID",
      "token_reuse_detected": "TOKEN_REUSE_DETECTED",
      "max_sessions_exceeded": "MAX_SESSIONS_EXCEEDED",
      "password_too_weak": "PASSWORD_TOO_WEAK",
      "email_already_exists": "EMAIL_ALREADY_EXISTS",
      "invalid_reset_token": "INVALID_RESET_TOKEN",
      "reset_token_expired": "RESET_TOKEN_EXPIRED"
    };
    return codeMap[code.toLowerCase()] ?? "UNKNOWN_ERROR";
  }
  /**
   * Map user response to AuthUser.
   */
  mapUser(userData) {
    const user = {
      id: userData.id,
      email: userData.email,
      emailVerified: userData.emailVerified,
      createdAt: new Date(userData.createdAt)
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
};

// src/auth/token-manager.ts
var DEFAULT_REFRESH_THRESHOLD = 60;
var MIN_REFRESH_THRESHOLD = 10;
var MAX_REFRESH_RETRIES = 2;
var RETRY_BACKOFF_MS = 1e3;
var TokenManager = class {
  constructor(config) {
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
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
  async getValidToken() {
    const tokens = await this.config.storage.getTokens();
    if (!tokens) {
      return null;
    }
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
  async refreshToken() {
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
  async doRefresh() {
    const tokens = await this.config.storage.getTokens();
    if (!tokens?.refreshToken) {
      const error2 = new AuthenticationError(
        "No refresh token available",
        "SESSION_EXPIRED"
      );
      this.handleSessionExpired(error2);
      return { success: false, error: error2 };
    }
    let lastError = null;
    for (let attempt = 0; attempt <= MAX_REFRESH_RETRIES; attempt++) {
      try {
        const response = await this.callRefreshEndpoint(tokens.refreshToken);
        const tokenData = createStoredTokenData(
          response.access_token,
          response.expires_in,
          response.refresh_token
        );
        await this.config.storage.setTokens(tokenData);
        this.config.onTokenRefresh?.(tokenData);
        this.scheduleRefresh(tokenData);
        const result = {
          success: true,
          accessToken: response.access_token,
          expiresAt: new Date(tokenData.expiresAt)
        };
        if (response.refresh_token) {
          result.refreshToken = response.refresh_token;
        }
        return result;
      } catch (error2) {
        if (error2 instanceof AuthenticationError) {
          if (error2.code === "TOKEN_REUSE_DETECTED") {
            this.config.onTokenReuseDetected?.();
            await this.config.storage.clearTokens();
            this.stopAutoRefresh();
            const securityError = new AuthenticationError(
              "Security breach detected. Please log in again.",
              "TOKEN_REUSE_DETECTED",
              error2.statusCode
            );
            this.handleSessionExpired(securityError);
            return { success: false, error: securityError };
          }
          if (!error2.isRetryable) {
            this.handleSessionExpired(error2);
            return { success: false, error: error2 };
          }
          lastError = error2;
        } else {
          lastError = new AuthenticationError(
            error2 instanceof Error ? error2.message : "Token refresh failed",
            "NETWORK_ERROR"
          );
        }
        if (attempt < MAX_REFRESH_RETRIES) {
          await this.delay(RETRY_BACKOFF_MS * (attempt + 1));
        }
      }
    }
    const error = lastError ?? new AuthenticationError(
      "Token refresh failed after retries",
      "SERVER_ERROR"
    );
    this.handleSessionExpired(error);
    return { success: false, error };
  }
  /**
   * Call the token refresh endpoint.
   * X-API-Key is optional for auth endpoints (TASK-501).
   */
  async callRefreshEndpoint(refreshToken) {
    const headers = {
      "Content-Type": "application/json"
    };
    if (this.config.apiKey) {
      headers["X-API-Key"] = this.config.apiKey;
    }
    const response = await fetch(`${this.config.baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers,
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const code = this.mapErrorCode(errorBody.error_code ?? errorBody.error ?? "");
      throw new AuthenticationError(
        errorBody.message ?? errorBody.error ?? "Token refresh failed",
        code,
        response.status
      );
    }
    return response.json();
  }
  /**
   * Start automatic token refresh.
   *
   * Call this after successful login or on app initialization.
   */
  async startAutoRefresh() {
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
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  /**
   * Schedule the next token refresh.
   */
  scheduleRefresh(tokens) {
    this.stopAutoRefresh();
    const expiresIn = tokens.expiresAt - Date.now();
    const refreshIn = Math.max(
      expiresIn - this.refreshThreshold * 1e3,
      1e3
      // Minimum 1 second
    );
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, refreshIn);
  }
  /**
   * Handle session expiration.
   */
  handleSessionExpired(error) {
    this.stopAutoRefresh();
    this.config.onSessionExpired?.(error);
  }
  /**
   * Map error code string to AuthErrorCode.
   */
  mapErrorCode(code) {
    const codeMap = {
      "token_expired": "TOKEN_EXPIRED",
      "token_invalid": "TOKEN_INVALID",
      "token_reuse_detected": "TOKEN_REUSE_DETECTED",
      "session_expired": "SESSION_EXPIRED",
      "max_sessions_exceeded": "MAX_SESSIONS_EXCEEDED"
    };
    return codeMap[code.toLowerCase()] ?? "UNKNOWN_ERROR";
  }
  /**
   * Delay helper.
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/auth/state.ts
var AuthStateManager = class {
  constructor(config) {
    this.currentUser = null;
    this.stateListeners = /* @__PURE__ */ new Set();
    this.eventListeners = /* @__PURE__ */ new Map();
    this.config = config;
    this.currentState = {
      isAuthenticated: false,
      isLoading: true,
      user: null
    };
    const events = [
      "SIGNED_IN",
      "SIGNED_OUT",
      "TOKEN_REFRESHED",
      "USER_UPDATED",
      "SESSION_EXPIRED",
      "LOADING"
    ];
    events.forEach((event) => {
      this.eventListeners.set(event, /* @__PURE__ */ new Set());
    });
  }
  /**
   * Initialize state from storage.
   * Call this on app startup.
   */
  async initialize() {
    this.emitEvent("LOADING", { isLoading: true });
    try {
      const tokens = await this.config.storage.getTokens();
      if (tokens) {
        if (this.config.fetchUser) {
          try {
            this.currentUser = await this.config.fetchUser(tokens.accessToken);
          } catch {
            this.currentUser = null;
          }
        }
        if (this.currentUser || !this.config.fetchUser) {
          this.updateState({
            isAuthenticated: true,
            isLoading: false,
            user: this.currentUser,
            accessToken: tokens.accessToken,
            expiresAt: new Date(tokens.expiresAt)
          });
          return;
        }
      }
      this.updateState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
    } finally {
      this.emitEvent("LOADING", { isLoading: false });
    }
  }
  /**
   * Get the current authentication state.
   */
  getState() {
    return { ...this.currentState };
  }
  /**
   * Get the current user if authenticated.
   */
  getUser() {
    return this.currentUser ? { ...this.currentUser } : null;
  }
  /**
   * Check if user is authenticated.
   */
  isAuthenticated() {
    return this.currentState.isAuthenticated;
  }
  /**
   * Check if auth state is still loading.
   */
  isLoading() {
    return this.currentState.isLoading;
  }
  /**
   * Subscribe to all auth state changes.
   *
   * @param callback - Function called when state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback) {
    this.stateListeners.add(callback);
    callback(this.getState());
    return () => {
      this.stateListeners.delete(callback);
    };
  }
  /**
   * Subscribe to specific auth events.
   *
   * @param event - Event type to listen for
   * @param callback - Function called when event fires
   * @returns Unsubscribe function
   */
  on(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(callback);
    }
    return () => {
      listeners?.delete(callback);
    };
  }
  /**
   * Update state after successful login.
   */
  setSignedIn(user, tokens) {
    this.currentUser = user;
    this.updateState({
      isAuthenticated: true,
      isLoading: false,
      user,
      accessToken: tokens.accessToken,
      expiresAt: new Date(tokens.expiresAt)
    });
    this.emitEvent("SIGNED_IN", {
      user,
      accessToken: tokens.accessToken
    });
  }
  /**
   * Update state after logout.
   */
  setSignedOut(reason) {
    this.currentUser = null;
    this.updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null
    });
    const payload = {};
    if (reason) {
      payload.reason = reason;
    }
    this.emitEvent("SIGNED_OUT", payload);
  }
  /**
   * Update state after token refresh.
   */
  setTokenRefreshed(tokens) {
    this.updateState({
      ...this.currentState,
      accessToken: tokens.accessToken,
      expiresAt: new Date(tokens.expiresAt)
    });
    this.emitEvent("TOKEN_REFRESHED", {
      accessToken: tokens.accessToken,
      expiresAt: new Date(tokens.expiresAt)
    });
  }
  /**
   * Update user information.
   */
  setUser(user) {
    this.currentUser = user;
    this.updateState({
      ...this.currentState,
      user
    });
    this.emitEvent("USER_UPDATED", { user });
  }
  /**
   * Handle session expiration.
   */
  setSessionExpired(error) {
    this.currentUser = null;
    this.updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error
    });
    this.emitEvent("SESSION_EXPIRED", { error });
  }
  /**
   * Update internal state and notify listeners.
   */
  updateState(newState) {
    this.currentState = newState;
    this.stateListeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error("AuthStateManager: Error in state listener", error);
      }
    });
  }
  /**
   * Emit an event to listeners.
   */
  emitEvent(event, payload) {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`AuthStateManager: Error in ${event} listener`, error);
      }
    });
  }
  /**
   * Clear all listeners.
   */
  clearListeners() {
    this.stateListeners.clear();
    this.eventListeners.forEach((listeners) => listeners.clear());
  }
};

// src/auth/client.ts
var AuthClient = class _AuthClient {
  constructor(config) {
    this.redirectMode = null;
    this.embeddedMode = null;
    this.callbackHandler = null;
    this.config = config;
    this.mode = config.auth?.mode ?? "redirect";
    const storageType = config.auth?.storage ?? "localStorage";
    if (storageType === "custom" && config.auth?.customStorage) {
      this.storage = config.auth.customStorage;
    } else if (storageType === "custom") {
      throw new Error("Custom storage selected but customStorage not provided");
    } else if (storageType === "cookie") {
      this.storage = createTokenStorage("cookie");
    } else {
      this.storage = createTokenStorage(storageType, config.auth?.storageKeyPrefix);
    }
    const stateManagerConfig = {
      storage: this.storage
    };
    if (config.auth?.mode === "embedded") {
      stateManagerConfig.fetchUser = async (token) => {
        const headers = {
          "Authorization": `Bearer ${token}`
        };
        if (config.apiKey) {
          headers["X-API-Key"] = config.apiKey;
        }
        const response = await fetch(`${config.baseUrl}/api/v1/auth/me`, {
          headers
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        return response.json();
      };
    }
    this.stateManager = new AuthStateManager(stateManagerConfig);
    const tokenManagerConfig = {
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
            "Security breach detected. Session invalidated.",
            "TOKEN_REUSE_DETECTED"
          )
        );
      }
    };
    if (config.apiKey) {
      tokenManagerConfig.apiKey = config.apiKey;
    }
    this.tokenManager = new TokenManager(tokenManagerConfig);
    if (this.mode === "redirect" && config.auth?.callbackUrl) {
      this.redirectMode = new RedirectMode({
        baseUrl: config.baseUrl,
        appSlug: config.appSlug,
        callbackUrl: config.auth.callbackUrl,
        storage: this.storage,
        // Pass storageMode to signal backend to use cookies - @task TASK-500, @feature FTR-109
        storageMode: config.auth?.storage === "cookie" ? "cookie" : "bearer"
      });
      const callbackConfig = {
        baseUrl: config.baseUrl,
        appSlug: config.appSlug,
        callbackUrl: config.auth.callbackUrl,
        storage: this.storage
      };
      if (config.apiKey) {
        callbackConfig.apiKey = config.apiKey;
      }
      this.callbackHandler = new CallbackHandler(callbackConfig);
    } else if (this.mode === "embedded") {
      const embeddedConfig = {
        baseUrl: config.baseUrl,
        appSlug: config.appSlug,
        storage: this.storage
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
  async initialize() {
    await this.stateManager.initialize();
    if (this.stateManager.isAuthenticated() && this.config.auth?.autoRefresh !== false) {
      await this.tokenManager.startAutoRefresh();
    }
  }
  /**
   * Get current auth state.
   */
  getState() {
    return this.stateManager.getState();
  }
  /**
   * Get current user.
   */
  getUser() {
    return this.stateManager.getUser();
  }
  /**
   * Check if authenticated.
   */
  isAuthenticated() {
    return this.stateManager.isAuthenticated();
  }
  /**
   * Subscribe to auth state changes.
   */
  onStateChange(callback) {
    return this.stateManager.onStateChange(callback);
  }
  /**
   * Log in.
   * In redirect mode: redirects to AuthHub portal
   * In embedded mode: authenticates with credentials
   */
  async login(credentials, options) {
    if (this.mode === "redirect" && this.redirectMode) {
      await this.redirectMode.login(options);
      return;
    }
    if (this.mode === "embedded" && this.embeddedMode) {
      if (!credentials) {
        throw new Error("Credentials required for embedded mode");
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
  async register(data) {
    if (this.mode === "redirect" && this.redirectMode) {
      const registerOptions = { email: data.email };
      if (data.name) {
        registerOptions.name = data.name;
      }
      await this.redirectMode.register(registerOptions);
      return { success: true };
    }
    if (this.mode === "embedded" && this.embeddedMode) {
      return this.embeddedMode.register(data);
    }
    throw new Error(`Register not available in ${this.mode} mode`);
  }
  /**
   * Log out.
   */
  async logout() {
    this.tokenManager.stopAutoRefresh();
    if (this.mode === "redirect" && this.redirectMode) {
      await this.redirectMode.logout();
    } else if (this.mode === "embedded" && this.embeddedMode) {
      await this.embeddedMode.logout();
    } else {
      await this.storage.clearTokens();
    }
    this.stateManager.setSignedOut();
  }
  /**
   * Handle OAuth callback (redirect mode only).
   */
  async handleCallback(url) {
    if (!this.callbackHandler) {
      throw new Error("Callback handler not available (redirect mode required)");
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
  isCallback() {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.has("code") || params.has("error");
  }
  /**
   * Refresh the current token.
   */
  async refreshToken() {
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
  async getAccessToken() {
    if (this.config.auth?.storage === "cookie") {
      if (typeof process !== "undefined" && process.env?.["NODE_ENV"] !== "production") {
        console.warn(
          '[AuthHub SDK] getAccessToken() returns null in cookie mode. This is expected behavior - tokens are stored in httpOnly cookies. Use `credentials: "include"` in fetch requests, or use isCookieMode() to check the storage mode before calling getAccessToken().'
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
  isCookieMode() {
    return this.config.auth?.storage === "cookie";
  }
  /**
   * Request password reset (embedded mode).
   */
  async requestPasswordReset(email) {
    if (!this.embeddedMode) {
      throw new Error("Password reset requires embedded mode");
    }
    return this.embeddedMode.forgotPassword(email);
  }
  /**
   * Reset password with token (embedded mode).
   */
  async resetPassword(token, newPassword) {
    if (!this.embeddedMode) {
      throw new Error("Password reset requires embedded mode");
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
  static forAuth(config) {
    return new _AuthClient(config);
  }
};
function createAuthClient(config) {
  return new AuthClient(config);
}

// src/auth/oauth.ts
var OAuthProvider = /* @__PURE__ */ ((OAuthProvider2) => {
  OAuthProvider2["Google"] = "google";
  OAuthProvider2["GitHub"] = "github";
  return OAuthProvider2;
})(OAuthProvider || {});
function buildOAuthUrl(baseUrl, provider, appId, redirectUri, options) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("redirect_uri", redirectUri);
  params.set("app_id", appId);
  if (options?.state) {
    params.set("state", options.state);
  }
  if (options?.scope) {
    params.set("scope", options.scope);
  }
  if (options?.prompt) {
    params.set("prompt", options.prompt);
  }
  return `${normalizedBaseUrl}/api/v1/auth/oauth/${provider}?${params.toString()}`;
}
function getGoogleAuthUrl(baseUrl, appId, redirectUri, options) {
  return buildOAuthUrl(baseUrl, "google" /* Google */, appId, redirectUri, options);
}
function getGitHubAuthUrl(baseUrl, appId, redirectUri, options) {
  return buildOAuthUrl(baseUrl, "github" /* GitHub */, appId, redirectUri, options);
}
function getOAuthUrl(baseUrl, provider, appId, redirectUri, options) {
  return buildOAuthUrl(baseUrl, provider, appId, redirectUri, options);
}
function parseOAuthCallbackResult(url) {
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch {
    return null;
  }
  const result = {};
  let hasParams = false;
  const hash = urlObj.hash.slice(1);
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
      result.accessToken = accessToken;
      hasParams = true;
    }
    const refreshToken = hashParams.get("refresh_token");
    if (refreshToken) {
      result.refreshToken = refreshToken;
      hasParams = true;
    }
    const tokenType = hashParams.get("token_type");
    if (tokenType) {
      result.tokenType = tokenType;
      hasParams = true;
    }
    const expiresIn = hashParams.get("expires_in");
    if (expiresIn) {
      const parsed = parseInt(expiresIn, 10);
      if (!isNaN(parsed)) {
        result.expiresIn = parsed;
        hasParams = true;
      }
    }
    const state2 = hashParams.get("state");
    if (state2) {
      result.state = state2;
      hasParams = true;
    }
    const error2 = hashParams.get("error");
    if (error2) {
      result.error = error2;
      hasParams = true;
    }
    const errorDescription2 = hashParams.get("error_description");
    if (errorDescription2) {
      result.errorDescription = errorDescription2;
      hasParams = true;
    }
  }
  const searchParams = urlObj.searchParams;
  const code = searchParams.get("code");
  if (code && !result.accessToken) {
    result.code = code;
    hasParams = true;
  }
  const state = searchParams.get("state");
  if (state && !result.state) {
    result.state = state;
    hasParams = true;
  }
  const error = searchParams.get("error");
  if (error && !result.error) {
    result.error = error;
    hasParams = true;
  }
  const errorDescription = searchParams.get("error_description");
  if (errorDescription && !result.errorDescription) {
    result.errorDescription = errorDescription;
    hasParams = true;
  }
  return hasParams ? result : null;
}
function hasOAuthCallback(url) {
  const result = parseOAuthCallbackResult(url);
  return result !== null && (Boolean(result.accessToken) || Boolean(result.code) || Boolean(result.error));
}
function hasOAuthError(url) {
  const result = parseOAuthCallbackResult(url);
  return result !== null && Boolean(result.error);
}
function getOAuthError(url) {
  const result = parseOAuthCallbackResult(url);
  if (!result?.error) {
    return null;
  }
  const errorResult = {
    error: result.error
  };
  if (result.errorDescription) {
    errorResult.description = result.errorDescription;
  }
  return errorResult;
}

// src/ai/index.ts
var AIModule = class {
  /**
   * Creates a new AI module instance.
   * @internal
   */
  constructor(config) {
    this.config = config;
  }
  /**
   * Send a chat completion request.
   *
   * @param options - Chat completion options (model, messages, etc.)
   * @returns Chat completion response with choices and usage
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const response = await client.ai.chat({
   *   model: 'gpt-4',
   *   messages: [
   *     { role: 'system', content: 'You are a helpful assistant.' },
   *     { role: 'user', content: 'What is TypeScript?' },
   *   ],
   *   temperature: 0.7,
   *   max_tokens: 500,
   * });
   *
   * console.log(response.choices[0].message.content);
   * console.log(`Tokens used: ${response.usage.total_tokens}`);
   * ```
   */
  async chat(options) {
    this.validateChatOptions(options);
    const response = await this.config.request({
      method: "POST",
      path: "/api/v1/ai/chat/completions",
      body: {
        ...options,
        stream: false
      }
    });
    return response;
  }
  /**
   * Send a streaming chat completion request.
   *
   * @param options - Chat completion options (model, messages, etc.)
   * @returns Async iterator yielding chat chunks
   * @throws {Error} If the request fails
   *
   * @remarks
   * **Timeout Behavior**: The configured timeout applies only to the initial
   * connection. Once streaming begins, there is no per-chunk timeout. For
   * very long responses, the stream will continue until completion or error.
   *
   * If you need to limit total streaming time, implement your own timeout
   * logic wrapping the async iterator, or use `AbortController`:
   *
   * ```typescript
   * const controller = new AbortController();
   * setTimeout(() => controller.abort(), 120000); // 2 min max
   *
   * try {
   *   for await (const chunk of client.ai.chatStream(options)) {
   *     // Process chunk
   *   }
   * } catch (e) {
   *   if (e.name === 'AbortError') console.log('Stream timed out');
   * }
   * ```
   *
   * @example
   * ```typescript
   * const stream = client.ai.chatStream({
   *   model: 'gpt-4',
   *   messages: [{ role: 'user', content: 'Tell me a story.' }],
   * });
   *
   * for await (const chunk of stream) {
   *   process.stdout.write(chunk.content);
   *   if (chunk.finish_reason) {
   *     console.log('\n--- Stream complete ---');
   *   }
   * }
   * ```
   */
  async *chatStream(options) {
    this.validateChatOptions(options);
    const url = new URL("/api/v1/ai/chat/completions", this.config.baseUrl);
    const headers = {
      "X-API-Key": this.config.apiKey,
      "Content-Type": "application/json",
      "Accept": "text/event-stream"
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );
    try {
      const response = await fetch(url.toString(), {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...options,
          stream: true
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = this.extractErrorMessage(errorBody, response.status);
        throw new Error(message);
      }
      if (!response.body) {
        throw new Error("Response body is null");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) {
            continue;
          }
          if (trimmed === "data: [DONE]") {
            return;
          }
          if (trimmed.startsWith("data: ")) {
            const json = trimmed.slice(6);
            try {
              const data = JSON.parse(json);
              const delta = data.choices?.[0]?.delta;
              if (delta?.content !== void 0) {
                yield {
                  content: delta.content,
                  finish_reason: data.choices?.[0]?.finish_reason ?? null
                };
              } else if (data.choices?.[0]?.finish_reason) {
                yield {
                  content: "",
                  finish_reason: data.choices[0].finish_reason
                };
              }
            } catch {
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Stream timed out after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }
  /**
   * List available AI models.
   *
   * Returns models from all configured providers for this app.
   * Use this to discover which models are available rather than hardcoding.
   *
   * @returns List of available AI models with pricing and capabilities
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const { data: models } = await client.ai.listModels();
   *
   * // Display available models
   * models.forEach((model) => {
   *   console.log(`${model.id} (${model.owned_by})`);
   *   if (model.context_window) {
   *     console.log(`  Context: ${model.context_window} tokens`);
   *   }
   * });
   *
   * // Find models by provider
   * const openaiModels = models.filter((m) => m.owned_by === 'openai');
   *
   * // Get only text-output models (excludes image, video, audio generators)
   * const { data: chatModels } = await client.ai.listModels({
   *   output_modality: 'text',
   * });
   *
   * // Get models that accept images as input (vision models)
   * const { data: visionModels } = await client.ai.listModels({
   *   input_modality: 'image',
   * });
   * ```
   */
  async listModels(options) {
    const params = {};
    if (options?.output_modality) {
      params["output_modality"] = options.output_modality;
    }
    if (options?.input_modality) {
      params["input_modality"] = options.input_modality;
    }
    return this.config.request({
      method: "GET",
      path: "/api/v1/ai/models",
      params
    });
  }
  /**
   * Get AI usage statistics for your app.
   *
   * Returns usage metrics including request counts, token consumption,
   * and cost estimates broken down by provider and over time.
   *
   * @param options - Query options for date range and grouping
   * @returns Usage statistics with totals, by-provider breakdown, and timeline
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * // Get usage for the last 30 days
   * const usage = await client.ai.getUsage({
   *   startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
   *   endDate: new Date(),
   *   groupBy: 'day',
   * });
   *
   * console.log(`Total requests: ${usage.totals.requests}`);
   * console.log(`Total cost: $${usage.totals.cost.toFixed(2)}`);
   *
   * // Show usage by provider
   * for (const [provider, stats] of Object.entries(usage.byProvider)) {
   *   console.log(`${provider}: ${stats.requests} requests, $${stats.cost.toFixed(2)}`);
   * }
   * ```
   */
  async getUsage(options) {
    const params = {};
    if (options?.startDate) {
      params["startDate"] = options.startDate.toISOString();
    }
    if (options?.endDate) {
      params["endDate"] = options.endDate.toISOString();
    }
    if (options?.groupBy) {
      params["groupBy"] = options.groupBy;
    }
    const response = await this.config.request({
      method: "GET",
      path: "/api/v1/ai/usage",
      params
    });
    return response.data;
  }
  // ============================================================================
  // Image Generation (FTR-112)
  // ============================================================================
  /**
   * Generate images from text prompts.
   *
   * @param options - Image generation options
   * @returns Generated images with URLs or base64 data
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const result = await client.ai.generateImage({
   *   prompt: 'A beautiful sunset over mountains',
   *   model: 'nano-banana-pro', // default
   *   aspect_ratio: '16:9',
   *   n: 1,
   * });
   *
   * // Access generated image URL
   * console.log(result.data[0].url);
   *
   * // Or base64 if response_format: 'b64_json'
   * console.log(result.data[0].b64_json);
   * ```
   *
   * @task TASK-521
   * @feature FTR-112
   */
  async generateImage(options) {
    this.validateImageOptions(options);
    return this.config.request({
      method: "POST",
      path: "/api/v1/ai/images/generations",
      body: {
        // Core parameters
        model: options.model || "nano-banana-pro",
        prompt: options.prompt,
        ...options.n !== void 0 && { n: options.n },
        ...options.size !== void 0 && { size: options.size },
        ...options.aspect_ratio !== void 0 && { aspect_ratio: options.aspect_ratio },
        ...options.quality !== void 0 && { quality: options.quality },
        ...options.style !== void 0 && { style: options.style },
        ...options.response_format !== void 0 && { response_format: options.response_format },
        ...options.user !== void 0 && { user: options.user },
        // Universal advanced parameters
        ...options.seed !== void 0 && { seed: options.seed },
        ...options.negative_prompt !== void 0 && { negative_prompt: options.negative_prompt },
        ...options.output_format !== void 0 && { output_format: options.output_format },
        // OpenAI GPT-Image parameters
        ...options.background !== void 0 && { background: options.background },
        ...options.output_compression !== void 0 && { output_compression: options.output_compression },
        ...options.moderation !== void 0 && { moderation: options.moderation },
        ...options.fidelity !== void 0 && { fidelity: options.fidelity },
        // Image editing parameters
        ...options.image !== void 0 && { image: options.image },
        ...options.mask !== void 0 && { mask: options.mask },
        // Diffusion model parameters
        ...options.guidance_scale !== void 0 && { guidance_scale: options.guidance_scale },
        ...options.num_inference_steps !== void 0 && { num_inference_steps: options.num_inference_steps },
        ...options.scheduler !== void 0 && { scheduler: options.scheduler },
        ...options.style_preset !== void 0 && { style_preset: options.style_preset },
        // Google Imagen/Gemini parameters
        ...options.language !== void 0 && { language: options.language },
        ...options.enhance_prompt !== void 0 && { enhance_prompt: options.enhance_prompt },
        ...options.person_generation !== void 0 && { person_generation: options.person_generation },
        ...options.safety_setting !== void 0 && { safety_setting: options.safety_setting },
        ...options.add_watermark !== void 0 && { add_watermark: options.add_watermark },
        // Nano Banana Pro exclusive parameters
        ...options.thinking !== void 0 && { thinking: options.thinking },
        ...options.search_grounding !== void 0 && { search_grounding: options.search_grounding },
        ...options.reference_images !== void 0 && { reference_images: options.reference_images }
      }
    });
  }
  // ============================================================================
  // Embeddings (FTR-113)
  // ============================================================================
  /**
   * Create embeddings for text input.
   *
   * @param options - Embedding options
   * @returns Embedding vectors for the input
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * // Single embedding
   * const result = await client.ai.createEmbedding({
   *   model: 'text-embedding-3-small',
   *   input: 'Hello world',
   * });
   * console.log(result.data[0].embedding.length); // 1536
   *
   * // Batch embeddings
   * const result = await client.ai.createEmbedding({
   *   input: ['Hello', 'World', 'Test'],
   * });
   * ```
   *
   * @task TASK-526
   * @feature FTR-113
   */
  async createEmbedding(options) {
    this.validateEmbeddingOptions(options);
    return this.config.request({
      method: "POST",
      path: "/api/v1/ai/embeddings",
      body: {
        model: options.model || "text-embedding-3-small",
        input: options.input,
        ...options.encoding_format !== void 0 && { encoding_format: options.encoding_format },
        ...options.dimensions !== void 0 && { dimensions: options.dimensions },
        ...options.user !== void 0 && { user: options.user }
      }
    });
  }
  // ============================================================================
  // Audio Transcription (FTR-114)
  // ============================================================================
  /**
   * Transcribe audio to text.
   *
   * @param options - Transcription options including audio file
   * @returns Transcribed text and optional timing information
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * // Browser usage
   * const result = await client.ai.transcribe({
   *   file: audioBlob,
   *   language: 'en',
   * });
   * console.log(result.text);
   *
   * // Node.js with file buffer
   * const audioBuffer = fs.readFileSync('audio.mp3');
   * const result = await client.ai.transcribe({
   *   file: audioBuffer,
   *   model: 'whisper-1',
   *   response_format: 'verbose_json',
   * });
   * console.log(result.words); // Word-level timing
   * ```
   *
   * @task TASK-531
   * @feature FTR-114
   */
  async transcribe(options) {
    this.validateTranscriptionOptions(options);
    const formData = new FormData();
    const filename = options.filename || "audio.mp3";
    let fileBlob;
    if (options.file instanceof Blob) {
      fileBlob = options.file;
    } else if (options.file instanceof ArrayBuffer) {
      fileBlob = new Blob([new Uint8Array(options.file)]);
    } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(options.file)) {
      const buf = options.file;
      const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
      fileBlob = new Blob([new Uint8Array(arrayBuffer)]);
    } else {
      throw new Error("Unsupported file type. Use Blob, File, Buffer, or ArrayBuffer.");
    }
    formData.append("file", fileBlob, filename);
    formData.append("model", options.model || "whisper-1");
    if (options.language) formData.append("language", options.language);
    if (options.prompt) formData.append("prompt", options.prompt);
    if (options.response_format) formData.append("response_format", options.response_format);
    if (options.temperature !== void 0) formData.append("temperature", String(options.temperature));
    const url = new URL("/api/v1/ai/audio/transcriptions", this.config.baseUrl);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "X-API-Key": this.config.apiKey
      },
      body: formData
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = this.extractErrorMessage(errorBody, response.status);
      throw new Error(message);
    }
    return response.json();
  }
  // ============================================================================
  // Text-to-Speech (FTR-115)
  // ============================================================================
  /**
   * Convert text to speech audio.
   *
   * @param options - Speech synthesis options
   * @returns Audio data as ArrayBuffer
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const audio = await client.ai.speak({
   *   model: 'tts-1',
   *   input: 'Hello, this is a test.',
   *   voice: 'nova',
   *   response_format: 'mp3',
   * });
   *
   * // Node.js: save to file
   * fs.writeFileSync('output.mp3', Buffer.from(audio));
   *
   * // Browser: play audio
   * const blob = new Blob([audio], { type: 'audio/mpeg' });
   * const url = URL.createObjectURL(blob);
   * new Audio(url).play();
   * ```
   *
   * @task TASK-536
   * @feature FTR-115
   */
  async speak(options) {
    this.validateSpeechOptions(options);
    const url = new URL("/api/v1/ai/audio/speech", this.config.baseUrl);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "X-API-Key": this.config.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model || "tts-1",
        input: options.input,
        voice: options.voice,
        ...options.response_format !== void 0 && { response_format: options.response_format },
        ...options.speed !== void 0 && { speed: options.speed }
      })
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = this.extractErrorMessage(errorBody, response.status);
      throw new Error(message);
    }
    return response.arrayBuffer();
  }
  // ============================================================================
  // Validation Methods
  // ============================================================================
  /**
   * Validate chat completion options.
   * @internal
   */
  validateChatOptions(options) {
    if (!options.model) {
      throw new Error("model is required");
    }
    if (!options.messages || !Array.isArray(options.messages)) {
      throw new Error("messages must be an array");
    }
    if (options.messages.length === 0) {
      throw new Error("messages cannot be empty");
    }
    for (const message of options.messages) {
      if (!message.role || !["system", "user", "assistant"].includes(message.role)) {
        throw new Error("each message must have a valid role (system, user, or assistant)");
      }
      if (typeof message.content !== "string") {
        throw new Error("each message must have a content string");
      }
    }
    if (options.reasoning_effort !== void 0) {
      const validEfforts = ["low", "medium", "high"];
      if (!validEfforts.includes(options.reasoning_effort)) {
        throw new Error("reasoning_effort must be: low, medium, or high");
      }
    }
    if (options.timeoutMs !== void 0) {
      if (typeof options.timeoutMs !== "number" || !Number.isInteger(options.timeoutMs)) {
        throw new Error("timeoutMs must be an integer");
      }
      if (options.timeoutMs < 5e3) {
        throw new Error("timeoutMs must be at least 5000 (5 seconds)");
      }
      if (options.timeoutMs > 3e5) {
        throw new Error("timeoutMs must not exceed 300000 (5 minutes)");
      }
    }
  }
  /**
   * Validate image generation options.
   * @internal
   */
  validateImageOptions(options) {
    if (!options.prompt || typeof options.prompt !== "string") {
      throw new Error("prompt is required and must be a string");
    }
    if (options.prompt.length === 0) {
      throw new Error("prompt cannot be empty");
    }
    if (options.n !== void 0 && (options.n < 1 || options.n > 10)) {
      throw new Error("n must be between 1 and 10");
    }
    if (options.seed !== void 0 && (options.seed < 1 || options.seed > 2147483647)) {
      throw new Error("seed must be between 1 and 2147483647");
    }
    if (options.output_compression !== void 0 && (options.output_compression < 0 || options.output_compression > 100)) {
      throw new Error("output_compression must be between 0 and 100");
    }
    if (options.guidance_scale !== void 0 && (options.guidance_scale < 1 || options.guidance_scale > 50)) {
      throw new Error("guidance_scale must be between 1 and 50");
    }
    if (options.num_inference_steps !== void 0 && (options.num_inference_steps < 1 || options.num_inference_steps > 500)) {
      throw new Error("num_inference_steps must be between 1 and 500");
    }
    if (options.reference_images !== void 0 && options.reference_images.length > 14) {
      throw new Error("reference_images cannot exceed 14 images");
    }
  }
  /**
   * Validate embedding options.
   * @internal
   */
  validateEmbeddingOptions(options) {
    if (!options.input) {
      throw new Error("input is required");
    }
    if (typeof options.input === "string") {
      if (options.input.length === 0) {
        throw new Error("input cannot be empty");
      }
    } else if (Array.isArray(options.input)) {
      if (options.input.length === 0) {
        throw new Error("input array cannot be empty");
      }
      for (const text of options.input) {
        if (typeof text !== "string" || text.length === 0) {
          throw new Error("each input must be a non-empty string");
        }
      }
    } else {
      throw new Error("input must be a string or array of strings");
    }
  }
  /**
   * Validate transcription options.
   * @internal
   */
  validateTranscriptionOptions(options) {
    if (!options.file) {
      throw new Error("file is required");
    }
    if (options.language && !/^[a-z]{2}$/.test(options.language)) {
      throw new Error("language must be a valid ISO 639-1 code (2 lowercase letters)");
    }
    if (options.temperature !== void 0 && (options.temperature < 0 || options.temperature > 1)) {
      throw new Error("temperature must be between 0 and 1");
    }
    const validFormats = ["json", "text", "srt", "vtt", "verbose_json"];
    if (options.response_format && !validFormats.includes(options.response_format)) {
      throw new Error(`response_format must be one of: ${validFormats.join(", ")}`);
    }
  }
  /**
   * Validate speech options.
   * @internal
   */
  validateSpeechOptions(options) {
    if (!options.input || typeof options.input !== "string") {
      throw new Error("input is required and must be a string");
    }
    if (options.input.length === 0) {
      throw new Error("input cannot be empty");
    }
    if (options.input.length > 4096) {
      throw new Error("input cannot exceed 4096 characters");
    }
    const validVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    if (!options.voice || !validVoices.includes(options.voice)) {
      throw new Error(`voice is required and must be one of: ${validVoices.join(", ")}`);
    }
    if (options.speed !== void 0 && (options.speed < 0.25 || options.speed > 4)) {
      throw new Error("speed must be between 0.25 and 4.0");
    }
    const validFormats = ["mp3", "opus", "aac", "flac", "wav", "pcm"];
    if (options.response_format && !validFormats.includes(options.response_format)) {
      throw new Error(`response_format must be one of: ${validFormats.join(", ")}`);
    }
  }
  /**
   * Extract error message from response body.
   * @internal
   */
  extractErrorMessage(body, status) {
    if ("error" in body && body["error"] && typeof body["error"] === "object") {
      const errorObj = body["error"];
      if ("message" in errorObj && typeof errorObj["message"] === "string") {
        return errorObj["message"];
      }
    }
    return `AI request failed with status ${status}`;
  }
};

// src/db/index.ts
var DBModule = class {
  /**
   * Creates a new database module instance.
   * @internal
   */
  constructor(config) {
    this.config = config;
  }
  /**
   * Execute a parameterized SQL query.
   *
   * @param sql - SQL query with $1, $2, etc. placeholders
   * @param params - Array of parameter values
   * @returns Query result with rows and rowCount
   * @throws {Error} If the query fails
   *
   * @example
   * ```typescript
   * interface User {
   *   id: number;
   *   name: string;
   *   email: string;
   * }
   *
   * const result = await client.db.query<User>(
   *   'SELECT * FROM users WHERE email = $1',
   *   ['user@example.com']
   * );
   *
   * if (result.rowCount > 0) {
   *   console.log(`Found user: ${result.rows[0].name}`);
   * }
   * ```
   */
  async query(sql, params) {
    if (!sql || typeof sql !== "string") {
      throw new Error("sql must be a non-empty string");
    }
    const response = await this.config.request({
      method: "POST",
      path: "/api/v1/db/query",
      body: {
        query: sql,
        parameters: params ?? []
      }
    });
    if (!response.success) {
      throw new Error(response.error ?? response.message ?? "Query failed");
    }
    return response.data;
  }
  /**
   * Execute multiple queries within a transaction.
   *
   * All queries in the callback will be executed atomically - if any query
   * fails, all changes will be rolled back. If all queries succeed, the
   * transaction is committed.
   *
   * @param callback - Async function receiving a transaction context
   * @returns The return value of the callback
   * @throws {Error} If any query fails (transaction is rolled back)
   *
   * @example
   * ```typescript
   * const result = await client.db.transaction(async (tx) => {
   *   // Deduct from sender
   *   await tx.query(
   *     'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
   *     [amount, senderId]
   *   );
   *
   *   // Add to receiver
   *   await tx.query(
   *     'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
   *     [amount, receiverId]
   *   );
   *
   *   // Log the transfer
   *   await tx.query(
   *     'INSERT INTO transfers (sender_id, receiver_id, amount) VALUES ($1, $2, $3)',
   *     [senderId, receiverId, amount]
   *   );
   *
   *   return { transferId: 'tx-123' };
   * });
   * ```
   */
  async transaction(callback) {
    const queries = [];
    let callbackResult;
    let callbackError;
    const txContext = {
      query: async (sql, params) => {
        queries.push({ query: sql, parameters: params ?? [] });
        return { rows: [], rowCount: 0 };
      }
    };
    try {
      callbackResult = await callback(txContext);
    } catch (err) {
      callbackError = err instanceof Error ? err : new Error(String(err));
    }
    if (callbackError) {
      throw callbackError;
    }
    if (queries.length === 0) {
      return callbackResult;
    }
    const response = await this.config.request({
      method: "POST",
      path: "/api/v1/db/transaction",
      body: {
        queries
      }
    });
    if (!response.success || !response.data.committed) {
      throw new Error(response.error ?? response.message ?? "Transaction failed");
    }
    return callbackResult;
  }
};

// src/secrets/index.ts
var SecretsModule = class {
  /**
   * Creates a new secrets module instance.
   * @internal
   */
  constructor(config) {
    this.config = config;
  }
  /**
   * Retrieve a secret value by name.
   *
   * @param name - Name of the secret to retrieve
   * @returns The secret value as a string
   * @throws {Error} If the secret is not found or not authorized
   *
   * @example
   * ```typescript
   * const stripeKey = await client.secrets.get('STRIPE_API_KEY');
   * // Use stripeKey to initialize Stripe client
   * ```
   */
  async get(name) {
    if (!name || typeof name !== "string") {
      throw new Error("secret name must be a non-empty string");
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error("secret name contains invalid characters");
    }
    try {
      const response = await this.config.request({
        method: "GET",
        path: `/api/v1/secrets/${encodeURIComponent(name)}`
      });
      return response.value;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("403") || error.message.toLowerCase().includes("forbidden")) {
          throw new Error(`Access denied to secret '${name}'`);
        }
        if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
          throw new Error(`Secret '${name}' not found`);
        }
      }
      throw error;
    }
  }
  /**
   * List all available secret names for this application.
   *
   * Note: This returns only the names, not the values. Use `get()` to
   * retrieve individual secret values.
   *
   * @returns Array of secret names
   * @throws {Error} If the request fails
   *
   * @example
   * ```typescript
   * const secretNames = await client.secrets.list();
   * console.log('Available secrets:', secretNames);
   * // ['STRIPE_API_KEY', 'DATABASE_PASSWORD', 'JWT_SECRET']
   * ```
   */
  async list() {
    const response = await this.config.request({
      method: "GET",
      path: "/api/v1/secrets"
    });
    return response.secrets;
  }
  /**
   * Check if a secret exists without retrieving its value.
   *
   * @param name - Name of the secret to check
   * @returns True if the secret exists and is accessible
   *
   * @example
   * ```typescript
   * if (await client.secrets.exists('STRIPE_API_KEY')) {
   *   // Stripe integration is configured
   * }
   * ```
   */
  async exists(name) {
    try {
      const secrets = await this.list();
      return secrets.includes(name);
    } catch {
      return false;
    }
  }
};

// src/debug/breadcrumbs.ts
var DEFAULT_BREADCRUMB_TYPES = [
  "click",
  "navigation",
  "xhr",
  "fetch",
  "console",
  "dom",
  "security",
  "custom"
];
var BreadcrumbTracker = class {
  constructor(config = {}) {
    this.breadcrumbs = [];
    this.initialized = false;
    this.cspViolationHandler = null;
    this.config = {
      maxBreadcrumbs: config.maxBreadcrumbs ?? 50,
      enabledTypes: config.enabledTypes ?? DEFAULT_BREADCRUMB_TYPES,
      beforeBreadcrumb: config.beforeBreadcrumb ?? ((b) => b)
    };
  }
  /**
   * Add a breadcrumb to the list
   * @param breadcrumb - Breadcrumb to add (timestamp optional)
   */
  add(breadcrumb) {
    const bc = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp ?? (/* @__PURE__ */ new Date()).toISOString()
    };
    const processed = this.config.beforeBreadcrumb(bc);
    if (!processed) return;
    if (!this.config.enabledTypes.includes(processed.type)) return;
    this.breadcrumbs.push(processed);
    while (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }
  /**
   * Get a copy of all breadcrumbs
   * @returns Copy of breadcrumbs array
   */
  getBreadcrumbs() {
    return [...this.breadcrumbs];
  }
  /**
   * Clear all breadcrumbs
   */
  clear() {
    this.breadcrumbs = [];
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Check if tracker is initialized
   */
  isInitialized() {
    return this.initialized;
  }
  /**
   * Initialize click, navigation, and HTTP tracking with event listeners
   * Safe to call multiple times - will only initialize once
   * @task TASK-563
   */
  init() {
    if (this.initialized || typeof window === "undefined" || typeof document === "undefined") return;
    this.initialized = true;
    document.addEventListener("click", this.handleClick.bind(this), true);
    window.addEventListener("popstate", this.handleNavigation.bind(this));
    this.wrapHistoryMethod("pushState");
    this.wrapHistoryMethod("replaceState");
    this.wrapFetch();
    this.wrapXHR();
    this.wrapConsole();
    this.cspViolationHandler = this.handleCSPViolation.bind(this);
    document.addEventListener("securitypolicyviolation", this.cspViolationHandler);
  }
  /**
   * Clean up event listeners
   */
  destroy() {
    if (!this.initialized || typeof window === "undefined" || typeof document === "undefined") return;
    document.removeEventListener("click", this.handleClick.bind(this), true);
    if (this.cspViolationHandler) {
      document.removeEventListener("securitypolicyviolation", this.cspViolationHandler);
      this.cspViolationHandler = null;
    }
    this.initialized = false;
  }
  /**
   * Handle click events and create breadcrumbs
   */
  handleClick(event) {
    const target = event.target;
    if (!target) return;
    const descriptor = this.getElementDescriptor(target);
    this.add({
      type: "click",
      category: "ui",
      message: `Clicked ${descriptor.tag}${descriptor.id ? "#" + descriptor.id : ""}`,
      data: { element: descriptor }
    });
  }
  /**
   * Get safe element descriptor without PII
   * Only captures structural/identifying attributes
   */
  getElementDescriptor(el) {
    const desc = {
      tag: el.tagName.toLowerCase()
    };
    if (el.id) desc.id = el.id;
    if (el.className && typeof el.className === "string") {
      const classes = el.className.split(" ").filter(Boolean);
      if (classes.length > 0) desc.classes = classes;
    }
    const role = el.getAttribute("role");
    if (role) desc.role = role;
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) desc["aria-label"] = ariaLabel;
    const testId = el.getAttribute("data-testid");
    if (testId) desc["data-testid"] = testId;
    return desc;
  }
  /**
   * Handle CSP violation events and create breadcrumbs
   */
  handleCSPViolation(event) {
    this.add({
      type: "security",
      category: "csp",
      message: `CSP violation: ${event.violatedDirective} blocked ${event.blockedURI || "inline"}`,
      data: {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        originalPolicy: event.originalPolicy
      },
      level: "error"
    });
  }
  /**
   * Handle popstate navigation events
   * @task TASK-563
   */
  handleNavigation() {
    this.add({
      type: "navigation",
      category: "navigation",
      message: `Navigated to ${this.sanitizeUrl(window.location.href)}`,
      data: { path: this.sanitizeUrl(window.location.href) }
    });
  }
  /**
   * Sanitize URL to remove query params and hash for privacy
   * Only returns pathname to avoid capturing PII in URLs
   * @task TASK-563
   */
  sanitizeUrl(url) {
    try {
      let base = "http://localhost";
      if (typeof window !== "undefined" && window.location && window.location.origin) {
        base = window.location.origin;
      }
      const parsed = new URL(url, base);
      return parsed.pathname;
    } catch {
      const noQuery = url.split("?")[0] ?? url;
      return noQuery.split("#")[0] ?? noQuery;
    }
  }
  /**
   * Wrap history pushState/replaceState to track SPA navigation
   * @task TASK-563
   */
  wrapHistoryMethod(method) {
    const original = history[method].bind(history);
    const tracker = this;
    history[method] = function(...args) {
      const result = original(...args);
      tracker.add({
        type: "navigation",
        category: "navigation",
        message: `Navigated to ${tracker.sanitizeUrl(window.location.pathname)}`,
        data: { method, path: tracker.sanitizeUrl(window.location.pathname) }
      });
      return result;
    };
  }
  /**
   * Wrap fetch API to track HTTP requests
   * Only captures method, path, and status - never request bodies
   * @task TASK-563
   */
  wrapFetch() {
    const originalFetch = window.fetch.bind(window);
    const tracker = this;
    window.fetch = async function(input, init) {
      const url = typeof input === "string" ? input : input.url;
      const method = init?.method || "GET";
      try {
        const response = await originalFetch(input, init);
        tracker.add({
          type: "fetch",
          category: "http",
          message: `${method} ${tracker.sanitizeUrl(url)} ${response.status}`,
          data: { method, path: tracker.sanitizeUrl(url), status: response.status }
        });
        return response;
      } catch (error) {
        tracker.add({
          type: "fetch",
          category: "http",
          message: `${method} ${tracker.sanitizeUrl(url)} failed`,
          data: { method, path: tracker.sanitizeUrl(url), error: "network_error" },
          level: "error"
        });
        throw error;
      }
    };
  }
  /**
   * Wrap XMLHttpRequest to track XHR requests
   * Only captures method, path, and status - never request bodies
   * @task TASK-563
   */
  wrapXHR() {
    const tracker = this;
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new OriginalXHR();
      let method = "GET";
      let url = "";
      const originalOpen = xhr.open.bind(xhr);
      xhr.open = function(reqMethod, reqUrl, async_, username, password) {
        method = reqMethod;
        url = typeof reqUrl === "string" ? reqUrl : reqUrl.toString();
        return originalOpen(reqMethod, reqUrl, async_ ?? true, username ?? null, password ?? null);
      };
      xhr.addEventListener("loadend", () => {
        tracker.add({
          type: "xhr",
          category: "http",
          message: `${method} ${tracker.sanitizeUrl(url)} ${xhr.status}`,
          data: { method, path: tracker.sanitizeUrl(url), status: xhr.status },
          level: xhr.status >= 400 ? "error" : "info"
        });
      });
      return xhr;
    };
  }
  /**
   * Wrap console methods to track debug/info/warn/error
   * @task TASK-564
   */
  wrapConsole() {
    const levels = [
      { method: "debug", level: "debug" },
      { method: "info", level: "info" },
      { method: "warn", level: "warning" },
      { method: "error", level: "error" }
    ];
    for (const { method, level } of levels) {
      const original = console[method].bind(console);
      const tracker = this;
      console[method] = function(...args) {
        tracker.addConsoleBreadcrumb(level, args);
        original(...args);
      };
    }
  }
  /**
   * Add a console breadcrumb from logged message
   * @task TASK-564
   */
  addConsoleBreadcrumb(level, args) {
    const message = this.formatConsoleMessage(args);
    this.add({
      type: "console",
      category: "console",
      message,
      level
    });
  }
  /**
   * Format console arguments into a safe message string
   * Truncates at 500 chars, sanitizes PII, and replaces objects
   * @task TASK-564
   */
  formatConsoleMessage(args) {
    const parts = args.map((arg) => {
      if (typeof arg === "string") {
        return this.sanitizeConsoleString(arg);
      }
      if (arg instanceof Error) {
        return `Error: ${arg.message}`;
      }
      if (typeof arg === "object" && arg !== null) {
        return "[Object]";
      }
      return String(arg);
    });
    const message = parts.join(" ");
    return message.length > 500 ? message.slice(0, 497) + "..." : message;
  }
  /**
   * Sanitize console string to redact PII patterns
   * @task TASK-564
   */
  sanitizeConsoleString(str) {
    return str.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      "[REDACTED]"
    );
  }
};

// src/debug/strategies/semantic-dom.ts
var MAX_DEPTH = 10;
var EXCLUDED_TAGS = /* @__PURE__ */ new Set([
  "script",
  "style",
  "noscript",
  "svg",
  "template",
  "iframe",
  "link",
  "meta"
]);
var SAFE_ATTRIBUTES = /* @__PURE__ */ new Set([
  "id",
  "class",
  "role",
  "aria-label",
  "aria-describedby",
  "aria-expanded",
  "aria-selected",
  "aria-hidden",
  "aria-haspopup",
  "aria-controls",
  "type",
  "name",
  "placeholder",
  "disabled",
  "readonly",
  "required",
  "data-testid",
  "data-component"
]);
var PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  // Phone
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/
  // Credit card
];
var SemanticDOMStrategy = class {
  constructor() {
    this.name = "semantic_dom";
    this.maxSize = 5120;
  }
  // 5KB
  async capture(_context) {
    if (typeof document === "undefined") {
      throw new Error("SemanticDOMStrategy requires a DOM environment");
    }
    const rootElement = this.captureElement(document.body);
    const result = {
      rootElement: rootElement || { tag: "body" },
      scrollPosition: {
        x: typeof window !== "undefined" ? window.scrollX : 0,
        y: typeof window !== "undefined" ? window.scrollY : 0
      },
      viewportSize: {
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0
      },
      capturedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const activeEl = this.getActiveElementSelector();
    if (activeEl) result.activeElement = activeEl;
    return result;
  }
  getActiveElementSelector() {
    const active = document.activeElement;
    if (!active || active === document.body) return void 0;
    return this.generateSelector(active);
  }
  generateSelector(el) {
    if (el.id) return `#${el.id}`;
    const tag = el.tagName.toLowerCase();
    const classes = el.className && typeof el.className === "string" ? el.className.split(" ").filter(Boolean).slice(0, 2).join(".") : "";
    return classes ? `${tag}.${classes}` : tag;
  }
  captureElement(el, depth = 0) {
    if (!el) return null;
    const tag = el.tagName.toLowerCase();
    if (EXCLUDED_TAGS.has(tag)) {
      return null;
    }
    if (depth > MAX_DEPTH) {
      return { tag, children: [] };
    }
    const node = { tag };
    if (el.id) node.id = el.id;
    if (el.className && typeof el.className === "string") {
      const classes = el.className.split(" ").filter(Boolean);
      if (classes.length) node.classList = classes;
    }
    const attributes = {};
    for (const attr of Array.from(el.attributes)) {
      if (SAFE_ATTRIBUTES.has(attr.name) || attr.name.startsWith("aria-") || attr.name.startsWith("data-")) {
        if (attr.name !== "class" && attr.name !== "id") {
          if (this.isPotentialPII(attr.value)) continue;
          const truncatedValue = attr.value.length > 100 ? attr.value.slice(0, 97) + "..." : attr.value;
          attributes[attr.name] = truncatedValue;
        }
      }
    }
    if (Object.keys(attributes).length) {
      node.attributes = attributes;
    }
    const role = el.getAttribute("role");
    if (role) node.role = role;
    const label = this.extractLabel(el);
    if (label) node.label = label;
    if (depth < MAX_DEPTH && el.children.length > 0) {
      const children = [];
      for (const child of Array.from(el.children)) {
        const captured = this.captureElement(child, depth + 1);
        if (captured) children.push(captured);
      }
      if (children.length) node.children = children;
    }
    return node;
  }
  isPotentialPII(value) {
    return PII_PATTERNS.some((pattern) => pattern.test(value));
  }
  extractLabel(el) {
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent?.trim() || void 0;
    }
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label) return label.textContent?.trim() || void 0;
    }
    return void 0;
  }
};

// src/debug/strategies/synthetic-screenshot.ts
var MASK_SELECTORS = [
  'input[type="password"]',
  'input[type="email"]',
  'input[type="tel"]',
  'input[type="text"]',
  'input[type="number"]',
  "input:not([type])",
  // Default inputs without type
  "textarea",
  "[data-sensitive]",
  "[data-pii]"
];
var MASK_VALUE = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
var SyntheticScreenshotStrategy = class {
  constructor() {
    this.name = "synthetic_screenshot";
    this.maxSize = 15360;
    // 15KB
    // Storage for masked element restoration
    this.maskedElements = [];
  }
  async capture(context) {
    if (typeof document === "undefined") {
      throw new Error("SyntheticScreenshotStrategy requires a DOM environment");
    }
    const maskedSelectors = this.maskInputs();
    try {
      const scrollHeight = document.body.scrollHeight || document.documentElement?.scrollHeight || window.innerHeight;
      const { default: domToImage } = await import("dom-to-image-more");
      const dataUrl = await domToImage.toPng(document.body, {
        quality: 0.6,
        bgcolor: "#ffffff",
        width: Math.min(window.innerWidth, 1920),
        height: Math.min(scrollHeight, 4e3)
      });
      const imageData = dataUrl.replace(/^data:image\/png;base64,/, "");
      let errorLocation;
      if (context?.element) {
        const rect = context.element.getBoundingClientRect();
        errorLocation = {
          x: rect.left,
          y: rect.top,
          selector: this.generateSelector(context.element)
        };
      }
      const height = document.body.scrollHeight || document.documentElement?.scrollHeight || window.innerHeight;
      const result = {
        imageData,
        dimensions: {
          width: window.innerWidth,
          height
        },
        maskedElements: maskedSelectors,
        capturedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (errorLocation) result.errorLocation = errorLocation;
      return result;
    } finally {
      this.restoreInputs();
    }
  }
  generateSelector(el) {
    if (el.id) return `#${el.id}`;
    const classes = el.className ? el.className.split(" ").filter(Boolean).slice(0, 2).join(".") : "";
    return classes ? `${el.tagName.toLowerCase()}.${classes}` : el.tagName.toLowerCase();
  }
  maskInputs() {
    const selectors = [];
    const selectorQuery = MASK_SELECTORS.join(", ");
    const inputs = document.querySelectorAll(selectorQuery);
    inputs.forEach((input) => {
      const el = input;
      const originalValue = el.value;
      const selector = this.generateSelector(el);
      if (originalValue) {
        this.maskedElements.push({
          element: el,
          originalValue,
          selector
        });
        selectors.push(selector);
        el.dataset["__originalValue"] = originalValue;
        el.value = MASK_VALUE;
      }
    });
    return selectors;
  }
  restoreInputs() {
    this.maskedElements.forEach(({ element, originalValue }) => {
      element.value = originalValue;
      delete element.dataset["__originalValue"];
    });
    this.maskedElements = [];
  }
};

// src/debug/strategies/aom-tree.ts
var _AOMTreeStrategy = class _AOMTreeStrategy {
  constructor() {
    this.name = "aom_tree";
    this.maxSize = 8192;
  }
  async capture(_context) {
    if (typeof document === "undefined") {
      throw new Error("AOMTreeStrategy requires a DOM environment");
    }
    const result = {
      rootNode: this.captureAccessibilityNode(document.body),
      focusOrder: this.getFocusOrder(),
      landmarks: this.getLandmarks(),
      capturedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const focused = this.getFocusedElementSelector();
    if (focused) result.focusedElement = focused;
    return result;
  }
  getFocusedElementSelector() {
    const focused = document.activeElement;
    if (!focused || focused === document.body) return void 0;
    return this.generateSelector(focused);
  }
  generateSelector(el) {
    if (el.id) return `#${el.id}`;
    const tag = el.tagName.toLowerCase();
    const classes = el.className && typeof el.className === "string" ? el.className.split(" ").filter(Boolean).slice(0, 2).join(".") : "";
    return classes ? `${tag}.${classes}` : tag;
  }
  getFocusOrder() {
    const focusable = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(focusable).slice(0, 50).map((el) => this.generateSelector(el));
  }
  getLandmarks() {
    const landmarks = [];
    const semanticLandmarks = document.querySelectorAll(
      "header, nav, main, aside, footer"
    );
    for (let i = 0; i < semanticLandmarks.length && landmarks.length < 20; i++) {
      const el = semanticLandmarks[i];
      const info = {
        role: this.getImplicitRole(el),
        selector: this.generateSelector(el)
      };
      const lbl = el.getAttribute("aria-label");
      if (lbl) info.label = lbl;
      landmarks.push(info);
    }
    const landmarkRoles = [
      "banner",
      "navigation",
      "main",
      "complementary",
      "contentinfo",
      "search",
      "form",
      "region"
    ];
    for (const role of landmarkRoles) {
      if (landmarks.length >= 20) break;
      const elements = document.querySelectorAll(`[role="${role}"]`);
      for (let i = 0; i < elements.length && landmarks.length < 20; i++) {
        const el = elements[i];
        const info = {
          role,
          selector: this.generateSelector(el)
        };
        const lbl = el.getAttribute("aria-label");
        if (lbl) info.label = lbl;
        landmarks.push(info);
      }
    }
    return landmarks.slice(0, 20);
  }
  /**
   * Get the role for an element, preferring explicit over implicit
   */
  getRole(el) {
    const explicitRole = el.getAttribute("role");
    if (explicitRole) return explicitRole;
    const tag = el.tagName.toLowerCase();
    if (tag === "input") {
      const type = el.getAttribute("type") || "text";
      return _AOMTreeStrategy.INPUT_TYPE_ROLES[type] || "textbox";
    }
    const implicitRole = _AOMTreeStrategy.IMPLICIT_ROLES[tag];
    return implicitRole ?? "generic";
  }
  /**
   * Get the implicit role for semantic landmark elements
   * Used specifically for landmark extraction
   */
  getImplicitRole(el) {
    const tag = el.tagName.toLowerCase();
    const implicitRoles = {
      header: "banner",
      nav: "navigation",
      main: "main",
      aside: "complementary",
      footer: "contentinfo"
    };
    return implicitRoles[tag] || "generic";
  }
  /**
   * Get the accessible name for an element following ARIA name computation
   * Priority: aria-label > aria-labelledby > associated label > alt (for images)
   */
  getAccessibleName(el) {
    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement?.textContent) {
        return labelElement.textContent;
      }
    }
    const id = el.getAttribute("id") || el.id;
    if (id) {
      const associatedLabel = document.querySelector(`label[for="${id}"]`);
      if (associatedLabel?.textContent) {
        return associatedLabel.textContent;
      }
    }
    const tag = el.tagName.toLowerCase();
    if (tag === "img") {
      const alt = el.getAttribute("alt");
      if (alt) return alt;
    }
    return void 0;
  }
  /**
   * Get the accessible description for an element from aria-describedby
   */
  getAccessibleDescription(el) {
    const describedBy = el.getAttribute("aria-describedby");
    if (describedBy) {
      const descElement = document.getElementById(describedBy);
      if (descElement?.textContent) {
        return descElement.textContent;
      }
    }
    return void 0;
  }
  /**
   * Capture the accessibility state of an element from ARIA attributes
   * and native HTML properties.
   *
   * Supports: disabled, expanded, selected, checked (including mixed),
   * pressed, hidden, and invalid states.
   */
  getState(el) {
    const state = {};
    let hasState = false;
    const ariaDisabled = el.getAttribute("aria-disabled");
    if (ariaDisabled === "true" || el.disabled === true) {
      state.disabled = true;
      hasState = true;
    }
    const ariaExpanded = el.getAttribute("aria-expanded");
    if (ariaExpanded === "true") {
      state.expanded = true;
      hasState = true;
    } else if (ariaExpanded === "false") {
      state.expanded = false;
      hasState = true;
    }
    const ariaSelected = el.getAttribute("aria-selected");
    if (ariaSelected === "true") {
      state.selected = true;
      hasState = true;
    } else if (ariaSelected === "false") {
      state.selected = false;
      hasState = true;
    }
    const ariaChecked = el.getAttribute("aria-checked");
    if (ariaChecked === "true") {
      state.checked = true;
      hasState = true;
    } else if (ariaChecked === "false") {
      state.checked = false;
      hasState = true;
    } else if (ariaChecked === "mixed") {
      hasState = true;
    } else if (el.tagName.toLowerCase() === "input" && el.getAttribute("type") === "checkbox" && el.checked === true) {
      state.checked = true;
      hasState = true;
    }
    const ariaPressed = el.getAttribute("aria-pressed");
    if (ariaPressed === "true") {
      state.pressed = true;
      hasState = true;
    } else if (ariaPressed === "false") {
      state.pressed = false;
      hasState = true;
    }
    const ariaHidden = el.getAttribute("aria-hidden");
    if (ariaHidden === "true") {
      state.hidden = true;
      hasState = true;
    }
    const ariaInvalid = el.getAttribute("aria-invalid");
    if (ariaInvalid === "true") {
      state.invalid = true;
      hasState = true;
    }
    return hasState ? state : void 0;
  }
  /**
   * Recursively capture an accessibility node and its children.
   *
   * - Excludes elements with aria-hidden="true" from the tree
   * - Enforces a depth limit of MAX_DEPTH (8 levels) to prevent
   *   excessive recursion in deeply nested DOMs
   * - Captures role, name, description, state, and children
   *
   * @param el - The HTML element to capture
   * @param depth - Current recursion depth (0-based)
   * @returns The accessibility node representation
   */
  captureAccessibilityNode(el, depth = 0) {
    if (!el) return { role: "generic" };
    const node = {
      role: this.getRole(el)
    };
    const name = this.getAccessibleName(el);
    if (name) node.name = name;
    const description = this.getAccessibleDescription(el);
    if (description) node.description = description;
    const state = this.getState(el);
    if (state) {
      node.state = state;
    }
    if (depth < _AOMTreeStrategy.MAX_DEPTH && el.children && el.children.length > 0) {
      const children = [];
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i];
        if (child.getAttribute && child.getAttribute("aria-hidden") === "true") {
          continue;
        }
        children.push(this.captureAccessibilityNode(child, depth + 1));
      }
      if (children.length > 0) {
        node.children = children;
      }
    }
    return node;
  }
};
// 8KB
_AOMTreeStrategy.MAX_DEPTH = 8;
/**
 * Implicit role mapping for semantic HTML elements
 * Based on WAI-ARIA 1.2 specification
 */
_AOMTreeStrategy.IMPLICIT_ROLES = {
  a: "link",
  article: "article",
  aside: "complementary",
  button: "button",
  footer: "contentinfo",
  form: "form",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  header: "banner",
  img: "img",
  input: void 0,
  // Depends on type
  li: "listitem",
  main: "main",
  nav: "navigation",
  ol: "list",
  option: "option",
  progress: "progressbar",
  section: "region",
  select: "combobox",
  table: "table",
  textarea: "textbox",
  ul: "list"
};
/**
 * Input type to role mapping for input elements
 */
_AOMTreeStrategy.INPUT_TYPE_ROLES = {
  button: "button",
  checkbox: "checkbox",
  email: "textbox",
  number: "spinbutton",
  radio: "radio",
  range: "slider",
  search: "searchbox",
  submit: "button",
  tel: "textbox",
  text: "textbox"
};
var AOMTreeStrategy = _AOMTreeStrategy;

// src/debug/strategies/ast.ts
var _ASTStrategy = class _ASTStrategy {
  constructor() {
    this.name = "ast";
    this.maxSize = 10240;
  }
  async capture(context) {
    const error = context?.error || new Error("Capture point");
    const stack = error.stack || "";
    const callStack = this.parseStack(stack);
    const errorLocation = this.getErrorLocation(callStack);
    return {
      errorLocation,
      contextNodes: [],
      callStack,
      capturedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  parseStack(stack) {
    const frames = [];
    const lines = stack.split("\n");
    for (const line of lines) {
      if (frames.length >= 20) break;
      const frame = this.parseStackLine(line);
      if (frame) frames.push(frame);
    }
    return frames;
  }
  parseStackLine(line) {
    let match = line.match(_ASTStrategy.CHROME_REGEX);
    if (match) {
      return {
        functionName: this.sanitizeFunctionName(match[1] || ""),
        fileName: this.sanitizeFileName(match[2] || ""),
        lineNumber: parseInt(match[3] || "0", 10),
        columnNumber: parseInt(match[4] || "0", 10)
      };
    }
    match = line.match(_ASTStrategy.FIREFOX_REGEX);
    if (match) {
      return {
        functionName: this.sanitizeFunctionName(match[1] || ""),
        fileName: this.sanitizeFileName(match[2] || ""),
        lineNumber: parseInt(match[3] || "0", 10),
        columnNumber: parseInt(match[4] || "0", 10)
      };
    }
    return null;
  }
  sanitizeFileName(fileName) {
    let sanitized = fileName;
    try {
      const url = new URL(sanitized);
      sanitized = url.pathname;
    } catch {
    }
    const queryIndex = sanitized.indexOf("?");
    if (queryIndex !== -1) {
      sanitized = sanitized.substring(0, queryIndex);
    }
    const hashIndex = sanitized.indexOf("#");
    if (hashIndex !== -1) {
      sanitized = sanitized.substring(0, hashIndex);
    }
    if (sanitized.length > 200) {
      sanitized = sanitized.substring(0, 200);
    }
    return sanitized;
  }
  sanitizeFunctionName(name) {
    let sanitized = name.replace(/[^a-zA-Z0-9_.<>\[\]]/g, "");
    if (sanitized.length === 0) {
      return "<anonymous>";
    }
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
    }
    return sanitized;
  }
  getErrorLocation(callStack) {
    const firstFrame = callStack[0];
    const loc = {
      file: firstFrame?.fileName || "unknown",
      line: firstFrame?.lineNumber || 0,
      column: firstFrame?.columnNumber || 0
    };
    if (firstFrame?.functionName) loc.functionName = firstFrame.functionName;
    return loc;
  }
};
// Chrome/Edge: "    at functionName (file:line:col)" or "    at file:line:col"
_ASTStrategy.CHROME_REGEX = /^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/;
// Firefox: "functionName@file:line:col"
_ASTStrategy.FIREFOX_REGEX = /^(.*)@(.+?):(\d+):(\d+)$/;
var ASTStrategy = _ASTStrategy;

// src/debug/index.ts
var STRATEGY_NAME_MAP = {
  "semantic-dom": "semantic_dom",
  "synthetic-screenshot": "synthetic_screenshot",
  "aom-tree": "aom_tree",
  "ast-capture": "ast"
};
var DebugModule = class {
  constructor(config) {
    this.userContext = null;
    this.tags = {};
    this.initialized = false;
    this.originalOnError = null;
    this.unhandledRejectionHandler = null;
    this.cspViolationHandler = null;
    this.config = {
      enabled: config.enabled ?? true,
      sampleRate: config.sampleRate ?? 1,
      environment: config.environment ?? "production",
      release: config.release ?? "",
      maxBreadcrumbs: config.maxBreadcrumbs ?? 50,
      appId: config.appId,
      apiUrl: config.apiUrl
    };
    if (config.strategies) this.config.strategies = config.strategies;
    if (config.beforeCapture) this.config.beforeCapture = config.beforeCapture;
    if (config.request) this.config.request = config.request;
    this.breadcrumbTracker = new BreadcrumbTracker({
      maxBreadcrumbs: this.config.maxBreadcrumbs ?? 50
    });
    this.strategies = /* @__PURE__ */ new Map([
      ["semantic_dom", new SemanticDOMStrategy()],
      ["synthetic_screenshot", new SyntheticScreenshotStrategy()],
      ["aom_tree", new AOMTreeStrategy()],
      ["ast", new ASTStrategy()]
    ]);
    this.sessionId = this.getOrCreateSessionId();
  }
  /**
   * Generate or retrieve a persistent session ID.
   * Uses sessionStorage in browser environments for persistence
   * across page navigations within the same session.
   * Falls back to random generation in non-browser environments.
   */
  getOrCreateSessionId() {
    if (typeof globalThis.sessionStorage === "undefined") {
      return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    const key = "__authhub_debug_session_id";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  }
  /**
   * Resolve a public CaptureStrategyName to an internal strategy key.
   * Returns the underscore-format key used in the strategies Map.
   */
  resolveStrategyName(name) {
    return STRATEGY_NAME_MAP[name];
  }
  /**
   * Get a capture strategy by its internal underscore-format name.
   */
  getStrategy(name) {
    return this.strategies.get(name);
  }
  /**
   * Get the current session ID.
   */
  getSessionId() {
    return this.sessionId;
  }
  /**
   * Check if the module has been initialized.
   */
  isInitialized() {
    return this.initialized;
  }
  /**
   * Check if the module is enabled.
   */
  isEnabled() {
    return this.config.enabled ?? true;
  }
  /**
   * Get the current configuration (read-only copy).
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Get the breadcrumb tracker instance.
   */
  getBreadcrumbTracker() {
    return this.breadcrumbTracker;
  }
  /**
   * Set user context for associating captures with an anonymous user.
   */
  setUserContext(user) {
    this.userContext = user;
  }
  /**
   * Get the current user context.
   */
  getUserContext() {
    return this.userContext;
  }
  /**
   * Set a tag key-value pair for all future captures.
   */
  setTag(key, value) {
    this.tags[key] = value;
  }
  /**
   * Get all currently set tags.
   */
  getTags() {
    return { ...this.tags };
  }
  /**
   * Initialize auto-instrumentation
   * Registers global error handler and unhandled rejection handler.
   * Safe to call multiple times -- only initializes once.
   * @task TASK-584
   */
  init() {
    if (this.initialized) return;
    if (typeof window === "undefined") return;
    this.initialized = true;
    this.breadcrumbTracker.init();
    this.originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (this.isEnabled()) {
        this.captureError(error || new Error(String(message)));
      }
      if (this.originalOnError) {
        return this.originalOnError.call(window, message, source, lineno, colno, error);
      }
      return false;
    };
    this.unhandledRejectionHandler = (event) => {
      if (this.isEnabled()) {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        this.captureError(error, { level: "error" });
      }
    };
    window.addEventListener("unhandledrejection", this.unhandledRejectionHandler);
    this.cspViolationHandler = (event) => {
      if (this.isEnabled()) {
        const error = new Error(
          `CSP violation: ${event.violatedDirective} blocked ${event.blockedURI || "inline"}`
        );
        error.name = "SecurityPolicyViolation";
        this.captureError(error, {
          level: "error",
          tags: {
            "csp.directive": event.violatedDirective,
            "csp.blockedURI": event.blockedURI || "",
            "csp.sourceFile": event.sourceFile || ""
          }
        });
      }
    };
    document.addEventListener("securitypolicyviolation", this.cspViolationHandler);
  }
  /**
   * Clean up auto-instrumentation and stop tracking.
   * @task TASK-584
   */
  destroy() {
    if (!this.initialized) return;
    this.breadcrumbTracker.destroy();
    if (typeof window !== "undefined") {
      window.onerror = this.originalOnError;
      this.originalOnError = null;
      if (this.unhandledRejectionHandler) {
        window.removeEventListener("unhandledrejection", this.unhandledRejectionHandler);
        this.unhandledRejectionHandler = null;
      }
    }
    if (typeof document !== "undefined" && this.cspViolationHandler) {
      document.removeEventListener("securitypolicyviolation", this.cspViolationHandler);
      this.cspViolationHandler = null;
    }
    this.initialized = false;
  }
  /**
   * Capture an error with the configured strategy
   * @task TASK-585
   */
  async captureError(error, options = {}) {
    if (!this.isEnabled()) return null;
    if (Math.random() > (this.config.sampleRate ?? 1)) return null;
    try {
      const requestedStrategy = options.strategies?.[0] || this.config.strategies?.[0] || "semantic-dom";
      const strategyName = this.resolveStrategyName(requestedStrategy) || "semantic_dom";
      const strategy = this.strategies.get(strategyName);
      if (!strategy) return null;
      const captureData = await strategy.capture({ error });
      const errorInfo = {
        name: error.name,
        message: error.message
      };
      if (error.stack) errorInfo.stack = error.stack;
      const context = {
        tags: { ...this.tags, ...options.tags }
      };
      if (this.userContext) context.user = this.userContext;
      let event = {
        error: errorInfo,
        capture: {
          strategies: [requestedStrategy],
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          data: captureData
        },
        context,
        breadcrumbs: this.breadcrumbTracker.getBreadcrumbs()
      };
      if (this.config.beforeCapture) {
        const modified = this.config.beforeCapture(event);
        if (!modified) return null;
        event = modified;
      }
      if (this.config.request) {
        const response = await this.config.request(
          `${this.config.apiUrl}/api/v1/debug/capture`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              error: {
                type: event.error.name,
                message: event.error.message,
                stack: event.error.stack
              },
              severity: options.level === "debug" ? "info" : options.level ?? "error",
              capture: { strategy: strategyName, data: event.capture.data },
              context: typeof window !== "undefined" ? {
                url: window.location.pathname,
                userAgent: navigator.userAgent,
                viewport: { width: window.innerWidth, height: window.innerHeight }
              } : void 0,
              breadcrumbs: event.breadcrumbs?.map((bc) => ({
                ...bc,
                timestamp: new Date(bc.timestamp).getTime()
              })),
              metadata: {
                environment: this.config.environment,
                release: this.config.release,
                sessionId: this.sessionId
              }
            })
          }
        );
        if (response.ok) {
          return await response.json();
        }
        if (response.status === 429) {
          console.warn("[AuthHub Debug] Rate limited");
        } else if (response.status === 403) {
          console.warn("[AuthHub Debug] API key lacks debug scope");
        } else {
          const body = await response.text().catch(() => "");
          console.warn(`[AuthHub Debug] Capture failed (${response.status}): ${body}`);
        }
      }
      return null;
    } catch (err) {
      console.error("[AuthHub Debug] Capture error:", err);
      return null;
    }
  }
  /**
   * Capture a non-error message
   * @task TASK-587
   */
  async captureMessage(message, options = {}) {
    const error = new Error(message);
    error.name = "Message";
    return this.captureError(error, { level: "info", ...options });
  }
  /**
   * Add a custom breadcrumb
   * @task TASK-587
   */
  addBreadcrumb(breadcrumb) {
    const bc = {
      type: breadcrumb.type ?? "custom",
      category: breadcrumb.category,
      message: breadcrumb.message
    };
    if (breadcrumb.data) bc.data = breadcrumb.data;
    if (breadcrumb.level) bc.level = breadcrumb.level;
    this.breadcrumbTracker.add(bc);
  }
  /**
   * Set user context (anonymous ID only)
   * @task TASK-587
   */
  setUser(user) {
    if (user && !user.id) {
      console.warn("[AuthHub Debug] UserContext requires id field");
      return;
    }
    this.userContext = user;
  }
  /**
   * Set multiple tags
   * @task TASK-587
   */
  setTags(tags) {
    this.tags = { ...this.tags, ...tags };
  }
  /**
   * Clear all breadcrumbs
   * @task TASK-587
   */
  clearBreadcrumbs() {
    this.breadcrumbTracker.clear();
  }
  /**
   * Get current user context
   * @task TASK-587
   */
  getUser() {
    return this.userContext;
  }
};

// src/version.ts
var SDK_VERSION = "1.0.0";
var SDK_CLIENT = "typescript";

// src/client.ts
var NonRetryableError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NonRetryableError";
  }
};
var AuthHubClient = class {
  /**
   * Creates a new AuthHub client.
   *
   * @param config - Client configuration options
   * @throws {Error} If baseUrl is missing
   * @throws {Error} If apiKey is missing
   *
   * @example
   * ```typescript
   * const client = new AuthHubClient({
   *   baseUrl: 'https://authhub.example.com',
   *   apiKey: 'ak_your_api_key',
   *   timeout: 60000, // 60 seconds
   *   retries: 5,
   * });
   * ```
   */
  constructor(config) {
    /**
     * Lazily-initialized debug module instance.
     * @internal
     */
    this._debug = null;
    if (!config.baseUrl) {
      throw new Error("AuthHubClient: baseUrl is required");
    }
    if (!config.apiKey) {
      throw new Error("AuthHubClient: apiKey is required");
    }
    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ""),
      // Remove trailing slash
      apiKey: config.apiKey,
      timeout: config.timeout ?? 3e4,
      retries: config.retries ?? 3,
      auth: config.auth,
      debug: config.debug
    };
    this.ai = new AIModule({
      request: this.request.bind(this),
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout
    });
    this.db = new DBModule({
      request: this.request.bind(this)
    });
    this.secrets = new SecretsModule({
      request: this.request.bind(this)
    });
  }
  /**
   * Debug module for zero-trust debug logging and error capture.
   *
   * Lazily initialized on first access. Configure via the `debug` option
   * in `AuthHubClientConfig`.
   *
   * @example
   * ```typescript
   * const client = new AuthHubClient({
   *   baseUrl: 'https://authhub.example.com',
   *   apiKey: 'ak_your_api_key',
   *   debug: {
   *     environment: 'production',
   *     release: '1.2.0',
   *     sampleRate: 0.5,
   *   },
   * });
   *
   * // Auto-instrument global error handlers
   * client.initDebug();
   *
   * // Manual error capture
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   await client.debug.captureError(error);
   * }
   * ```
   */
  get debug() {
    if (!this._debug) {
      const debugConfig = this.config.debug ?? {};
      const debugInit = {
        appId: this.config.apiKey,
        apiUrl: this.config.baseUrl,
        request: (url, init) => fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            "X-API-Key": this.config.apiKey,
            "X-SDK-Version": SDK_VERSION,
            "X-SDK-Client": SDK_CLIENT
          }
        }),
        environment: debugConfig.environment ?? "production",
        release: debugConfig.release ?? ""
      };
      if (debugConfig.enabled !== void 0) debugInit.enabled = debugConfig.enabled;
      if (debugConfig.sampleRate !== void 0) debugInit.sampleRate = debugConfig.sampleRate;
      if (debugConfig.maxBreadcrumbs !== void 0) debugInit.maxBreadcrumbs = debugConfig.maxBreadcrumbs;
      if (debugConfig.strategies) debugInit.strategies = debugConfig.strategies;
      this._debug = new DebugModule(debugInit);
    }
    return this._debug;
  }
  /**
   * Initialize debug auto-instrumentation.
   *
   * Registers global error handlers (`window.onerror`, `unhandledrejection`)
   * and starts breadcrumb tracking. Safe to call multiple times.
   *
   * @example
   * ```typescript
   * const client = new AuthHubClient({ ... });
   * client.initDebug(); // Start capturing errors automatically
   * ```
   */
  initDebug() {
    this.debug.init();
  }
  /**
   * Get the base URL of the AuthHub API.
   */
  get baseUrl() {
    return this.config.baseUrl;
  }
  /**
   * Get the configured timeout in milliseconds.
   */
  get timeout() {
    return this.config.timeout;
  }
  /**
   * Get the configured retry count.
   */
  get retries() {
    return this.config.retries;
  }
  /**
   * Build the full URL for an API request.
   *
   * @param path - API endpoint path
   * @param params - Optional query parameters
   * @returns Full URL with query string
   */
  buildUrl(path, params) {
    const url = new URL(path, this.config.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== void 0) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }
  /**
   * Get default headers for API requests.
   *
   * Includes tracking headers for request correlation and SDK version tracking.
   *
   * @returns Headers object with authentication, content type, and tracking info
   */
  getHeaders() {
    return {
      "X-API-Key": this.config.apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
      // Tracking headers for observability
      "X-Request-ID": this.generateRequestId(),
      "X-SDK-Version": SDK_VERSION,
      "X-SDK-Client": SDK_CLIENT
    };
  }
  /**
   * Generate a unique request ID for correlation.
   *
   * Uses crypto.randomUUID() if available, otherwise falls back to timestamp-based ID.
   *
   * @returns Unique request ID
   * @internal
   */
  generateRequestId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  /**
   * Make an authenticated HTTP request to the AuthHub API.
   *
   * @param options - Request options
   * @returns Parsed JSON response
   * @throws {Error} If the request fails or returns an error response
   *
   * @internal
   */
  async request(options) {
    const { method, path, body, params, timeout, headers: extraHeaders } = options;
    const url = this.buildUrl(path, params);
    const headers = { ...this.getHeaders(), ...extraHeaders };
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout ?? this.config.timeout
    );
    let lastError = null;
    let attempts = 0;
    while (attempts < this.config.retries) {
      attempts++;
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body !== void 0 ? JSON.stringify(body) : null,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const extractErrorMessage = () => {
            if ("error" in errorBody && errorBody.error && typeof errorBody.error === "object") {
              const errorObj = errorBody.error;
              if ("message" in errorObj && typeof errorObj["message"] === "string") {
                return errorObj["message"];
              }
            }
            return `Request failed with status ${response.status}`;
          };
          const errorMessage = extractErrorMessage();
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new NonRetryableError(errorMessage);
          }
          lastError = new Error(errorMessage);
          if (attempts < this.config.retries) {
            await this.delay(100 * Math.pow(2, attempts - 1));
          }
          continue;
        }
        if (response.status === 204) {
          return {};
        }
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error) {
          if (error instanceof NonRetryableError) {
            throw new Error(error.message);
          }
          if (error.name === "AbortError") {
            throw new Error(`Request timed out after ${timeout ?? this.config.timeout}ms`);
          }
          lastError = error;
          if (attempts < this.config.retries) {
            await this.delay(100 * Math.pow(2, attempts - 1));
          }
        } else {
          throw error;
        }
      }
    }
    throw lastError ?? new Error("Request failed after retries");
  }
  /**
   * Delay execution for the specified milliseconds.
   *
   * @param ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Make a GET request.
   *
   * @param path - API endpoint path
   * @param params - Optional query parameters
   * @returns Parsed JSON response
   *
   * @internal
   */
  get(path, params) {
    return this.request({ method: "GET", path, ...params && { params } });
  }
  /**
   * Make a POST request.
   *
   * @param path - API endpoint path
   * @param body - Request body
   * @returns Parsed JSON response
   *
   * @internal
   */
  post(path, body) {
    return this.request({ method: "POST", path, body });
  }
  /**
   * Make a PUT request.
   *
   * @param path - API endpoint path
   * @param body - Request body
   * @returns Parsed JSON response
   *
   * @internal
   */
  put(path, body) {
    return this.request({ method: "PUT", path, body });
  }
  /**
   * Make a DELETE request.
   *
   * @param path - API endpoint path
   * @returns Parsed JSON response
   *
   * @internal
   */
  delete(path) {
    return this.request({ method: "DELETE", path });
  }
  /**
   * Verify a Bearer token and return the authenticated user.
   *
   * Use this server-side to validate tokens from incoming requests.
   * Calls the AuthHub `/api/v1/auth/me` endpoint with the provided token.
   *
   * @param token - The Bearer access token to verify
   * @returns The authenticated user, or null if the token is invalid/expired
   *
   * @example
   * ```typescript
   * // Next.js API route
   * const token = request.headers.get('Authorization')?.slice(7);
   * if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });
   *
   * const user = await client.verifyToken(token);
   * if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
   *
   * // user.id, user.email, user.name are available
   * ```
   */
  async verifyToken(token) {
    try {
      const response = await this.request({
        method: "GET",
        path: "/api/v1/auth/me",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      return response.data?.user ?? null;
    } catch {
      return null;
    }
  }
};

// src/errors/index.ts
var AuthHubError = class _AuthHubError extends Error {
  constructor(message, code, statusCode, details) {
    super(message);
    this.name = "AuthHubError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _AuthHubError);
    }
  }
  /**
   * Get a user-friendly error message with troubleshooting hints.
   */
  get hint() {
    switch (this.code) {
      case "AUTH_ERROR":
        return "Check your API key is correct and not expired.";
      case "RATE_LIMIT":
        return "You are being rate limited. Wait and retry.";
      case "VALIDATION_ERROR":
        return "Check your request parameters.";
      case "NETWORK_ERROR":
        return "Check your network connection and AuthHub URL.";
      default:
        return "An unexpected error occurred.";
    }
  }
};
var AuthError = class extends AuthHubError {
  constructor(message = "Authentication failed", details) {
    super(message, "AUTH_ERROR", 401, details);
    this.name = "AuthError";
  }
};
var RateLimitError = class extends AuthHubError {
  constructor(message = "Rate limit exceeded", retryAfter, details) {
    super(message, "RATE_LIMIT", 429, details);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
};
var ValidationError = class extends AuthHubError {
  constructor(message = "Validation failed", fields, details) {
    super(message, "VALIDATION_ERROR", 400, { ...details, fields });
    this.name = "ValidationError";
    this.fields = fields;
  }
};
var NetworkError = class extends AuthHubError {
  constructor(message = "Network request failed", isTransient = true, details) {
    super(message, "NETWORK_ERROR", void 0, details);
    this.name = "NetworkError";
    this.isTransient = isTransient;
  }
};
var ServerError = class extends AuthHubError {
  constructor(message = "Internal server error", statusCode = 500, details) {
    super(message, "SERVER_ERROR", statusCode, details);
    this.name = "ServerError";
  }
};
var NotFoundError = class extends AuthHubError {
  constructor(message = "Resource not found", resource, details) {
    super(message, "NOT_FOUND", 404, { ...details, resource });
    this.name = "NotFoundError";
    this.resource = resource;
  }
};
var AIError = class _AIError extends AuthHubError {
  constructor(message, aiCode, statusCode, model) {
    super(message, "AI_ERROR", statusCode, { aiCode, model });
    this.name = "AIError";
    this.aiCode = aiCode;
    this.model = model;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, _AIError);
    }
  }
  /**
   * Whether this error is likely transient and worth retrying.
   *
   * Returns true for rate limits, timeouts, circuit breaker, and provider unavailability.
   */
  get isRetryable() {
    return [
      "rate_limit_exceeded",
      "timeout",
      "circuit_open",
      "provider_unavailable"
    ].includes(this.aiCode);
  }
  /**
   * User-friendly suggestion for resolving this error.
   */
  get suggestion() {
    switch (this.aiCode) {
      case "invalid_model":
        return "Use client.ai.listModels() to see available models.";
      case "no_provider_configured":
        return "Contact your administrator to configure an AI provider in AuthHub.";
      case "provider_unavailable":
        return "The AI provider is temporarily unavailable. Try again in a few moments.";
      case "rate_limit_exceeded":
        return "You are being rate limited. Wait and retry with exponential backoff.";
      case "circuit_open":
        return "Provider circuit breaker is open due to repeated failures. Try later.";
      case "timeout":
        return "Request timed out. Try a shorter prompt or increase the timeout.";
      case "content_filtered":
        return "Content was filtered by the model's safety systems. Modify your prompt.";
      case "context_length_exceeded":
        return "Prompt exceeds model context window. Use a model with larger context or shorten your input.";
      case "internal_error":
      default:
        return "An unexpected error occurred. Check AuthHub logs for details.";
    }
  }
  /**
   * Get a human-readable description of this error code.
   */
  get description() {
    switch (this.aiCode) {
      case "invalid_model":
        return "The specified model ID is not recognized or not available.";
      case "no_provider_configured":
        return "No AI provider is configured for the model type you requested.";
      case "provider_unavailable":
        return "The AI provider is not responding or has an outage.";
      case "rate_limit_exceeded":
        return "Too many requests sent to the AI provider.";
      case "circuit_open":
        return "The provider has been temporarily disabled due to errors.";
      case "timeout":
        return "The AI request took too long to complete.";
      case "content_filtered":
        return "The request or response was blocked by content filtering.";
      case "context_length_exceeded":
        return "The prompt is too long for the selected model.";
      case "internal_error":
      default:
        return "An internal error occurred while processing your request.";
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AIError,
  AIModule,
  AuthClient,
  AuthError,
  AuthHubClient,
  AuthHubError,
  AuthenticationError,
  DBModule,
  DebugModule,
  LocalStorageTokenStorage,
  MemoryTokenStorage,
  NetworkError,
  NotFoundError,
  OAuthProvider,
  RateLimitError,
  SDK_CLIENT,
  SDK_VERSION,
  SecretsModule,
  ServerError,
  SessionStorageTokenStorage,
  ValidationError,
  createAuthClient,
  createStoredTokenData,
  createTokenStorage,
  getGitHubAuthUrl,
  getGoogleAuthUrl,
  getOAuthError,
  getOAuthUrl,
  getTokenExpiresIn,
  hasOAuthCallback,
  hasOAuthError,
  isTokenExpired,
  parseOAuthCallbackResult
});
//# sourceMappingURL=index.cjs.map