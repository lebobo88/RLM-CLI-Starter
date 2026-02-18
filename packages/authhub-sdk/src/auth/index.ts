/**
 * AuthHub SDK Auth Module
 *
 * Authentication and authorization functionality for the SDK.
 *
 * @module @authhub/sdk/auth
 * @feature FTR-051
 */

// Export all types
export type {
  // Configuration
  AuthMode,
  StorageType,
  AuthModuleConfig,
  // Token Storage
  StoredTokenData,
  TokenStorage,
  // User
  AuthUser,
  // State
  AuthState,
  // Results
  LoginResult,
  RegisterResult,
  RefreshResult,
  PasswordResetResult,
  // Credentials
  LoginCredentials,
  RegisterData,
  RedirectLoginOptions,
  // Module Interface
  AuthModule,
  // Error types
  AuthErrorCode,
  // OAuth types
  OAuthCallbackParams,
  TokenExchangeRequest,
  TokenResponse,
} from './types';

// Export error class
export { AuthenticationError } from './types';

// Export storage implementations
export {
  LocalStorageTokenStorage,
  SessionStorageTokenStorage,
  MemoryTokenStorage,
  createTokenStorage,
  isTokenExpired,
  getTokenExpiresIn,
  createStoredTokenData,
} from './storage';

// Export storage types
export type { StorageStrategyType } from './storage';

// Export PKCE utilities
export {
  generateCodeVerifier,
  generateCodeChallenge,
  generatePKCECodePair,
  generateState,
  storePKCEData,
  retrievePKCEData,
  clearPKCEData,
  PKCE_VERIFIER_KEY,
  OAUTH_STATE_KEY,
  REDIRECT_TARGET_KEY,
} from './pkce';

// Export PKCE types
export type { PKCECodePair } from './pkce';

// Export redirect mode
export {
  RedirectMode,
  isRedirectModeSupported,
  isOAuthCallback,
} from './redirect';

// Export redirect mode types
export type {
  RedirectModeConfig,
  RedirectOptions,
  RegisterRedirectOptions,
  LogoutOptions,
} from './redirect';

// Export callback handling
export {
  CallbackHandler,
  parseOAuthCallback,
  isCallbackUrl,
  hasCallbackError,
} from './callback';

// Export callback types
export type {
  CallbackConfig,
  CallbackResult,
} from './callback';

// Export embedded mode
export { EmbeddedMode } from './embedded';

// Export embedded mode types
export type { EmbeddedModeConfig } from './embedded';

// Export token manager
export {
  TokenManager,
  decodeJwtPayload,
  getJwtExpiration,
  isJwtExpired,
} from './token-manager';

// Export token manager types
export type { TokenManagerConfig } from './token-manager';

// Export state management
export {
  AuthStateManager,
  createLoadingState,
  createUnauthenticatedState,
  createAuthenticatedState,
} from './state';

// Export state management types
export type {
  AuthEvent,
  AuthEventPayload,
  AuthStateCallback,
  AuthEventCallback,
  Unsubscribe,
  AuthStateManagerConfig,
} from './state';

// Export React hooks and components
// Note: Import from '@authhub/sdk/auth/react' to avoid React dependency in main bundle
export {
  useAuthHubAuth,
  useIsAuthenticated,
  useCurrentUser,
  useAuthLoading,
  AuthProvider,
  useAuth,
} from './react';

// Export React hook types
export type {
  AuthClientForHooks,
  UseAuthHubAuthReturn,
  AuthContextValue,
  AuthProviderProps,
} from './react';

// Export auth client
export { AuthClient, createAuthClient } from './client';

// Export auth client types
export type { AuthClientConfig } from './client';

// Export OAuth URL generators and callback parsing
export {
  OAuthProvider,
  getGoogleAuthUrl,
  getGitHubAuthUrl,
  getOAuthUrl,
  parseOAuthCallbackResult,
  hasOAuthCallback,
  hasOAuthError,
  getOAuthError,
} from './oauth';

// Export OAuth types
export type {
  OAuthUrlOptions,
  OAuthCallbackResult,
} from './oauth';
