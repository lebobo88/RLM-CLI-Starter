/**
 * AuthHub SDK React Hooks
 *
 * React integration for AuthHub authentication.
 * Uses useSyncExternalStore for React 18 concurrent mode safety.
 *
 * @module @authhub/sdk/auth/react
 * @feature FTR-051
 */

import {
  useSyncExternalStore,
  useCallback,
  useMemo,
  createContext,
  useContext,
  useState,
  useEffect,
  createElement,
  type ReactNode,
} from 'react';
import type { AuthState, AuthUser, LoginCredentials, RegisterData } from './types';
import type { AuthClient } from './client';
import type { AuthStateManager } from './state';
import type { RedirectMode } from './redirect';
import type { EmbeddedMode } from './embedded';
import type { CallbackHandler } from './callback';

// ============================================================================
// Types
// ============================================================================

/**
 * Auth client interface for hooks.
 * This should match the AuthClient implementation from client integration.
 */
export interface AuthClientForHooks {
  /** State manager instance */
  stateManager: AuthStateManager;
  /** Redirect mode instance (if mode is 'redirect') */
  redirectMode?: RedirectMode;
  /** Embedded mode instance (if mode is 'embedded') */
  embeddedMode?: EmbeddedMode;
  /** Callback handler instance (for redirect mode) */
  callbackHandler?: CallbackHandler;
  /** Current auth mode */
  mode: 'redirect' | 'embedded';
}

/**
 * Return type for useAuthHubAuth hook.
 */
