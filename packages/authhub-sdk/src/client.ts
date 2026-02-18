/**
 * AuthHub Client
 *
 * Core client implementation with HTTP utilities and request handling.
 *
 * @module @authhub/sdk/client
 */

import type {
  AuthHubClientConfig,
  DebugClientConfig,
  ApiErrorResponse,
} from './types';
import type { AuthModuleConfig, AuthUser } from './auth/types';
import { AIModule } from './ai';
import { DBModule } from './db';
import { SecretsModule } from './secrets';
import { DebugModule } from './debug/index';
import { TripoModule } from './tripo3d/index';
import { ElevenLabsModule } from './elevenlabs/index';
import { SDK_VERSION, SDK_CLIENT } from './version';

/**
 * Internal config type with required core fields.
 * Auth config is optional and handled separately.
 * @internal
 */
interface InternalClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
  auth: AuthModuleConfig | undefined;
  debug: DebugClientConfig | undefined;
}

/**
 * HTTP method types supported by the client.
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Error that should not be retried.
 * @internal
 */
class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

/**
 * Options for making HTTP requests.
 */
interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  /** Additional headers to merge with defaults (overrides on conflict). */
  headers?: Record<string, string>;
}

/**
 * AuthHub client for accessing all AuthHub services.
 *
 * @example
 * ```typescript
 * const client = new AuthHubClient({
 *   baseUrl: 'https://authhub.example.com',
 *   apiKey: 'ak_your_api_key',
 * });
 *
 * // Make authenticated requests
 * const response = await client.ai.chat({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * ```
 */
export class AuthHubClient {
  private readonly config: InternalClientConfig;

  /**
   * AI module for chat completions.
   */
  public readonly ai: AIModule;

  /**
   * Database module for queries and transactions.
   */
  public readonly db: DBModule;

  /**
   * Secrets module for accessing application secrets.
   */
  public readonly secrets: SecretsModule;

  /**
   * Lazily-initialized debug module instance.
   * @internal
   */
  private _debug: DebugModule | null = null;

  /**
   * Lazily-initialized Tripo3D module instance.
   * @internal
   */
  private _tripo3d: TripoModule | null = null;

