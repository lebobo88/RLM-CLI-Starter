/**
 * AuthHub SDK Auth State Management
 *
 * Reactive state tracking with pub/sub for UI updates.
 *
 * @module @authhub/sdk/auth/state
 * @feature FTR-051
 */

import type { AuthState, AuthUser, TokenStorage, StoredTokenData } from './types';
import { AuthenticationError } from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Auth events that can be subscribed to.
 */
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'SESSION_EXPIRED'
  | 'LOADING';

/**
 * Event payload types.
 */
export interface AuthEventPayload {
  SIGNED_IN: { user: AuthUser; accessToken: string };
  SIGNED_OUT: { reason?: string };
  TOKEN_REFRESHED: { accessToken: string; expiresAt: Date };
  USER_UPDATED: { user: AuthUser };
  SESSION_EXPIRED: { error: AuthenticationError };
  LOADING: { isLoading: boolean };
}

/**
 * Callback type for auth state changes.
 */
export type AuthStateCallback = (state: AuthState) => void;

/**
 * Callback type for specific auth events.
 */
export type AuthEventCallback<E extends AuthEvent> = (
  payload: AuthEventPayload[E]
) => void;

/**
 * Unsubscribe function returned from subscribe methods.
 */
export type Unsubscribe = () => void;

/**
 * Configuration for auth state manager.
 */
export interface AuthStateManagerConfig {
  /** Token storage to read auth state from */
  storage: TokenStorage;
  /** Optional user fetcher function */
  fetchUser?: (accessToken: string) => Promise<AuthUser>;
}

// ============================================================================
// Auth State Manager
// ============================================================================

/**
 * Manages authentication state with reactive subscriptions.
 *
 * @example
 * ```typescript
 * const stateManager = new AuthStateManager({
 *   storage: new LocalStorageTokenStorage(),
 * });
 *
 * // Subscribe to state changes
 * const unsubscribe = stateManager.onStateChange((state) => {
 *   console.log('Auth state:', state);
 * });
 *
 * // Subscribe to specific events
 * stateManager.on('SIGNED_IN', ({ user }) => {
 *   console.log('Welcome,', user.name);
 * });
 *
 * // Check current state
 * if (stateManager.isAuthenticated()) {
 *   const user = stateManager.getUser();
 * }
 *
 * // Clean up
 * unsubscribe();
 * ```
 */
export class AuthStateManager {
  private readonly config: AuthStateManagerConfig;
  private currentState: AuthState;
  private currentUser: AuthUser | null = null;
  private stateListeners: Set<AuthStateCallback> = new Set();
  private eventListeners: Map<AuthEvent, Set<AuthEventCallback<AuthEvent>>> = new Map();

  constructor(config: AuthStateManagerConfig) {
    this.config = config;

    // Initialize with loading state
    this.currentState = {
      isAuthenticated: false,
      isLoading: true,
      user: null,
    };

    // Initialize event listener maps
    const events: AuthEvent[] = [
      'SIGNED_IN',
      'SIGNED_OUT',
      'TOKEN_REFRESHED',
      'USER_UPDATED',
      'SESSION_EXPIRED',
      'LOADING',
    ];
    events.forEach((event) => {
      this.eventListeners.set(event, new Set());
    });
  }

  /**
   * Initialize state from storage.
   * Call this on app startup.
   */
  async initialize(): Promise<void> {
    this.emitEvent('LOADING', { isLoading: true });

    try {
      const tokens = await this.config.storage.getTokens();

      if (tokens) {
        // Try to get user info if we have a fetcher
        if (this.config.fetchUser) {
          try {
            this.currentUser = await this.config.fetchUser(tokens.accessToken);
          } catch {
            // Token might be invalid
            this.currentUser = null;
          }
        }

        if (this.currentUser || !this.config.fetchUser) {
          this.updateState({
            isAuthenticated: true,
            isLoading: false,
            user: this.currentUser,
            accessToken: tokens.accessToken,
            expiresAt: new Date(tokens.expiresAt),
          });
          return;
        }
      }

      // Not authenticated
      this.updateState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    } finally {
      this.emitEvent('LOADING', { isLoading: false });
    }
  }