export interface UseAuthHubAuthReturn {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being determined */
  isLoading: boolean;
  /** Current authenticated user (null if not authenticated) */
  user: AuthUser | null;
  /** Full auth state object */
  state: AuthState;
  /** Initiate login (redirect mode redirects, embedded mode takes credentials) */
  login: (credentials?: LoginCredentials) => Promise<void>;
  /** Initiate registration (redirect mode redirects, embedded mode takes data) */
  register: (data?: RegisterData) => Promise<void>;
  /** Log out the current user */
  logout: () => Promise<void>;
  /** Handle OAuth callback (redirect mode only) */
  handleCallback: (url?: string) => Promise<void>;
  /** Error from last auth operation */
  error: Error | null;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * React hook for AuthHub authentication.
 *
 * Provides reactive auth state and auth methods for React components.
 * Uses useSyncExternalStore for concurrent mode safety.
 *
 * @param client - AuthHub client with auth module initialized
 * @returns Auth state and methods
 *
 * @example
 * ```tsx
 * function App() {
 *   const {
 *     isAuthenticated,
 *     isLoading,
 *     user,
 *     login,
 *     logout,
 *   } = useAuthHubAuth(authClient);
 *
 *   if (isLoading) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   if (!isAuthenticated) {
 *     return (
 *       <button onClick={() => login()}>
 *         Sign In
 *       </button>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}!</p>
 *       <button onClick={logout}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthHubAuth(client: AuthClientForHooks): UseAuthHubAuthReturn {
  // Subscribe to auth state changes using useSyncExternalStore
  const state = useSyncExternalStore(
    // Subscribe function
    useCallback(
      (callback: () => void) => {
        return client.stateManager.onStateChange(callback);
      },
      [client.stateManager]
    ),
    // Get snapshot function
    useCallback(() => client.stateManager.getState(), [client.stateManager]),
    // Get server snapshot (for SSR)
    useCallback(() => client.stateManager.getState(), [client.stateManager])
  );

  // Memoized login function
  const login = useCallback(
    async (credentials?: LoginCredentials) => {
      if (client.mode === 'redirect' && client.redirectMode) {
        await client.redirectMode.login();
      } else if (client.mode === 'embedded' && client.embeddedMode && credentials) {
        const result = await client.embeddedMode.login(credentials);
        if (!result.success && result.error) {
          throw result.error;
        }
      } else if (client.mode === 'embedded' && !credentials) {
        throw new Error('Credentials required for embedded mode login');
      }
    },
    [client]
  );

  // Memoized register function
  const register = useCallback(
    async (data?: RegisterData) => {
      if (client.mode === 'redirect' && client.redirectMode) {
        const options: import('./redirect').RegisterRedirectOptions = {};
        if (data?.email) {
          options.email = data.email;
        }
        if (data?.name) {
          options.name = data.name;
        }
        await client.redirectMode.register(options);
      } else if (client.mode === 'embedded' && client.embeddedMode && data) {
        const result = await client.embeddedMode.register(data);
        if (!result.success && result.error) {
          throw result.error;
        }
      } else if (client.mode === 'embedded' && !data) {
        throw new Error('Registration data required for embedded mode');
      }
    },
    [client]
  );

  // Memoized logout function
  const logout = useCallback(async () => {
    if (client.mode === 'redirect' && client.redirectMode) {
      await client.redirectMode.logout();
    } else if (client.mode === 'embedded' && client.embeddedMode) {
      await client.embeddedMode.logout();
    }
    client.stateManager.setSignedOut();
  }, [client]);

  // Memoized callback handler
  const handleCallback = useCallback(
    async (url?: string) => {
      if (!client.callbackHandler) {
        throw new Error('Callback handler not available');
      }
      const result = await client.callbackHandler.handleCallback(url);
      if (result.success && result.user) {
        const tokenData: import('./types').StoredTokenData = {
          accessToken: result.accessToken ?? '',
          expiresAt: result.expiresAt?.getTime() ?? Date.now() + 3600000,
          tokenType: 'Bearer',
        };
        if (result.refreshToken) {
          tokenData.refreshToken = result.refreshToken;
        }
        client.stateManager.setSignedIn(result.user, tokenData);
      } else if (!result.success && result.error) {
        throw result.error;
      }
    },
    [client]
  );

  // Memoize return object
  return useMemo(
    () => ({
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      user: state.user,
      state,
      login,
      register,
      logout,
      handleCallback,
      error: state.error ?? null,
    }),
    [state, login, register, logout, handleCallback]
  );
}

/**
 * Hook to check if user is authenticated.
 * Lighter alternative to useAuthHubAuth when you only need auth status.
 *
 * @param client - AuthHub client with auth module
 * @returns Whether user is authenticated
 */
export function useIsAuthenticated(client: AuthClientForHooks): boolean {
  return useSyncExternalStore(
    useCallback(
      (callback: () => void) => client.stateManager.onStateChange(callback),
      [client.stateManager]
    ),
    useCallback(() => client.stateManager.isAuthenticated(), [client.stateManager]),
    useCallback(() => client.stateManager.isAuthenticated(), [client.stateManager])
  );
}

/**
 * Hook to get current user.
 *
 * @param client - AuthHub client with auth module
 * @returns Current user or null
 */
export function useCurrentUser(client: AuthClientForHooks): AuthUser | null {
  return useSyncExternalStore(
    useCallback(
      (callback: () => void) => client.stateManager.onStateChange(callback),
      [client.stateManager]
    ),
    useCallback(() => client.stateManager.getUser(), [client.stateManager]),
    useCallback(() => client.stateManager.getUser(), [client.stateManager])
  );
}

/**
 * Hook for auth loading state.
 *
 * @param client - AuthHub client with auth module
 * @returns Whether auth state is loading
 */
export function useAuthLoading(client: AuthClientForHooks): boolean {
  return useSyncExternalStore(
    useCallback(
      (callback: () => void) => client.stateManager.onStateChange(callback),
      [client.stateManager]
    ),
    useCallback(() => client.stateManager.isLoading(), [client.stateManager]),
    useCallback(() => client.stateManager.isLoading(), [client.stateManager])
  );
}

// ============================================================================
// AuthProvider + useAuth (context-based API)
// ============================================================================

/**
 * Context value provided by AuthProvider.
 */
export interface AuthContextValue {
  /** Current authenticated user (null if not authenticated) */
  user: AuthUser | null;
  /** Whether auth state is being determined */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Initiate login (redirects in redirect mode, takes credentials in embedded mode) */
  login: (credentials?: LoginCredentials) => Promise<void>;
  /** Log out the current user */
  logout: () => Promise<void>;
  /** Get a valid access token for API calls (auto-refreshes if needed) */
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for AuthProvider.
 */
export interface AuthProviderProps {
  /** AuthClient instance to use for authentication */
  client: AuthClient;
  /** Child components */
  children: ReactNode;
}

/**
 * React context provider for AuthHub authentication.
 *
 * Wraps your app to provide auth state and methods to all child components
 * via the `useAuth()` hook. Handles client initialization and state
 * synchronization automatically.
 *
 * @example
 * ```tsx
 * import { AuthClient, AuthProvider } from '@authhub/sdk';
 *
 * const authClient = new AuthClient({
 *   baseUrl: 'https://authhub.example.com',
 *   appSlug: 'my-app',
 *   auth: { mode: 'redirect', callbackUrl: '/auth/callback' },
 * });
 *
 * function App() {
 *   return (
 *     <AuthProvider client={authClient}>
 *       <MyApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({ client, children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        unsubscribe = client.onStateChange((state) => {
          setAuthState(state);
        });

        await client.initialize();
        setAuthState(client.getState());
      } catch (error) {
        console.error('[AuthHub] Failed to initialize auth:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    void init();

    return () => {
      unsubscribe?.();
    };
  }, [client]);

  const login = useCallback(
    async (credentials?: LoginCredentials) => {
      await client.login(credentials);
    },
    [client]
  );

  const logout = useCallback(async () => {
    await client.logout();
  }, [client]);

  const getAccessToken = useCallback(async () => {
    return client.getAccessToken();
  }, [client]);

  const value: AuthContextValue = useMemo(
    () => ({
      user: authState.user,
      isLoading: authState.isLoading,
      isAuthenticated: authState.isAuthenticated,
      login,
      logout,
      getAccessToken,
    }),
    [authState, login, logout, getAccessToken]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

/**
 * Hook to access auth state and methods from AuthProvider.
 *
 * Must be used within an `<AuthProvider>`. Unlike `useAuthHubAuth`, this
 * hook does not require passing the client instance - it reads from context.
 *
 * @returns Auth state and methods
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function ProfileButton() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={() => login()}>Sign In</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <span>{user?.name}</span>
 *       <button onClick={logout}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