  /**
   * Lazily-initialized ElevenLabs module instance.
   * @internal
   */
  private _elevenlabs: ElevenLabsModule | null = null;

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
  get debug(): DebugModule {
    if (!this._debug) {
      const debugConfig = this.config.debug ?? {};
      const debugInit: import('./debug/types').DebugModuleConfig = {
        appId: this.config.apiKey,
        apiUrl: this.config.baseUrl,
        request: (url: string, init?: RequestInit) => fetch(url, {
          ...init,
          headers: {
            ...init?.headers,
            'X-API-Key': this.config.apiKey,
            'X-SDK-Version': SDK_VERSION,
            'X-SDK-Client': SDK_CLIENT,
          },
        }),
        environment: debugConfig.environment ?? 'production',
        release: debugConfig.release ?? '',
      };
      if (debugConfig.enabled !== undefined) debugInit.enabled = debugConfig.enabled;
      if (debugConfig.sampleRate !== undefined) debugInit.sampleRate = debugConfig.sampleRate;
      if (debugConfig.maxBreadcrumbs !== undefined) debugInit.maxBreadcrumbs = debugConfig.maxBreadcrumbs;
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
  initDebug(): void {
    this.debug.init();
  }

  /**
   * Tripo3D module for 3D model generation, editing, and animation.
   *
   * Lazily initialized on first access.
   *
   * @example
   * ```typescript
   * const task = await client.tripo3d.textToModel({ prompt: 'a medieval castle' });
   * const result = await client.tripo3d.waitForTask(task.task_id);
   * ```
   */
  get tripo3d(): TripoModule {
    if (!this._tripo3d) {
      this._tripo3d = new TripoModule({
        request: this.request.bind(this),
      });
    }
    return this._tripo3d;
  }

  /**
   * ElevenLabs module for audio generation, voice management,
   * music composition, dubbing, and more.
   *
   * Lazily initialized on first access.
   *
   * @example
   * ```typescript
   * const sfx = await client.elevenlabs.generateSoundEffect({
   *   text: 'Thunder rumbling in the distance',
   *   duration_seconds: 5,
   * });
   *
   * const voices = await client.elevenlabs.listVoices();
   * ```
   */
  get elevenlabs(): ElevenLabsModule {
    if (!this._elevenlabs) {
      this._elevenlabs = new ElevenLabsModule({
        request: this.request.bind(this),
      });
    }
    return this._elevenlabs;
  }

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
  constructor(config: AuthHubClientConfig) {
    if (!config.baseUrl) {
      throw new Error('AuthHubClient: baseUrl is required');
    }
    if (!config.apiKey) {
      throw new Error('AuthHubClient: apiKey is required');
    }

    this.config = {
      baseUrl: config.baseUrl.replace(/\/$/, ''), // Remove trailing slash
      apiKey: config.apiKey,
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 3,
      auth: config.auth,
      debug: config.debug,
    };

    // Initialize modules
    this.ai = new AIModule({
      request: this.request.bind(this),
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    });

    this.db = new DBModule({
      request: this.request.bind(this),
    });

    this.secrets = new SecretsModule({
      request: this.request.bind(this),
    });
  }

  /**
   * Get the base URL of the AuthHub API.
   */
  get baseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get the configured timeout in milliseconds.
   */
  get timeout(): number {
    return this.config.timeout;
  }

  /**
   * Get the configured retry count.
   */
  get retries(): number {
    return this.config.retries;
  }

  /**
   * Build the full URL for an API request.
   *
   * @param path - API endpoint path
   * @param params - Optional query parameters
   * @returns Full URL with query string
   */
  protected buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(path, this.config.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
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
  protected getHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.config.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Tracking headers for observability
      'X-Request-ID': this.generateRequestId(),
      'X-SDK-Version': SDK_VERSION,
      'X-SDK-Client': SDK_CLIENT,
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
  private generateRequestId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
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
  protected async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body, params, timeout, headers: extraHeaders } = options;
    const url = this.buildUrl(path, params);
    const headers = { ...this.getHeaders(), ...extraHeaders };

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout ?? this.config.timeout
    );

    let lastError: Error | null = null;
    let attempts = 0;

    while (attempts < this.config.retries) {
      attempts++;

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : null,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({})) as ApiErrorResponse | Record<string, unknown>;

          // Extract error message from response
          const extractErrorMessage = (): string => {
            if ('error' in errorBody && errorBody.error && typeof errorBody.error === 'object') {
              const errorObj = errorBody.error as Record<string, unknown>;
              if ('message' in errorObj && typeof errorObj['message'] === 'string') {
                return errorObj['message'];
              }
            }
            return `Request failed with status ${response.status}`;
          };

          const errorMessage = extractErrorMessage();

          // Don't retry client errors (4xx) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new NonRetryableError(errorMessage);
          }

          // Retry on server errors (5xx) and rate limits (429)
          lastError = new Error(errorMessage);

          // Exponential backoff: 100ms, 200ms, 400ms, etc.
          if (attempts < this.config.retries) {
            await this.delay(100 * Math.pow(2, attempts - 1));
          }
          continue;
        }

        // Handle empty responses (204 No Content)
        if (response.status === 204) {
          return {} as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
          // Don't retry non-retryable errors (4xx client errors)
          if (error instanceof NonRetryableError) {
            throw new Error(error.message);
          }

          if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout ?? this.config.timeout}ms`);
          }

          lastError = error;

          // Exponential backoff for network errors
          if (attempts < this.config.retries) {
            await this.delay(100 * Math.pow(2, attempts - 1));
          }
        } else {
          throw error;
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  /**
   * Delay execution for the specified milliseconds.
   *
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
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
  protected get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>({ method: 'GET', path, ...(params && { params }) });
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
  protected post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
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
  protected put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  /**
   * Make a DELETE request.
   *
   * @param path - API endpoint path
   * @returns Parsed JSON response
   *
   * @internal
   */
  protected delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
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
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const response = await this.request<{ data: { user: AuthUser } }>({
        method: 'GET',
        path: '/api/v1/auth/me',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data?.user ?? null;
    } catch {
      return null;
    }
  }
}