  /**
   * Get the current authentication state.
   */
  getState(): AuthState {
    return { ...this.currentState };
  }

  /**
   * Get the current user if authenticated.
   */
  getUser(): AuthUser | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  /**
   * Check if user is authenticated.
   */
  isAuthenticated(): boolean {
    return this.currentState.isAuthenticated;
  }

  /**
   * Check if auth state is still loading.
   */
  isLoading(): boolean {
    return this.currentState.isLoading;
  }

  /**
   * Subscribe to all auth state changes.
   *
   * @param callback - Function called when state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback: AuthStateCallback): Unsubscribe {
    this.stateListeners.add(callback);

    // Immediately call with current state
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
  on<E extends AuthEvent>(
    event: E,
    callback: AuthEventCallback<E>
  ): Unsubscribe {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(callback as AuthEventCallback<AuthEvent>);
    }

    return () => {
      listeners?.delete(callback as AuthEventCallback<AuthEvent>);
    };
  }

  /**
   * Update state after successful login.
   */
  setSignedIn(user: AuthUser, tokens: StoredTokenData): void {
    this.currentUser = user;

    this.updateState({
      isAuthenticated: true,
      isLoading: false,
      user,
      accessToken: tokens.accessToken,
      expiresAt: new Date(tokens.expiresAt),
    });

    this.emitEvent('SIGNED_IN', {
      user,
      accessToken: tokens.accessToken,
    });
  }

  /**
   * Update state after logout.
   */
  setSignedOut(reason?: string): void {
    this.currentUser = null;

    this.updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const payload: AuthEventPayload['SIGNED_OUT'] = {};
    if (reason) {
      payload.reason = reason;
    }

    this.emitEvent('SIGNED_OUT', payload);
  }

  /**
   * Update state after token refresh.
   */
  setTokenRefreshed(tokens: StoredTokenData): void {
    this.updateState({
      ...this.currentState,
      accessToken: tokens.accessToken,
      expiresAt: new Date(tokens.expiresAt),
    });

    this.emitEvent('TOKEN_REFRESHED', {
      accessToken: tokens.accessToken,
      expiresAt: new Date(tokens.expiresAt),
    });
  }

  /**
   * Update user information.
   */
  setUser(user: AuthUser): void {
    this.currentUser = user;

    this.updateState({
      ...this.currentState,
      user,
    });

    this.emitEvent('USER_UPDATED', { user });
  }

  /**
   * Handle session expiration.
   */
  setSessionExpired(error: AuthenticationError): void {
    this.currentUser = null;

    this.updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error,
    });

    this.emitEvent('SESSION_EXPIRED', { error });
  }

  /**
   * Update internal state and notify listeners.
   */
  private updateState(newState: AuthState): void {
    this.currentState = newState;

    // Notify all state listeners
    this.stateListeners.forEach((listener) => {
      try {
        listener(this.getState());
      } catch (error) {
        console.error('AuthStateManager: Error in state listener', error);
      }
    });
  }

  /**
   * Emit an event to listeners.
   */
  private emitEvent<E extends AuthEvent>(
    event: E,
    payload: AuthEventPayload[E]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;

    listeners.forEach((listener) => {
      try {
        (listener as AuthEventCallback<E>)(payload);
      } catch (error) {
        console.error(`AuthStateManager: Error in ${event} listener`, error);
      }
    });
  }

  /**
   * Clear all listeners.
   */
  clearListeners(): void {
    this.stateListeners.clear();
    this.eventListeners.forEach((listeners) => listeners.clear());
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create initial loading state.
 */
export function createLoadingState(): AuthState {
  return {
    isAuthenticated: false,
    isLoading: true,
    user: null,
  };
}

/**
 * Create unauthenticated state.
 */
export function createUnauthenticatedState(): AuthState {
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
  };
}

/**
 * Create authenticated state.
 */
export function createAuthenticatedState(
  user: AuthUser,
  accessToken: string,
  expiresAt: Date
): AuthState {
  return {
    isAuthenticated: true,
    isLoading: false,
    user,
    accessToken,
    expiresAt,
  };
}
