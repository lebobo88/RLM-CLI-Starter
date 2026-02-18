/**
 * AuthHub SDK Auth Types
 *
 * Type definitions for authentication and authorization in the SDK.
 *
 * @module @authhub/sdk/auth/types
 * @feature FTR-051
 */
/**
 * Authentication mode for the SDK.
 *
 * - `redirect`: Redirects user to AuthHub's auth portal (recommended for web apps)
 * - `embedded`: Uses direct API calls for authentication (for SPAs with backend)
 */
type AuthMode = 'redirect' | 'embedded';
/**
 * Token storage strategy.
 *
 * - `localStorage`: Persists across browser sessions (convenient but less secure)
 * - `sessionStorage`: Clears when browser tab closes (more secure)
 * - `memory`: Clears on page refresh (most secure, least convenient)
 * - `custom`: Use a custom TokenStorage implementation
 * - `cookie`: Delegates to server-set httpOnly cookies (most secure for XSS protection)
 */
type StorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'custom' | 'cookie';
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
interface AuthModuleConfig {
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
/**
 * Stored token data structure.
 */
interface StoredTokenData {
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
interface TokenStorage {
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
interface AuthUser {
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
interface AuthState {
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
/**
 * Result of a login operation.
 */
interface LoginResult {
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
interface RegisterResult {
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
interface RefreshResult {
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
interface PasswordResetResult {
    /** Whether request was accepted */
    success: boolean;
    /** Message to display to user */
    message?: string;
    /** Error details (if failed) */
    error?: AuthenticationError;
}
/**
 * Login credentials for embedded mode.
 */
interface LoginCredentials {
    /** User's email address */
    email: string;
    /** User's password */
    password: string;
}
/**
 * Registration data for embedded mode.
 */
interface RegisterData {
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
interface RedirectLoginOptions {
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
interface AuthModule {
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
    login(credentials?: LoginCredentials, options?: RedirectLoginOptions): Promise<LoginResult | void>;
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
/**
 * Error codes for authentication failures.
 */
type AuthErrorCode = 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' | 'ACCOUNT_LOCKED' | 'ACCOUNT_DISABLED' | 'SESSION_EXPIRED' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'TOKEN_REUSE_DETECTED' | 'MAX_SESSIONS_EXCEEDED' | 'PASSWORD_TOO_WEAK' | 'EMAIL_ALREADY_EXISTS' | 'INVALID_RESET_TOKEN' | 'RESET_TOKEN_EXPIRED' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR';
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
declare class AuthenticationError extends Error {
    /** Error code for programmatic handling */
    readonly code: AuthErrorCode;
    /** HTTP status code (if applicable) */
    readonly statusCode: number | undefined;
    /** Additional error details */
    readonly details: Record<string, unknown> | undefined;
    /** Whether this error is transient and worth retrying */
    readonly isRetryable: boolean;
    constructor(message: string, code: AuthErrorCode, statusCode?: number, details?: Record<string, unknown>);
    /**
     * Get a user-friendly error message.
     */
    get userMessage(): string;
    /**
     * Get troubleshooting suggestions.
     */
    get suggestion(): string;
}
/**
 * OAuth callback parameters.
 */
interface OAuthCallbackParams {
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
interface TokenExchangeRequest {
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
interface TokenResponse {
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

/**
 * Breadcrumb Types for Zero-Trust Debug Logging SDK
 * @task TASK-560
 * @feature FTR-123
 */
/**
 * Type of breadcrumb event
 */
type BreadcrumbType = 'click' | 'navigation' | 'xhr' | 'fetch' | 'console' | 'dom' | 'security' | 'custom';
/**
 * Severity level for breadcrumbs
 */
type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error';
/**
 * Represents a single breadcrumb event
 */
interface Breadcrumb {
    /** Type of breadcrumb event */
    type: BreadcrumbType;
    /** Category for grouping (e.g., 'ui', 'http', 'navigation') */
    category: string;
    /** Human-readable message */
    message: string;
    /** ISO 8601 timestamp */
    timestamp: string;
    /** Additional data (optional) */
    data?: Record<string, unknown>;
    /** Severity level (optional) */
    level?: BreadcrumbLevel;
}
/**
 * Configuration for the BreadcrumbTracker
 */
interface BreadcrumbConfig {
    /** Maximum number of breadcrumbs to keep (default: 50) */
    maxBreadcrumbs?: number;
    /** Which breadcrumb types to enable */
    enabledTypes?: BreadcrumbType[];
    /** Hook to modify or filter breadcrumbs before adding */
    beforeBreadcrumb?: (breadcrumb: Breadcrumb) => Breadcrumb | null;
}
/**
 * Available capture strategy names
 */
type CaptureStrategyName = 'semantic-dom' | 'synthetic-screenshot' | 'aom-tree' | 'ast-capture';
/**
 * Custom request function type for HTTP calls
 */
type RequestFn$3 = (url: string, init?: RequestInit) => Promise<Response>;
/**
 * Configuration for the debug module
 */
interface DebugModuleConfig {
    /** Application identifier */
    appId: string;
    /** API endpoint URL */
    apiUrl: string;
    /** Capture strategies to use */
    strategies?: CaptureStrategyName[];
    /** Maximum breadcrumbs to keep */
    maxBreadcrumbs?: number;
    /** Sample rate (0-1) for capturing errors */
    sampleRate?: number;
    /** Enable/disable the module */
    enabled?: boolean;
    /** Environment name (e.g., 'production', 'staging') */
    environment?: string;
    /** Release/version identifier */
    release?: string;
    /** Hook to modify or filter events before capture */
    beforeCapture?: (event: CaptureEvent) => CaptureEvent | null;
    /** Custom request function for HTTP calls */
    request?: RequestFn$3;
}
/**
 * Per-capture options
 */
interface CaptureOptions {
    /** Override strategies for this capture */
    strategies?: CaptureStrategyName[];
    /** Custom tags for this capture */
    tags?: Record<string, string>;
    /** Extra data to include */
    extra?: Record<string, unknown>;
    /** Severity level */
    level?: 'debug' | 'info' | 'warning' | 'error';
    /** Custom fingerprint for grouping */
    fingerprint?: string[];
}
/**
 * Result returned from a capture operation
 */
interface CaptureResult {
    /** Unique capture identifier */
    id: string;
    /** Hash of the error for grouping */
    errorHash: string;
    /** Whether this is a new unique error */
    isNewError: boolean;
    /** Total occurrences of this error */
    occurrenceCount: number;
}
/**
 * User context (anonymous ID only - no PII)
 */
interface UserContext {
    /** Anonymous user identifier */
    id: string;
}
/**
 * Internal event structure for processing captures
 */
interface CaptureEvent {
    /** Serialized error information */
    error: {
        name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
    /** Capture data from strategies */
    capture: {
        strategies: CaptureStrategyName[];
        timestamp: string;
        data: unknown;
    };
    /** Context information */
    context: {
        user?: UserContext;
        tags: Record<string, string>;
    };
    /** Breadcrumb trail */
    breadcrumbs: Breadcrumb[];
}

/**
 * AuthHub SDK Types
 *
 * Core type definitions for the AuthHub SDK.
 *
 * @module @authhub/sdk/types
 */

/**
 * Debug module configuration options for the AuthHub client.
 * Passed through to DebugModule when accessed via `client.debug`.
 */
interface DebugClientConfig {
    /** Enable/disable debug module (default: true) */
    enabled?: boolean;
    /** Sample rate for capturing errors (0-1, default: 1.0) */
    sampleRate?: number;
    /** Environment name (e.g., 'production', 'staging', 'development') */
    environment?: string;
    /** Release/version identifier for grouping errors */
    release?: string;
    /** Maximum breadcrumbs to keep (default: 50) */
    maxBreadcrumbs?: number;
    /** Capture strategies to use */
    strategies?: CaptureStrategyName[];
}
/**
 * Configuration options for the AuthHub client.
 */
interface AuthHubClientConfig {
    /** Base URL of the AuthHub API (e.g., 'https://authhub.example.com') */
    baseUrl: string;
    /** API key for authentication (starts with 'ak_') */
    apiKey: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Number of retry attempts for transient errors (default: 3) */
    retries?: number;
    /** Authentication module configuration */
    auth?: AuthModuleConfig;
    /** Debug module configuration for zero-trust debug logging */
    debug?: DebugClientConfig;
}
/**
 * Role of a message in a chat conversation.
 */
type ChatRole = 'system' | 'user' | 'assistant';
/**
 * A single message in a chat conversation.
 */
interface ChatMessage {
    /** Role of the message author */
    role: ChatRole;
    /** Content of the message */
    content: string;
}
/**
 * Options for a chat completion request.
 */
interface ChatCompletionOptions {
    /** Model ID to use (e.g., 'gpt-4', 'claude-3-opus') */
    model: string;
    /** Array of messages in the conversation */
    messages: ChatMessage[];
    /** Sampling temperature (0-2, default: 1) */
    temperature?: number;
    /** Maximum tokens to generate */
    max_tokens?: number;
    /** Whether to stream the response */
    stream?: boolean;
    /** Stop sequences */
    stop?: string | string[];
    /** Presence penalty (-2 to 2) */
    presence_penalty?: number;
    /** Frequency penalty (-2 to 2) */
    frequency_penalty?: number;
    /** Top-p sampling (0-1) */
    top_p?: number;
    /** Reasoning effort for o1/o3/o4 models */
    reasoning_effort?: 'low' | 'medium' | 'high';
    /** User identifier for abuse tracking */
    user?: string;
    /**
     * Request-specific timeout in milliseconds.
     *
     * Overrides the app's default timeout. Capped at the app's maxTimeoutMs.
     * If not provided, uses the app's defaultTimeoutMs.
     *
     * @minimum 5000
     * @maximum 300000
     * @example
     * ```typescript
     * // 60 second timeout for complex analysis
     * await client.ai.chat({
     *   model: 'gpt-4o',
     *   messages: [...],
     *   timeoutMs: 60000,
     * });
     * ```
     */
    timeoutMs?: number;
}
/**
 * A single choice in a chat completion response.
 */
interface ChatChoice {
    /** Index of this choice */
    index: number;
    /** The generated message */
    message: ChatMessage;
    /** Reason the generation stopped */
    finish_reason: string | null;
}
/**
 * Token usage statistics for a completion.
 */
interface ChatUsage {
    /** Tokens in the prompt */
    prompt_tokens: number;
    /** Tokens in the completion */
    completion_tokens: number;
    /** Total tokens used */
    total_tokens: number;
}
/**
 * AuthHub-specific metadata attached to AI responses.
 * Provides cost tracking, latency metrics, and request correlation.
 */
interface AuthHubMetadata {
    /** Unique request ID for correlation with server logs */
    request_id: string;
    /** Provider that handled the request (e.g., 'openai', 'anthropic') */
    provider: string;
    /** Estimated cost in USD for this request */
    cost_usd: number;
    /** Total latency in milliseconds */
    latency_ms: number;
}
/**
 * Response from a chat completion request.
 */
interface ChatCompletionResponse {
    /** Unique ID for this completion */
    id: string;
    /** Object type (always 'chat.completion') */
    object: 'chat.completion';
    /** Unix timestamp of creation */
    created: number;
    /** Model used for the completion */
    model: string;
    /** Array of completion choices */
    choices: ChatChoice[];
    /** Token usage statistics */
    usage: ChatUsage;
    /** AuthHub-specific metadata (cost, latency, provider) */
    authhub?: AuthHubMetadata;
}
/**
 * A chunk from a streaming chat completion.
 */
interface ChatStreamChunk {
    /** Content of this chunk */
    content: string;
    /** Reason generation stopped (only in final chunk) */
    finish_reason?: string | null;
}
/**
 * Result of a database query.
 */
interface QueryResult<T = Record<string, unknown>> {
    /** Array of rows returned */
    rows: T[];
    /** Number of rows returned */
    rowCount: number;
}
/**
 * Transaction context for atomic operations.
 */
interface TransactionContext {
    /**
     * Execute a query within the transaction.
     * @param sql - SQL query string with parameterized placeholders
     * @param params - Array of parameter values
     */
    query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}
/**
 * Standard error response from the API.
 */
interface ApiErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
/**
 * Information about an available AI model.
 *
 * Note: Same model ID may appear multiple times if configured on multiple providers.
 * Use provider_id/provider_slug to distinguish between instances.
 */
interface AIModel {
    /** Model identifier (e.g., 'gpt-4o', 'claude-3-opus-20240229') */
    id: string;
    /** Object type (always 'model') */
    object: string;
    /** Unix timestamp when model was created */
    created: number;
    /** Provider type (e.g., 'openai', 'anthropic', 'openrouter') */
    owned_by: string;
    /** AuthHub provider UUID */
    provider_id: string;
    /** Human-readable provider name configured in AuthHub */
    provider_name: string;
    /** Provider slug for API calls */
    provider_slug: string;
    /** Maximum context window in tokens (if known) */
    context_window?: number;
    /** Pricing per 1k tokens (if available) */
    pricing?: {
        /** Input tokens cost per 1k */
        input: number;
        /** Output tokens cost per 1k */
        output: number;
    };
    /** Model architecture with input/output modalities (OpenRouter-aligned) */
    architecture?: ModelArchitecture;
}
/**
 * Input modalities - what the model accepts (OpenRouter standard)
 */
type InputModality = 'text' | 'image' | 'audio' | 'video' | 'file';
/**
 * Output modalities - what the model produces (OpenRouter standard)
 */
type OutputModality = 'text' | 'image' | 'audio' | 'video' | 'embeddings';
/**
 * Model architecture information (OpenRouter-aligned)
 */
interface ModelArchitecture {
    /** What types of input the model accepts */
    input_modalities: InputModality[];
    /** What types of output the model produces */
    output_modalities: OutputModality[];
}
/**
 * Options for listing models.
 */
interface ListModelsOptions {
    /** Filter by output modality (what the model produces) */
    output_modality?: OutputModality;
    /** Filter by input modality (what the model accepts) */
    input_modality?: InputModality;
}
/**
 * Response from listing available AI models.
 */
interface ListModelsResponse {
    /** Object type (always 'list') */
    object: 'list';
    /** Array of available models */
    data: AIModel[];
}
/**
 * Usage statistics for AI operations.
 */
interface AIUsageStats {
    /** Aggregate totals */
    totals: {
        /** Total number of requests */
        requests: number;
        /** Total tokens used (input + output) */
        tokens: number;
        /** Total cost in USD */
        cost: number;
    };
    /** Usage breakdown by provider */
    byProvider: Record<string, {
        /** Requests for this provider */
        requests: number;
        /** Tokens used with this provider */
        tokens: number;
        /** Cost for this provider in USD */
        cost: number;
    }>;
    /** Usage over time */
    timeline: Array<{
        /** Date string (YYYY-MM-DD or week/month identifier) */
        date: string;
        /** Requests on this date */
        requests: number;
        /** Tokens used on this date */
        tokens: number;
        /** Cost on this date in USD */
        cost: number;
    }>;
}
/**
 * Options for querying AI usage statistics.
 */
interface GetUsageOptions {
    /** Start date for the query range */
    startDate?: Date;
    /** End date for the query range */
    endDate?: Date;
    /** How to group timeline data */
    groupBy?: 'day' | 'week' | 'month';
}
/**
 * Image size options for generation.
 */
type ImageSize = '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024' | '1K' | '2K' | '4K';
/**
 * Image aspect ratio options (primarily for Gemini).
 */
type ImageAspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';
/**
 * Image quality options.
 * - 'standard': Default quality
 * - 'hd': High definition
 * - '4k': 4K resolution
 * - 'low': Low quality (faster, OpenAI GPT-Image)
 * - 'medium': Medium quality (OpenAI GPT-Image)
 * - 'high': High quality (OpenAI GPT-Image)
 * - 'auto': Automatic quality selection
 */
type ImageQuality = 'standard' | 'hd' | '4k' | 'low' | 'medium' | 'high' | 'auto';
/**
 * Image style options (OpenAI DALL-E).
 */
type ImageStyle = 'vivid' | 'natural';
/**
 * Image response format options.
 */
type ImageResponseFormat = 'url' | 'b64_json';
/**
 * Image output format (file type).
 */
type ImageOutputFormat = 'png' | 'jpeg' | 'webp';
/**
 * Image background options (OpenAI GPT-Image).
 */
type ImageBackground = 'transparent' | 'opaque' | 'auto';
/**
 * Image moderation level (OpenAI GPT-Image).
 */
type ImageModeration = 'auto' | 'low';
/**
 * Image fidelity for input image matching (OpenAI GPT-Image).
 */
type ImageFidelity = 'low' | 'high';
/**
 * Person generation control (Google Imagen).
 */
type PersonGeneration = 'dont_allow' | 'allow_adult' | 'allow_all';
/**
 * Diffusion model schedulers (FLUX, Stable Diffusion).
 */
type DiffusionScheduler = 'DDIM' | 'DPMSolverMultistep' | 'HeunDiscrete' | 'KarrasDPM' | 'K_EULER_ANCESTRAL' | 'K_EULER' | 'PNDM';
/**
 * Style presets for Stable Diffusion.
 */
type ImageStylePreset = 'none' | 'enhance' | 'anime' | 'photographic' | 'digital-art' | 'comic-book' | 'fantasy-art' | 'analog-film' | 'neon-punk' | 'isometric' | 'low-poly' | 'origami' | 'line-art' | 'craft-clay' | 'cinematic' | '3d-model' | 'pixel-art';
/**
 * Options for image generation request.
 *
 * @example
 * ```typescript
 * const result = await client.ai.generateImage({
 *   prompt: 'A beautiful sunset over mountains',
 *   model: 'nano-banana-pro', // optional, this is default
 *   aspect_ratio: '16:9',
 *   n: 1,
 * });
 * ```
 */
interface ImageGenerationOptions {
    /** Text prompt describing the image to generate */
    prompt: string;
    /** Model to use (default: 'nano-banana-pro') */
    model?: string;
    /** Number of images to generate (1-10, provider dependent) */
    n?: number;
    /** Image size (e.g., '1024x1024', '4K') */
    size?: ImageSize;
    /** Aspect ratio for the image (e.g., '16:9', '1:1') */
    aspect_ratio?: ImageAspectRatio;
    /** Image quality level */
    quality?: ImageQuality;
    /** Image style (vivid, natural) - OpenAI DALL-E */
    style?: ImageStyle;
    /** Response format (url or b64_json) */
    response_format?: ImageResponseFormat;
    /** User identifier for abuse tracking */
    user?: string;
    /** Seed for reproducible generation (provider dependent) */
    seed?: number;
    /** Negative prompt - what to avoid in the image (FLUX, SD, Imagen) */
    negative_prompt?: string;
    /** Output file format (png, jpeg, webp) */
    output_format?: ImageOutputFormat;
    /** Background type - 'transparent' for PNG with alpha (GPT-Image only) */
    background?: ImageBackground;
    /** Compression level for JPEG/WebP output (0-100) */
    output_compression?: number;
    /** Content moderation level (GPT-Image only) */
    moderation?: ImageModeration;
    /** Fidelity for input image matching in editing (GPT-Image only) */
    fidelity?: ImageFidelity;
    /** Reference image(s) for editing - base64 or URL (up to 14 for Gemini, 16 for OpenAI) */
    image?: string | string[];
    /** PNG mask for inpainting - transparent areas indicate edit region */
    mask?: string;
    /** Classifier-free guidance scale (typically 1.5-20) */
    guidance_scale?: number;
    /** Number of inference steps (affects quality vs speed) */
    num_inference_steps?: number;
    /** Sampler/scheduler algorithm */
    scheduler?: DiffusionScheduler | string;
    /** Style preset for Stable Diffusion */
    style_preset?: ImageStylePreset | string;
    /** Language for prompt interpretation (Imagen) */
    language?: string;
    /** Enable automatic prompt enhancement via LLM (Imagen) */
    enhance_prompt?: boolean;
    /** Person generation control (Imagen) */
    person_generation?: PersonGeneration;
    /** Safety filter setting (Imagen) */
    safety_setting?: string;
    /** Add SynthID watermark (Imagen, default: true) */
    add_watermark?: boolean;
    /** Enable thinking mode - advanced reasoning with thought images (Nano Banana Pro only) */
    thinking?: boolean;
    /** Enable Google Search grounding for real-time data (Nano Banana Pro only) */
    search_grounding?: boolean;
    /** Reference images for style/character consistency (up to 14, Nano Banana Pro) */
    reference_images?: string[];
}
/**
 * Single image data in the response.
 */
interface ImageData {
    /** URL of the generated image (if response_format is 'url') */
    url?: string;
    /** Base64-encoded image data (if response_format is 'b64_json') */
    b64_json?: string;
    /** Revised prompt used for generation (if applicable) */
    revised_prompt?: string;
    /** MIME type of the image */
    mime_type?: string;
    /** Whether this is a thought/reasoning image (Nano Banana Pro thinking mode) */
    is_thought_image?: boolean;
    /** Seed used for this generation (for reproducibility) */
    seed?: number;
}
/**
 * Thought/reasoning step from thinking mode (Nano Banana Pro).
 */
interface ThoughtStep {
    /** The reasoning text for this step */
    text: string;
    /** Interim image showing the reasoning process */
    image?: ImageData;
}
/**
 * Response from image generation request.
 */
interface ImageGenerationResponse {
    /** Unix timestamp of creation */
    created: number;
    /** Array of generated images */
    data: ImageData[];
    /** Model used for generation */
    model?: string;
    /** Provider that generated the image */
    provider?: string;
    /** Text description returned alongside images (Gemini) */
    text?: string;
    /** Thought/reasoning steps from thinking mode (Nano Banana Pro) */
    thinking_steps?: ThoughtStep[];
    /** Search grounding sources used (Nano Banana Pro) */
    grounding_sources?: string[];
    /** AuthHub-specific metadata */
    authhub?: AuthHubMetadata;
}
/**
 * Encoding format for embeddings.
 */
type EmbeddingEncodingFormat = 'float' | 'base64';
/**
 * Options for creating embeddings.
 *
 * @example
 * ```typescript
 * // Single embedding
 * const result = await client.ai.createEmbedding({
 *   model: 'text-embedding-3-small',
 *   input: 'Hello world',
 * });
 *
 * // Batch embeddings
 * const result = await client.ai.createEmbedding({
 *   input: ['Hello', 'World', 'Test'],
 * });
 * ```
 */
interface EmbeddingOptions {
    /** Text or array of texts to embed */
    input: string | string[];
    /** Model to use (default: 'text-embedding-3-small') */
    model?: string;
    /** Encoding format for the embeddings */
    encoding_format?: EmbeddingEncodingFormat;
    /** Number of dimensions for the embedding (if model supports) */
    dimensions?: number;
    /** User identifier for abuse tracking */
    user?: string;
}
/**
 * Single embedding data in the response.
 */
interface EmbeddingData {
    /** Object type (always 'embedding') */
    object: 'embedding';
    /** Index of this embedding in the input array */
    index: number;
    /** The embedding vector */
    embedding: number[];
}
/**
 * Response from embedding creation request.
 */
interface EmbeddingResponse {
    /** Object type (always 'list') */
    object: 'list';
    /** Array of embeddings */
    data: EmbeddingData[];
    /** Model used for embedding */
    model: string;
    /** Token usage statistics */
    usage: {
        /** Tokens in the input */
        prompt_tokens: number;
        /** Total tokens used */
        total_tokens: number;
    };
}
/**
 * Response format options for transcription.
 */
type TranscriptionResponseFormat = 'json' | 'text' | 'srt' | 'vtt' | 'verbose_json';
/**
 * File input type for transcription - supports multiple input formats.
 */
type TranscriptionFileInput = Blob | File | Buffer | ArrayBuffer | ReadableStream;
/**
 * Options for audio transcription.
 *
 * @example
 * ```typescript
 * // Node.js usage
 * const result = await client.ai.transcribe({
 *   model: 'whisper-1',
 *   file: fs.createReadStream('audio.mp3'),
 *   response_format: 'verbose_json',
 * });
 *
 * // Browser usage
 * const result = await client.ai.transcribe({
 *   file: audioBlob,
 *   language: 'en',
 * });
 * ```
 */
interface TranscriptionOptions {
    /** Audio file to transcribe (Blob, File, Buffer, etc.) */
    file: TranscriptionFileInput;
    /** Model to use (default: 'whisper-1') */
    model?: string;
    /** Filename for the audio file (optional, helps with format detection) */
    filename?: string;
    /** ISO-639-1 language code (e.g., 'en', 'es', 'fr') */
    language?: string;
    /** Context or spelling hints for the transcription */
    prompt?: string;
    /** Response format (json, text, srt, vtt, verbose_json) */
    response_format?: TranscriptionResponseFormat;
    /** Sampling temperature (0-1) */
    temperature?: number;
}
/**
 * Word-level timing information (for verbose_json format).
 */
interface TranscriptionWord {
    /** The word text */
    word: string;
    /** Start time in seconds */
    start: number;
    /** End time in seconds */
    end: number;
}
/**
 * Segment information (for verbose_json format).
 */
interface TranscriptionSegment {
    /** Segment ID */
    id: number;
    /** Seek position */
    seek: number;
    /** Start time in seconds */
    start: number;
    /** End time in seconds */
    end: number;
    /** Transcribed text */
    text: string;
    /** Token IDs */
    tokens: number[];
    /** Temperature used */
    temperature: number;
    /** Average log probability */
    avg_logprob: number;
    /** Compression ratio */
    compression_ratio: number;
    /** No speech probability */
    no_speech_prob: number;
}
/**
 * Response from audio transcription.
 */
interface TranscriptionResponse {
    /** Transcribed text */
    text: string;
    /** Detected or specified language */
    language?: string;
    /** Duration of the audio in seconds */
    duration?: number;
    /** Word-level timing (if verbose_json) */
    words?: TranscriptionWord[];
    /** Segment information (if verbose_json) */
    segments?: TranscriptionSegment[];
}
/**
 * Available voices for TTS.
 */
type SpeechVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
/**
 * Audio format options for TTS output.
 */
type SpeechAudioFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
/**
 * Options for text-to-speech synthesis.
 *
 * @example
 * ```typescript
 * // Get audio buffer
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
 */
interface SpeechOptions {
    /** Text to synthesize (max 4096 characters) */
    input: string;
    /** Voice to use for synthesis */
    voice: SpeechVoice;
    /** Model to use (default: 'tts-1') */
    model?: string;
    /** Audio format for the response (default: 'mp3') */
    response_format?: SpeechAudioFormat;
    /** Speed of speech (0.25 to 4.0, default: 1.0) */
    speed?: number;
}

/**
 * AuthHub SDK Token Storage Implementations
 *
 * Provides storage strategies for persisting authentication tokens.
 *
 * @module @authhub/sdk/auth/storage
 * @feature FTR-051
 */

/**
 * Base class for browser storage implementations.
 * Provides common functionality for localStorage and sessionStorage.
 *
 * @internal
 */
declare abstract class BrowserTokenStorage implements TokenStorage {
    protected readonly keyPrefix: string;
    protected abstract readonly storage: Storage | null;
    constructor(keyPrefix?: string);
    /**
     * Get the full storage key for tokens.
     */
    protected get storageKey(): string;
    /**
     * Check if storage is available.
     */
    protected isStorageAvailable(): boolean;
    /**
     * Retrieve stored tokens.
     * Returns null if tokens don't exist, are expired, or storage is unavailable.
     */
    getTokens(): StoredTokenData | null;
    /**
     * Store token data.
     *
     * @param tokens - Token data to store
     * @throws {Error} If storage quota is exceeded
     */
    setTokens(tokens: StoredTokenData): void;
    /**
     * Clear all stored tokens.
     */
    clearTokens(): void;
    /**
     * Check if a timestamp is expired.
     *
     * @param expiresAt - Expiration timestamp in milliseconds
     * @returns True if expired
     */
    protected isExpired(expiresAt: number): boolean;
}
/**
 * Token storage using browser localStorage.
 *
 * Tokens persist across browser sessions until explicitly cleared
 * or until they expire.
 *
 * **Security Note:** localStorage is accessible to any JavaScript running
 * on the same origin. For high-security applications, consider using
 * sessionStorage or memory storage.
 *
 * @example
 * ```typescript
 * const storage = new LocalStorageTokenStorage('myapp_');
 *
 * // Store tokens
 * storage.setTokens({
 *   accessToken: 'eyJ...',
 *   refreshToken: 'dGhp...',
 *   expiresAt: Date.now() + 3600000,
 *   tokenType: 'Bearer',
 * });
 *
 * // Retrieve tokens
 * const tokens = storage.getTokens();
 * if (tokens) {
 *   console.log('Access token:', tokens.accessToken);
 * }
 *
 * // Clear tokens on logout
 * storage.clearTokens();
 * ```
 */
declare class LocalStorageTokenStorage extends BrowserTokenStorage {
    protected readonly storage: Storage | null;
    /**
     * Create a new localStorage token storage.
     *
     * @param keyPrefix - Prefix for storage keys (default: 'authhub_')
     */
    constructor(keyPrefix?: string);
}
/**
 * Token storage using browser sessionStorage.
 *
 * Tokens persist only within the current browser tab/window session.
 * When the tab is closed, tokens are automatically cleared.
 *
 * **Security Note:** sessionStorage provides better security than localStorage
 * as tokens don't persist across sessions. However, it's still accessible
 * to JavaScript on the same origin.
 *
 * @example
 * ```typescript
 * const storage = new SessionStorageTokenStorage();
 *
 * // Store tokens - cleared when tab closes
 * storage.setTokens({
 *   accessToken: 'eyJ...',
 *   expiresAt: Date.now() + 3600000,
 *   tokenType: 'Bearer',
 * });
 * ```
 */
declare class SessionStorageTokenStorage extends BrowserTokenStorage {
    protected readonly storage: Storage | null;
    /**
     * Create a new sessionStorage token storage.
     *
     * @param keyPrefix - Prefix for storage keys (default: 'authhub_')
     */
    constructor(keyPrefix?: string);
}
/**
 * Token storage in memory only.
 *
 * Tokens are stored in a JavaScript variable and cleared when the page
 * is refreshed or the tab is closed. This provides the highest security
 * but requires re-authentication on every page load.
 *
 * **Use Cases:**
 * - High-security applications where persistence is not acceptable
 * - Server-side rendering (SSR) environments
 * - Testing and development
 *
 * @example
 * ```typescript
 * const storage = new MemoryTokenStorage();
 *
 * // Store tokens - cleared on page refresh
 * storage.setTokens({
 *   accessToken: 'eyJ...',
 *   expiresAt: Date.now() + 3600000,
 *   tokenType: 'Bearer',
 * });
 *
 * // Later, check if still authenticated
 * const tokens = storage.getTokens();
 * if (!tokens) {
 *   // Re-authenticate user
 * }
 * ```
 */
declare class MemoryTokenStorage implements TokenStorage {
    private tokens;
    /**
     * Retrieve stored tokens.
     * Returns null if tokens don't exist or are expired.
     */
    getTokens(): StoredTokenData | null;
    /**
     * Store token data in memory.
     *
     * @param tokens - Token data to store
     */
    setTokens(tokens: StoredTokenData): void;
    /**
     * Clear stored tokens from memory.
     */
    clearTokens(): void;
}
/**
 * Storage type for the factory function.
 */
type StorageStrategyType = 'localStorage' | 'sessionStorage' | 'memory' | 'cookie';
/**
 * Create a token storage instance based on the specified type.
 *
 * @param type - Storage type to create
 * @param keyPrefix - Optional key prefix for browser storage
 * @returns TokenStorage instance
 *
 * @example
 * ```typescript
 * // Create localStorage storage
 * const storage = createTokenStorage('localStorage');
 *
 * // Create sessionStorage with custom prefix
 * const storage = createTokenStorage('sessionStorage', 'myapp_');
 *
 * // Create memory storage
 * const storage = createTokenStorage('memory');
 * ```
 */
declare function createTokenStorage(type: StorageStrategyType, keyPrefix?: string): TokenStorage;
/**
 * Check if the token data is expired or about to expire.
 *
 * @param tokens - Token data to check
 * @param thresholdSeconds - Consider expired if within this many seconds
 * @returns True if expired or expiring within threshold
 *
 * @example
 * ```typescript
 * const tokens = storage.getTokens();
 * if (tokens && isTokenExpired(tokens, 60)) {
 *   // Token expires within 60 seconds, refresh it
 *   await refreshToken();
 * }
 * ```
 */
declare function isTokenExpired(tokens: StoredTokenData, thresholdSeconds?: number): boolean;
/**
 * Calculate the time remaining until token expiration.
 *
 * @param tokens - Token data to check
 * @returns Milliseconds until expiration (negative if expired)
 *
 * @example
 * ```typescript
 * const tokens = storage.getTokens();
 * if (tokens) {
 *   const remaining = getTokenExpiresIn(tokens);
 *   console.log(`Token expires in ${Math.floor(remaining / 1000)} seconds`);
 * }
 * ```
 */
declare function getTokenExpiresIn(tokens: StoredTokenData): number;
/**
 * Create a StoredTokenData object from a token response.
 *
 * @param accessToken - Access token string
 * @param expiresIn - Token validity in seconds
 * @param refreshToken - Optional refresh token
 * @param tokenType - Token type (default: 'Bearer')
 * @returns StoredTokenData object ready for storage
 *
 * @example
 * ```typescript
 * // From API response
 * const response = await api.post('/auth/token', { ... });
 * const tokenData = createStoredTokenData(
 *   response.access_token,
 *   response.expires_in,
 *   response.refresh_token
 * );
 * storage.setTokens(tokenData);
 * ```
 */
declare function createStoredTokenData(accessToken: string, expiresIn: number, refreshToken?: string, tokenType?: string): StoredTokenData;

/**
 * AuthHub SDK Redirect Mode Authentication
 *
 * Implements OAuth 2.0 authorization code flow with PKCE for secure
 * redirect-based authentication.
 *
 * @module @authhub/sdk/auth/redirect
 * @feature FTR-051
 */

/**
 * Configuration for redirect mode authentication.
 */
interface RedirectModeConfig {
    /** AuthHub API base URL */
    baseUrl: string;
    /** Application slug or ID */
    appSlug: string;
    /** Default callback URL after authentication */
    callbackUrl: string;
    /** Token storage implementation */
    storage: TokenStorage;
    /** Optional key prefix for storage */
    keyPrefix?: string;
    /**
     * Storage mode to signal to the backend during OAuth callback.
     * When 'cookie', backend will set httpOnly cookies instead of returning tokens.
     * @default 'bearer'
     * @task TASK-500
     * @feature FTR-109
     */
    storageMode?: 'bearer' | 'cookie';
}
/**
 * Options for redirect operations.
 */
interface RedirectOptions {
    /** Override the default callback URL */
    redirectUri?: string;
    /** Custom state parameter (auto-generated if not provided) */
    state?: string;
    /** URL to return to after successful auth (stored for callback) */
    returnTo?: string;
    /** Additional query parameters to include */
    additionalParams?: Record<string, string>;
}
/**
 * Options specific to registration.
 */
interface RegisterRedirectOptions extends RedirectOptions {
    /** Pre-fill email in registration form */
    email?: string;
    /** Pre-fill name in registration form */
    name?: string;
}
/**
 * Options for logout.
 */
interface LogoutOptions {
    /** Whether to redirect to AuthHub logout endpoint */
    redirectToAuthHub?: boolean;
    /** URL to redirect to after logout (if redirectToAuthHub is true) */
    returnTo?: string;
    /** Whether to perform a global logout (all sessions) */
    globalLogout?: boolean;
}
/**
 * Handles redirect-based authentication flows.
 *
 * @example
 * ```typescript
 * const redirectMode = new RedirectMode({
 *   baseUrl: 'https://authhub.example.com',
 *   appSlug: 'my-app',
 *   callbackUrl: 'https://myapp.com/auth/callback',
 *   storage: new LocalStorageTokenStorage(),
 * });
 *
 * // Redirect to login
 * await redirectMode.login();
 *
 * // Redirect to register
 * await redirectMode.register({ email: 'user@example.com' });
 *
 * // Logout
 * await redirectMode.logout();
 * ```
 */
declare class RedirectMode {
    private readonly config;
    constructor(config: RedirectModeConfig);
    /**
     * Build the authorization URL for OAuth flow.
     *
     * @param endpoint - Auth portal endpoint ('login' | 'register')
     * @param options - Redirect options
     * @returns Authorization URL and generated state
     */
    private buildAuthUrl;
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
    login(options?: RedirectLoginOptions & RedirectOptions): Promise<void>;
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
    register(options?: RegisterRedirectOptions): Promise<void>;
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
    logout(options?: LogoutOptions): Promise<void>;
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
    getLoginUrl(options?: RedirectOptions): Promise<{
        url: string;
        state: string;
        codeVerifier: string;
    }>;
    /**
     * Get the register URL without redirecting.
     *
     * @param options - Registration options
     * @returns Promise with URL, state, and code verifier
     */
    getRegisterUrl(options?: RegisterRedirectOptions): Promise<{
        url: string;
        state: string;
        codeVerifier: string;
    }>;
    /**
     * Get the logout URL.
     *
     * @param options - Logout options
     * @returns Logout URL
     */
    getLogoutUrl(options?: LogoutOptions): string;
    /**
     * Redirect the browser to a URL.
     *
     * @param url - URL to redirect to
     */
    private redirect;
}

/**
 * AuthHub SDK OAuth Callback Handler
 *
 * Handles the OAuth callback after redirect-based authentication.
 * Exchanges authorization code for tokens.
 *
 * @module @authhub/sdk/auth/callback
 * @feature FTR-051
 */

/**
 * Configuration for callback handling.
 */
interface CallbackConfig {
    /** AuthHub API base URL */
    baseUrl: string;
    /** Application slug or ID */
    appSlug: string;
    /** Token storage implementation */
    storage: TokenStorage;
    /** Callback URL registered with the app */
    callbackUrl: string;
    /**
     * API key for protected operations.
     * Optional for redirect-mode authentication (auth endpoints don't require it).
     * @task TASK-501
     * @feature FTR-110
     */
    apiKey?: string;
}
/**
 * Result of callback handling.
 */
interface CallbackResult extends LoginResult {
    /** URL to redirect to after successful auth (from storePKCEData) */
    redirectTo?: string;
}
/**
 * Handles OAuth callbacks from redirect-based authentication.
 *
 * @example
 * ```typescript
 * const handler = new CallbackHandler({
 *   baseUrl: 'https://authhub.example.com',
 *   appSlug: 'my-app',
 *   callbackUrl: 'https://myapp.com/auth/callback',
 *   storage: new LocalStorageTokenStorage(),
 *   apiKey: 'ak_xxxxx',
 * });
 *
 * // On callback page
 * const result = await handler.handleCallback();
 * if (result.success) {
 *   console.log('Logged in as', result.user?.email);
 *   // Redirect to app
 *   window.location.href = result.redirectTo || '/dashboard';
 * }
 * ```
 */
declare class CallbackHandler {
    private readonly config;
    constructor(config: CallbackConfig);
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
    handleCallback(url?: string): Promise<CallbackResult>;
    /**
     * Parse the callback URL for OAuth parameters.
     *
     * @param url - URL to parse (defaults to window.location.href)
     * @returns Parsed OAuth callback parameters
     */
    private parseCallbackUrl;
    /**
     * Exchange authorization code for tokens.
     *
     * @param code - Authorization code
     * @param codeVerifier - PKCE code verifier
     * @returns Token response
     */
    private exchangeCodeForTokens;
    /**
     * Get user information from the access token.
     *
     * @param accessToken - Access token
     * @returns User information
     */
    private getUserFromToken;
    /**
     * Map error code string to AuthErrorCode.
     */
    private mapErrorCode;
    /**
     * Create an error result.
     */
    private createErrorResult;
    /**
     * Clean up the URL by removing OAuth parameters.
     */
    private cleanupUrl;
}

/**
 * AuthHub SDK Embedded Mode API
 *
 * Direct API calls for apps with custom authentication UI.
 * Use this when you want full control over the auth experience.
 *
 * @module @authhub/sdk/auth/embedded
 * @feature FTR-051
 */

/**
 * Configuration for embedded mode API.
 */
interface EmbeddedModeConfig {
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
declare class EmbeddedMode {
    private readonly config;
    constructor(config: EmbeddedModeConfig);
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
    login(credentials: LoginCredentials): Promise<LoginResult>;
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
    register(data: RegisterData): Promise<RegisterResult>;
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
    resendVerification(email: string): Promise<PasswordResetResult>;
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
    forgotPassword(email: string): Promise<PasswordResetResult>;
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
    resetPassword(token: string, newPassword: string): Promise<PasswordResetResult>;
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
    me(): Promise<AuthUser | null>;
    /**
     * Log out the current user.
     * Clears tokens and optionally revokes session on server.
     *
     * @param revokeSession - Whether to revoke server session (default: true)
     */
    logout(revokeSession?: boolean): Promise<void>;
    /**
     * Make an authenticated API request.
     * X-API-Key is optional for auth endpoints (TASK-501).
     */
    private request;
    /**
     * Map API error response to AuthenticationError.
     */
    private mapApiError;
    /**
     * Map error code string to AuthErrorCode.
     */
    private mapErrorCode;
    /**
     * Map user response to AuthUser.
     */
    private mapUser;
}

/**
 * AuthHub SDK Token Manager
 *
 * Manages token lifecycle including automatic refresh before expiration.
 * Integrates with FTR-065's token rotation feature.
 *
 * @module @authhub/sdk/auth/token-manager
 * @feature FTR-051
 */

/**
 * Configuration for the token manager.
 */
interface TokenManagerConfig {
    /** AuthHub API base URL */
    baseUrl: string;
    /**
     * API key for protected operations.
     * Optional for redirect-mode authentication (refresh endpoint uses JWT only).
     * @task TASK-501
     * @feature FTR-110
     */
    apiKey?: string;
    /** Token storage implementation */
    storage: TokenStorage;
    /** Seconds before expiry to trigger refresh (default: 60) */
    refreshThreshold?: number;
    /** Callback when tokens are refreshed */
    onTokenRefresh?: (tokens: StoredTokenData) => void;
    /** Callback when session expires */
    onSessionExpired?: (error: AuthenticationError) => void;
    /** Callback when token reuse is detected (security breach) */
    onTokenReuseDetected?: () => void;
}
/**
 * Manages token lifecycle with automatic refresh.
 *
 * @example
 * ```typescript
 * const manager = new TokenManager({
 *   baseUrl: 'https://authhub.example.com',
 *   apiKey: 'ak_xxxxx',
 *   storage: new LocalStorageTokenStorage(),
 *   refreshThreshold: 60, // Refresh 60 seconds before expiry
 *   onSessionExpired: () => {
 *     // Redirect to login
 *     window.location.href = '/login';
 *   },
 * });
 *
 * // Start auto-refresh when user logs in
 * manager.startAutoRefresh();
 *
 * // Get a valid token for API calls
 * const token = await manager.getValidToken();
 *
 * // Stop refresh on logout
 * manager.stopAutoRefresh();
 * ```
 */
declare class TokenManager {
    private readonly config;
    private readonly refreshThreshold;
    private refreshTimer;
    private isRefreshing;
    private refreshPromise;
    constructor(config: TokenManagerConfig);
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
    getValidToken(): Promise<string | null>;
    /**
     * Refresh the current access token.
     *
     * Handles FTR-065's token rotation - stores the new refresh token
     * and detects token reuse attacks.
     *
     * @returns Refresh result
     */
    refreshToken(): Promise<RefreshResult>;
    /**
     * Internal refresh implementation with retry logic.
     */
    private doRefresh;
    /**
     * Call the token refresh endpoint.
     * X-API-Key is optional for auth endpoints (TASK-501).
     */
    private callRefreshEndpoint;
    /**
     * Start automatic token refresh.
     *
     * Call this after successful login or on app initialization.
     */
    startAutoRefresh(): Promise<void>;
    /**
     * Stop automatic token refresh.
     *
     * Call this on logout or when the user leaves.
     */
    stopAutoRefresh(): void;
    /**
     * Schedule the next token refresh.
     */
    private scheduleRefresh;
    /**
     * Handle session expiration.
     */
    private handleSessionExpired;
    /**
     * Map error code string to AuthErrorCode.
     */
    private mapErrorCode;
    /**
     * Delay helper.
     */
    private delay;
}

/**
 * AuthHub SDK Auth State Management
 *
 * Reactive state tracking with pub/sub for UI updates.
 *
 * @module @authhub/sdk/auth/state
 * @feature FTR-051
 */

/**
 * Auth events that can be subscribed to.
 */
type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'SESSION_EXPIRED' | 'LOADING';
/**
 * Event payload types.
 */
interface AuthEventPayload {
    SIGNED_IN: {
        user: AuthUser;
        accessToken: string;
    };
    SIGNED_OUT: {
        reason?: string;
    };
    TOKEN_REFRESHED: {
        accessToken: string;
        expiresAt: Date;
    };
    USER_UPDATED: {
        user: AuthUser;
    };
    SESSION_EXPIRED: {
        error: AuthenticationError;
    };
    LOADING: {
        isLoading: boolean;
    };
}
/**
 * Callback type for auth state changes.
 */
type AuthStateCallback = (state: AuthState) => void;
/**
 * Callback type for specific auth events.
 */
type AuthEventCallback<E extends AuthEvent> = (payload: AuthEventPayload[E]) => void;
/**
 * Unsubscribe function returned from subscribe methods.
 */
type Unsubscribe = () => void;
/**
 * Configuration for auth state manager.
 */
interface AuthStateManagerConfig {
    /** Token storage to read auth state from */
    storage: TokenStorage;
    /** Optional user fetcher function */
    fetchUser?: (accessToken: string) => Promise<AuthUser>;
}
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
declare class AuthStateManager {
    private readonly config;
    private currentState;
    private currentUser;
    private stateListeners;
    private eventListeners;
    constructor(config: AuthStateManagerConfig);
    /**
     * Initialize state from storage.
     * Call this on app startup.
     */
    initialize(): Promise<void>;
    /**
     * Get the current authentication state.
     */
    getState(): AuthState;
    /**
     * Get the current user if authenticated.
     */
    getUser(): AuthUser | null;
    /**
     * Check if user is authenticated.
     */
    isAuthenticated(): boolean;
    /**
     * Check if auth state is still loading.
     */
    isLoading(): boolean;
    /**
     * Subscribe to all auth state changes.
     *
     * @param callback - Function called when state changes
     * @returns Unsubscribe function
     */
    onStateChange(callback: AuthStateCallback): Unsubscribe;
    /**
     * Subscribe to specific auth events.
     *
     * @param event - Event type to listen for
     * @param callback - Function called when event fires
     * @returns Unsubscribe function
     */
    on<E extends AuthEvent>(event: E, callback: AuthEventCallback<E>): Unsubscribe;
    /**
     * Update state after successful login.
     */
    setSignedIn(user: AuthUser, tokens: StoredTokenData): void;
    /**
     * Update state after logout.
     */
    setSignedOut(reason?: string): void;
    /**
     * Update state after token refresh.
     */
    setTokenRefreshed(tokens: StoredTokenData): void;
    /**
     * Update user information.
     */
    setUser(user: AuthUser): void;
    /**
     * Handle session expiration.
     */
    setSessionExpired(error: AuthenticationError): void;
    /**
     * Update internal state and notify listeners.
     */
    private updateState;
    /**
     * Emit an event to listeners.
     */
    private emitEvent;
    /**
     * Clear all listeners.
     */
    clearListeners(): void;
}

/**
 * AuthHub SDK Auth Client
 *
 * Main auth module facade that integrates all auth components.
 *
 * @module @authhub/sdk/auth/client
 * @feature FTR-051
 */

/**
 * Configuration for creating an AuthClient.
 */
interface AuthClientConfig {
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
declare class AuthClient {
    private readonly config;
    private readonly storage;
    readonly stateManager: AuthStateManager;
    readonly tokenManager: TokenManager;
    readonly redirectMode: RedirectMode | null;
    readonly embeddedMode: EmbeddedMode | null;
    readonly callbackHandler: CallbackHandler | null;
    readonly mode: 'redirect' | 'embedded';
    constructor(config: AuthClientConfig);
    /**
     * Initialize auth state from storage.
     * Call this on app startup.
     */
    initialize(): Promise<void>;
    /**
     * Get current auth state.
     */
    getState(): AuthState;
    /**
     * Get current user.
     */
    getUser(): AuthUser | null;
    /**
     * Check if authenticated.
     */
    isAuthenticated(): boolean;
    /**
     * Subscribe to auth state changes.
     */
    onStateChange(callback: (state: AuthState) => void): () => void;
    /**
     * Log in.
     * In redirect mode: redirects to AuthHub portal
     * In embedded mode: authenticates with credentials
     */
    login(credentials?: LoginCredentials, options?: RedirectLoginOptions): Promise<LoginResult | void>;
    /**
     * Register a new user.
     */
    register(data: RegisterData): Promise<RegisterResult>;
    /**
     * Log out.
     */
    logout(): Promise<void>;
    /**
     * Handle OAuth callback (redirect mode only).
     */
    handleCallback(url?: string): Promise<LoginResult>;
    /**
     * Check if current URL is a callback.
     */
    isCallback(): boolean;
    /**
     * Refresh the current token.
     */
    refreshToken(): Promise<RefreshResult>;
    /**
     * Get a valid access token.
     *
     * In cookie mode, returns null since tokens are stored in httpOnly cookies
     * and cannot be accessed by JavaScript. Use `credentials: 'include'` in
     * fetch requests to have the browser automatically include cookies.
     *
     * @returns Access token or null (null in cookie mode by design)
     */
    getAccessToken(): Promise<string | null>;
    /**
     * Check if the SDK is configured to use cookie mode.
     * When true, API requests should use `credentials: 'include'`.
     *
     * @returns True if using cookie storage mode
     */
    isCookieMode(): boolean;
    /**
     * Request password reset (embedded mode).
     */
    requestPasswordReset(email: string): Promise<PasswordResetResult>;
    /**
     * Reset password with token (embedded mode).
     */
    resetPassword(token: string, newPassword: string): Promise<PasswordResetResult>;
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
    static forAuth(config: Omit<AuthClientConfig, 'apiKey'>): AuthClient;
}
/**
 * Create an auth client with configuration.
 */
declare function createAuthClient(config: AuthClientConfig): AuthClient;

/**
 * AuthHub SDK OAuth Methods
 *
 * OAuth URL generation and callback parsing for third-party authentication.
 *
 * @module @authhub/sdk/auth/oauth
 * @task TASK-461
 * @feature OAuth SDK Methods and Dashboard Integration
 */
/**
 * Supported OAuth providers.
 */
declare enum OAuthProvider {
    Google = "google",
    GitHub = "github"
}
/**
 * Options for generating OAuth URLs.
 */
interface OAuthUrlOptions {
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
interface OAuthCallbackResult {
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
declare function getGoogleAuthUrl(baseUrl: string, appId: string, redirectUri: string, options?: OAuthUrlOptions): string;
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
declare function getGitHubAuthUrl(baseUrl: string, appId: string, redirectUri: string, options?: OAuthUrlOptions): string;
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
declare function getOAuthUrl(baseUrl: string, provider: OAuthProvider, appId: string, redirectUri: string, options?: OAuthUrlOptions): string;
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
declare function parseOAuthCallbackResult(url: string): OAuthCallbackResult | null;
/**
 * Check if a URL contains OAuth callback parameters.
 *
 * @param url - URL to check
 * @returns True if URL contains OAuth callback parameters
 */
declare function hasOAuthCallback(url: string): boolean;
/**
 * Check if a URL contains an OAuth error.
 *
 * @param url - URL to check
 * @returns True if URL contains OAuth error
 */
declare function hasOAuthError(url: string): boolean;
/**
 * Extract OAuth error details from URL.
 *
 * @param url - URL to parse
 * @returns Error details or null if no error
 */
declare function getOAuthError(url: string): {
    error: string;
    description?: string;
} | null;

/**
 * AuthHub AI Module
 *
 * Provides AI chat completion, image generation, embeddings,
 * audio transcription, and text-to-speech capabilities through the AuthHub proxy.
 *
 * @module @authhub/sdk/ai
 * @task TASK-521, TASK-526, TASK-531, TASK-536
 * @feature FTR-112, FTR-113, FTR-114, FTR-115
 */

/**
 * Request function type for making authenticated API calls.
 */
type RequestFn$2 = <T>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined>;
}) => Promise<T>;
/**
 * Configuration for the AI module.
 */
interface AIModuleConfig {
    request: RequestFn$2;
    baseUrl: string;
    apiKey: string;
    timeout: number;
}
/**
 * AI module for chat completions, image generation, embeddings,
 * audio transcription, and text-to-speech.
 *
 * @example
 * ```typescript
 * // Chat completion
 * const response = await client.ai.chat({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * console.log(response.choices[0].message.content);
 *
 * // Image generation
 * const images = await client.ai.generateImage({
 *   prompt: 'A beautiful sunset',
 *   model: 'nano-banana-pro',
 * });
 *
 * // Embeddings
 * const embeddings = await client.ai.createEmbedding({
 *   input: 'Hello world',
 * });
 *
 * // Transcription
 * const transcript = await client.ai.transcribe({
 *   file: audioBlob,
 * });
 *
 * // Text-to-speech
 * const audio = await client.ai.speak({
 *   input: 'Hello!',
 *   voice: 'nova',
 * });
 * ```
 */
declare class AIModule {
    private readonly config;
    /**
     * Creates a new AI module instance.
     * @internal
     */
    constructor(config: AIModuleConfig);
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
    chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
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
    chatStream(options: ChatCompletionOptions): AsyncGenerator<ChatStreamChunk, void, undefined>;
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
    listModels(options?: ListModelsOptions): Promise<ListModelsResponse>;
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
    getUsage(options?: GetUsageOptions): Promise<AIUsageStats>;
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
    generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse>;
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
    createEmbedding(options: EmbeddingOptions): Promise<EmbeddingResponse>;
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
    transcribe(options: TranscriptionOptions): Promise<TranscriptionResponse>;
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
    speak(options: SpeechOptions): Promise<ArrayBuffer>;
    /**
     * Validate chat completion options.
     * @internal
     */
    private validateChatOptions;
    /**
     * Validate image generation options.
     * @internal
     */
    private validateImageOptions;
    /**
     * Validate embedding options.
     * @internal
     */
    private validateEmbeddingOptions;
    /**
     * Validate transcription options.
     * @internal
     */
    private validateTranscriptionOptions;
    /**
     * Validate speech options.
     * @internal
     */
    private validateSpeechOptions;
    /**
     * Extract error message from response body.
     * @internal
     */
    private extractErrorMessage;
}

/**
 * AuthHub Database Module
 *
 * Provides database query and transaction capabilities through AuthHub's
 * multi-tenant database routing.
 *
 * @module @authhub/sdk/db
 */

/**
 * Request function type for making authenticated API calls.
 */
type RequestFn$1 = <T>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    body?: unknown;
}) => Promise<T>;
/**
 * Configuration for the database module.
 */
interface DBModuleConfig {
    request: RequestFn$1;
}
/**
 * Database module for queries and transactions.
 *
 * @example
 * ```typescript
 * // Simple query
 * const users = await client.db.query<User>(
 *   'SELECT * FROM users WHERE active = $1',
 *   [true]
 * );
 *
 * // Transaction
 * const result = await client.db.transaction(async (tx) => {
 *   await tx.query('INSERT INTO orders (user_id, total) VALUES ($1, $2)', [userId, 100]);
 *   await tx.query('UPDATE users SET order_count = order_count + 1 WHERE id = $1', [userId]);
 *   return { success: true };
 * });
 * ```
 */
declare class DBModule {
    private readonly config;
    /**
     * Creates a new database module instance.
     * @internal
     */
    constructor(config: DBModuleConfig);
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
    query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
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
    transaction<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

/**
 * AuthHub Secrets Module
 *
 * Provides secure access to secrets assigned to your application.
 *
 * @module @authhub/sdk/secrets
 */
/**
 * Request function type for making authenticated API calls.
 */
type RequestFn = <T>(options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    body?: unknown;
}) => Promise<T>;
/**
 * Configuration for the secrets module.
 */
interface SecretsModuleConfig {
    request: RequestFn;
}
/**
 * Secrets module for accessing application secrets.
 *
 * @example
 * ```typescript
 * // Get a single secret
 * const apiKey = await client.secrets.get('STRIPE_API_KEY');
 *
 * // List available secrets
 * const names = await client.secrets.list();
 * console.log(`Available secrets: ${names.join(', ')}`);
 * ```
 */
declare class SecretsModule {
    private readonly config;
    /**
     * Creates a new secrets module instance.
     * @internal
     */
    constructor(config: SecretsModuleConfig);
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
    get(name: string): Promise<string>;
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
    list(): Promise<string[]>;
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
    exists(name: string): Promise<boolean>;
}

/**
 * BreadcrumbTracker - Core breadcrumb tracking for Zero-Trust Debug Logging
 * @task TASK-561
 * @feature FTR-123
 */

/**
 * BreadcrumbTracker maintains a list of user interactions
 * for debugging context when errors occur.
 */
declare class BreadcrumbTracker {
    private breadcrumbs;
    private config;
    private initialized;
    private cspViolationHandler;
    constructor(config?: BreadcrumbConfig);
    /**
     * Add a breadcrumb to the list
     * @param breadcrumb - Breadcrumb to add (timestamp optional)
     */
    add(breadcrumb: Omit<Breadcrumb, 'timestamp'> & {
        timestamp?: string;
    }): void;
    /**
     * Get a copy of all breadcrumbs
     * @returns Copy of breadcrumbs array
     */
    getBreadcrumbs(): Breadcrumb[];
    /**
     * Clear all breadcrumbs
     */
    clear(): void;
    /**
     * Get current configuration
     */
    getConfig(): Required<BreadcrumbConfig>;
    /**
     * Check if tracker is initialized
     */
    isInitialized(): boolean;
    /**
     * Initialize click, navigation, and HTTP tracking with event listeners
     * Safe to call multiple times - will only initialize once
     * @task TASK-563
     */
    init(): void;
    /**
     * Clean up event listeners
     */
    destroy(): void;
    /**
     * Handle click events and create breadcrumbs
     */
    private handleClick;
    /**
     * Get safe element descriptor without PII
     * Only captures structural/identifying attributes
     */
    private getElementDescriptor;
    /**
     * Handle CSP violation events and create breadcrumbs
     */
    private handleCSPViolation;
    /**
     * Handle popstate navigation events
     * @task TASK-563
     */
    private handleNavigation;
    /**
     * Sanitize URL to remove query params and hash for privacy
     * Only returns pathname to avoid capturing PII in URLs
     * @task TASK-563
     */
    private sanitizeUrl;
    /**
     * Wrap history pushState/replaceState to track SPA navigation
     * @task TASK-563
     */
    private wrapHistoryMethod;
    /**
     * Wrap fetch API to track HTTP requests
     * Only captures method, path, and status - never request bodies
     * @task TASK-563
     */
    private wrapFetch;
    /**
     * Wrap XMLHttpRequest to track XHR requests
     * Only captures method, path, and status - never request bodies
     * @task TASK-563
     */
    private wrapXHR;
    /**
     * Wrap console methods to track debug/info/warn/error
     * @task TASK-564
     */
    private wrapConsole;
    /**
     * Add a console breadcrumb from logged message
     * @task TASK-564
     */
    private addConsoleBreadcrumb;
    /**
     * Format console arguments into a safe message string
     * Truncates at 500 chars, sanitizes PII, and replaces objects
     * @task TASK-564
     */
    private formatConsoleMessage;
    /**
     * Sanitize console string to redact PII patterns
     * @task TASK-564
     */
    private sanitizeConsoleString;
}

/**
 * Capture Strategy Types for Zero-Trust Debug Logging
 * @task TASK-566
 * @feature FTR-119
 */
/**
 * Context provided to capture strategies
 */
interface CaptureContext {
    /** Error that triggered the capture */
    error?: Error;
    /** Element associated with the error */
    element?: HTMLElement;
}
/**
 * Base interface for all capture strategies
 */
interface CaptureStrategy<T = unknown> {
    /** Unique name for this strategy */
    readonly name: string;
    /** Maximum size in bytes for capture output */
    readonly maxSize: number;
    /** Execute the capture */
    capture(context?: CaptureContext): Promise<T>;
}
/**
 * DOM element node for semantic capture
 */
interface ElementNode {
    tag: string;
    id?: string;
    classList?: string[];
    attributes?: Record<string, string>;
    role?: string;
    label?: string;
    children?: ElementNode[];
}
/**
 * Result of semantic DOM capture
 */
interface SemanticDOMCapture {
    rootElement: ElementNode;
    activeElement?: string;
    scrollPosition: {
        x: number;
        y: number;
    };
    viewportSize: {
        width: number;
        height: number;
    };
    capturedAt: string;
}
/**
 * Result of synthetic screenshot capture
 */
interface SyntheticScreenshotCapture {
    imageData: string;
    dimensions: {
        width: number;
        height: number;
    };
    errorLocation?: {
        x: number;
        y: number;
        selector: string;
    };
    maskedElements: string[];
    capturedAt: string;
}
/**
 * Accessibility state for AOM nodes
 */
interface AccessibilityState {
    checked?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    hidden?: boolean;
    invalid?: boolean;
    pressed?: boolean;
    selected?: boolean;
}
/**
 * Accessibility tree node
 */
interface AccessibilityNode {
    role: string;
    name?: string;
    description?: string;
    state?: AccessibilityState;
    children?: AccessibilityNode[];
}
/**
 * Landmark information for accessibility
 */
interface LandmarkInfo {
    role: string;
    label?: string;
    selector: string;
}
/**
 * Result of AOM tree capture
 */
interface AOMTreeCapture {
    rootNode: AccessibilityNode;
    focusedElement?: string;
    focusOrder: string[];
    landmarks: LandmarkInfo[];
    capturedAt: string;
}
/**
 * AST node representation
 */
interface ASTNode {
    type: string;
    name?: string;
    location?: {
        line: number;
        column: number;
    };
    value?: string;
    children?: ASTNode[];
}
/**
 * Call stack frame information
 */
interface CallStackFrame {
    functionName: string;
    fileName: string;
    lineNumber: number;
    columnNumber: number;
}
/**
 * Result of AST capture
 */
interface ASTCapture {
    errorLocation: {
        file: string;
        line: number;
        column: number;
        functionName?: string;
    };
    contextNodes: ASTNode[];
    callStack: CallStackFrame[];
    capturedAt: string;
}

/**
 * DebugModule - Zero-Trust Debug Logging SDK
 * @task TASK-583
 * @feature FTR-124
 */

declare class DebugModule {
    private config;
    private breadcrumbTracker;
    private strategies;
    private userContext;
    private tags;
    private sessionId;
    private initialized;
    private originalOnError;
    private unhandledRejectionHandler;
    private cspViolationHandler;
    constructor(config: DebugModuleConfig);
    /**
     * Generate or retrieve a persistent session ID.
     * Uses sessionStorage in browser environments for persistence
     * across page navigations within the same session.
     * Falls back to random generation in non-browser environments.
     */
    private getOrCreateSessionId;
    /**
     * Resolve a public CaptureStrategyName to an internal strategy key.
     * Returns the underscore-format key used in the strategies Map.
     */
    resolveStrategyName(name: CaptureStrategyName): string;
    /**
     * Get a capture strategy by its internal underscore-format name.
     */
    getStrategy(name: string): CaptureStrategy | undefined;
    /**
     * Get the current session ID.
     */
    getSessionId(): string;
    /**
     * Check if the module has been initialized.
     */
    isInitialized(): boolean;
    /**
     * Check if the module is enabled.
     */
    isEnabled(): boolean;
    /**
     * Get the current configuration (read-only copy).
     */
    getConfig(): DebugModuleConfig;
    /**
     * Get the breadcrumb tracker instance.
     */
    getBreadcrumbTracker(): BreadcrumbTracker;
    /**
     * Set user context for associating captures with an anonymous user.
     */
    setUserContext(user: UserContext | null): void;
    /**
     * Get the current user context.
     */
    getUserContext(): UserContext | null;
    /**
     * Set a tag key-value pair for all future captures.
     */
    setTag(key: string, value: string): void;
    /**
     * Get all currently set tags.
     */
    getTags(): Record<string, string>;
    /**
     * Initialize auto-instrumentation
     * Registers global error handler and unhandled rejection handler.
     * Safe to call multiple times -- only initializes once.
     * @task TASK-584
     */
    init(): void;
    /**
     * Clean up auto-instrumentation and stop tracking.
     * @task TASK-584
     */
    destroy(): void;
    /**
     * Capture an error with the configured strategy
     * @task TASK-585
     */
    captureError(error: Error, options?: CaptureOptions): Promise<CaptureResult | null>;
    /**
     * Capture a non-error message
     * @task TASK-587
     */
    captureMessage(message: string, options?: CaptureOptions): Promise<CaptureResult | null>;
    /**
     * Add a custom breadcrumb
     * @task TASK-587
     */
    addBreadcrumb(breadcrumb: {
        type?: BreadcrumbType;
        category: string;
        message: string;
        data?: Record<string, unknown>;
        level?: BreadcrumbLevel;
    }): void;
    /**
     * Set user context (anonymous ID only)
     * @task TASK-587
     */
    setUser(user: UserContext | null): void;
    /**
     * Set multiple tags
     * @task TASK-587
     */
    setTags(tags: Record<string, string>): void;
    /**
     * Clear all breadcrumbs
     * @task TASK-587
     */
    clearBreadcrumbs(): void;
    /**
     * Get current user context
     * @task TASK-587
     */
    getUser(): UserContext | null;
}

/**
 * AuthHub Client
 *
 * Core client implementation with HTTP utilities and request handling.
 *
 * @module @authhub/sdk/client
 */

/**
 * HTTP method types supported by the client.
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
declare class AuthHubClient {
    private readonly config;
    /**
     * AI module for chat completions.
     */
    readonly ai: AIModule;
    /**
     * Database module for queries and transactions.
     */
    readonly db: DBModule;
    /**
     * Secrets module for accessing application secrets.
     */
    readonly secrets: SecretsModule;
    /**
     * Lazily-initialized debug module instance.
     * @internal
     */
    private _debug;
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
    get debug(): DebugModule;
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
    initDebug(): void;
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
    constructor(config: AuthHubClientConfig);
    /**
     * Get the base URL of the AuthHub API.
     */
    get baseUrl(): string;
    /**
     * Get the configured timeout in milliseconds.
     */
    get timeout(): number;
    /**
     * Get the configured retry count.
     */
    get retries(): number;
    /**
     * Build the full URL for an API request.
     *
     * @param path - API endpoint path
     * @param params - Optional query parameters
     * @returns Full URL with query string
     */
    protected buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string;
    /**
     * Get default headers for API requests.
     *
     * Includes tracking headers for request correlation and SDK version tracking.
     *
     * @returns Headers object with authentication, content type, and tracking info
     */
    protected getHeaders(): Record<string, string>;
    /**
     * Generate a unique request ID for correlation.
     *
     * Uses crypto.randomUUID() if available, otherwise falls back to timestamp-based ID.
     *
     * @returns Unique request ID
     * @internal
     */
    private generateRequestId;
    /**
     * Make an authenticated HTTP request to the AuthHub API.
     *
     * @param options - Request options
     * @returns Parsed JSON response
     * @throws {Error} If the request fails or returns an error response
     *
     * @internal
     */
    protected request<T>(options: RequestOptions): Promise<T>;
    /**
     * Delay execution for the specified milliseconds.
     *
     * @param ms - Milliseconds to delay
     */
    private delay;
    /**
     * Make a GET request.
     *
     * @param path - API endpoint path
     * @param params - Optional query parameters
     * @returns Parsed JSON response
     *
     * @internal
     */
    protected get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T>;
    /**
     * Make a POST request.
     *
     * @param path - API endpoint path
     * @param body - Request body
     * @returns Parsed JSON response
     *
     * @internal
     */
    protected post<T>(path: string, body?: unknown): Promise<T>;
    /**
     * Make a PUT request.
     *
     * @param path - API endpoint path
     * @param body - Request body
     * @returns Parsed JSON response
     *
     * @internal
     */
    protected put<T>(path: string, body?: unknown): Promise<T>;
    /**
     * Make a DELETE request.
     *
     * @param path - API endpoint path
     * @returns Parsed JSON response
     *
     * @internal
     */
    protected delete<T>(path: string): Promise<T>;
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
    verifyToken(token: string): Promise<AuthUser | null>;
}

/**
 * AuthHub SDK Errors
 *
 * Custom error classes for different failure scenarios.
 *
 * @module @authhub/sdk/errors
 */
/**
 * Base error class for all AuthHub SDK errors.
 *
 * @example
 * ```typescript
 * try {
 *   await client.ai.chat({ model: 'gpt-4', messages: [] });
 * } catch (error) {
 *   if (error instanceof AuthHubError) {
 *     console.error(`Code: ${error.code}, Status: ${error.statusCode}`);
 *   }
 * }
 * ```
 */
declare class AuthHubError extends Error {
    /**
     * Error code for programmatic handling.
     */
    readonly code: string;
    /**
     * HTTP status code (if applicable).
     */
    readonly statusCode: number | undefined;
    /**
     * Additional error details.
     */
    readonly details: Record<string, unknown> | undefined;
    constructor(message: string, code: string, statusCode?: number, details?: Record<string, unknown>);
    /**
     * Get a user-friendly error message with troubleshooting hints.
     */
    get hint(): string;
}
/**
 * Authentication error (401 Unauthorized).
 *
 * Thrown when the API key is invalid, expired, or missing.
 */
declare class AuthError extends AuthHubError {
    constructor(message?: string, details?: Record<string, unknown>);
}
/**
 * Rate limit error (429 Too Many Requests).
 *
 * Thrown when the API rate limit has been exceeded.
 */
declare class RateLimitError extends AuthHubError {
    /**
     * Seconds to wait before retrying (from Retry-After header).
     */
    readonly retryAfter: number | undefined;
    constructor(message?: string, retryAfter?: number, details?: Record<string, unknown>);
}
/**
 * Validation error (400 Bad Request).
 *
 * Thrown when the request parameters are invalid.
 */
declare class ValidationError extends AuthHubError {
    /**
     * Fields that failed validation.
     */
    readonly fields: Record<string, string> | undefined;
    constructor(message?: string, fields?: Record<string, string>, details?: Record<string, unknown>);
}
/**
 * Network error for connection failures.
 *
 * Thrown when the request could not be completed due to network issues.
 */
declare class NetworkError extends AuthHubError {
    /**
     * Whether this error is likely transient and worth retrying.
     */
    readonly isTransient: boolean;
    constructor(message?: string, isTransient?: boolean, details?: Record<string, unknown>);
}
/**
 * Server error (500+).
 *
 * Thrown when the server returns an internal error.
 */
declare class ServerError extends AuthHubError {
    constructor(message?: string, statusCode?: number, details?: Record<string, unknown>);
}
/**
 * Not found error (404).
 *
 * Thrown when the requested resource does not exist.
 */
declare class NotFoundError extends AuthHubError {
    /**
     * The resource type that was not found.
     */
    readonly resource: string | undefined;
    constructor(message?: string, resource?: string, details?: Record<string, unknown>);
}
/**
 * Error codes specific to AI operations.
 */
type AIErrorCode = 'invalid_model' | 'no_provider_configured' | 'provider_unavailable' | 'rate_limit_exceeded' | 'timeout' | 'circuit_open' | 'content_filtered' | 'context_length_exceeded' | 'internal_error';
/**
 * AI-specific error for chat completion failures.
 *
 * Provides detailed error codes and suggestions for common AI operation failures.
 *
 * @example
 * ```typescript
 * try {
 *   await client.ai.chat({ model: 'invalid-model', messages: [] });
 * } catch (error) {
 *   if (error instanceof AIError) {
 *     console.error(`AI Error: ${error.aiCode}`);
 *     console.error(`Model: ${error.model}`);
 *     console.error(`Suggestion: ${error.suggestion}`);
 *     if (error.isRetryable) {
 *       // Implement retry logic
 *     }
 *   }
 * }
 * ```
 */
declare class AIError extends AuthHubError {
    /**
     * AI-specific error code for programmatic handling.
     */
    readonly aiCode: AIErrorCode;
    /**
     * Model ID that caused the error (if applicable).
     */
    readonly model: string | undefined;
    constructor(message: string, aiCode: AIErrorCode, statusCode?: number, model?: string);
    /**
     * Whether this error is likely transient and worth retrying.
     *
     * Returns true for rate limits, timeouts, circuit breaker, and provider unavailability.
     */
    get isRetryable(): boolean;
    /**
     * User-friendly suggestion for resolving this error.
     */
    get suggestion(): string;
    /**
     * Get a human-readable description of this error code.
     */
    get description(): string;
}

/**
 * AuthHub SDK Version
 *
 * @module @authhub/sdk/version
 */
/**
 * Current SDK version.
 * Update this when publishing new releases.
 */
declare const SDK_VERSION = "1.0.0";
/**
 * SDK client identifier for tracking.
 */
declare const SDK_CLIENT = "typescript";

export { AIError, type AIErrorCode, type AIModel, AIModule, type AIUsageStats, type AOMTreeCapture, type ASTCapture, type ApiErrorResponse, AuthClient, type AuthClientConfig, AuthError, type AuthErrorCode, AuthHubClient, type AuthHubClientConfig, AuthHubError, type AuthHubMetadata, type AuthMode, type AuthModule, type AuthModuleConfig, type AuthState, type AuthUser, AuthenticationError, type Breadcrumb, type BreadcrumbConfig, type BreadcrumbLevel, type BreadcrumbType, type CaptureEvent, type CaptureOptions, type CaptureResult, type CaptureStrategy, type CaptureStrategyName, type ChatChoice, type ChatCompletionOptions, type ChatCompletionResponse, type ChatMessage, type ChatRole, type ChatStreamChunk, type ChatUsage, DBModule, type DebugClientConfig, DebugModule, type DebugModuleConfig, type DiffusionScheduler, type EmbeddingData, type EmbeddingEncodingFormat, type EmbeddingOptions, type EmbeddingResponse, type GetUsageOptions, type ImageAspectRatio, type ImageBackground, type ImageData, type ImageFidelity, type ImageGenerationOptions, type ImageGenerationResponse, type ImageModeration, type ImageOutputFormat, type ImageQuality, type ImageResponseFormat, type ImageSize, type ImageStyle, type ImageStylePreset, type InputModality, type ListModelsOptions, type ListModelsResponse, LocalStorageTokenStorage, type LoginCredentials, type LoginResult, MemoryTokenStorage, type ModelArchitecture, NetworkError, NotFoundError, type OAuthCallbackParams, type OAuthCallbackResult, OAuthProvider, type OAuthUrlOptions, type OutputModality, type PasswordResetResult, type PersonGeneration, type QueryResult, RateLimitError, type RedirectLoginOptions, type RefreshResult, type RegisterData, type RegisterResult, SDK_CLIENT, SDK_VERSION, SecretsModule, type SemanticDOMCapture, ServerError, SessionStorageTokenStorage, type SpeechAudioFormat, type SpeechOptions, type SpeechVoice, type StorageStrategyType, type StorageType, type StoredTokenData, type SyntheticScreenshotCapture, type ThoughtStep, type TokenExchangeRequest, type TokenResponse, type TokenStorage, type TransactionContext, type TranscriptionFileInput, type TranscriptionOptions, type TranscriptionResponse, type TranscriptionResponseFormat, type TranscriptionSegment, type TranscriptionWord, type UserContext, ValidationError, createAuthClient, createStoredTokenData, createTokenStorage, getGitHubAuthUrl, getGoogleAuthUrl, getOAuthError, getOAuthUrl, getTokenExpiresIn, hasOAuthCallback, hasOAuthError, isTokenExpired, parseOAuthCallbackResult };
