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
export class AuthHubError extends Error {
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

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthHubError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthHubError);
    }
  }

  /**
   * Get a user-friendly error message with troubleshooting hints.
   */
  get hint(): string {
    switch (this.code) {
      case 'AUTH_ERROR':
        return 'Check your API key is correct and not expired.';
      case 'RATE_LIMIT':
        return 'You are being rate limited. Wait and retry.';
      case 'VALIDATION_ERROR':
        return 'Check your request parameters.';
      case 'NETWORK_ERROR':
        return 'Check your network connection and AuthHub URL.';
      default:
        return 'An unexpected error occurred.';
    }
  }
}

/**
 * Authentication error (401 Unauthorized).
 *
 * Thrown when the API key is invalid, expired, or missing.
 */
export class AuthError extends AuthHubError {
  constructor(message: string = 'Authentication failed', details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

/**
 * Rate limit error (429 Too Many Requests).
 *
 * Thrown when the API rate limit has been exceeded.
 */
export class RateLimitError extends AuthHubError {
  /**
   * Seconds to wait before retrying (from Retry-After header).
   */
  readonly retryAfter: number | undefined;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 'RATE_LIMIT', 429, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Validation error (400 Bad Request).
 *
 * Thrown when the request parameters are invalid.
 */
export class ValidationError extends AuthHubError {
  /**
   * Fields that failed validation.
   */
  readonly fields: Record<string, string> | undefined;

  constructor(
    message: string = 'Validation failed',
    fields?: Record<string, string>,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, { ...details, fields });
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

/**
 * Network error for connection failures.
 *
 * Thrown when the request could not be completed due to network issues.
 */
export class NetworkError extends AuthHubError {
  /**
   * Whether this error is likely transient and worth retrying.
   */
  readonly isTransient: boolean;

  constructor(
    message: string = 'Network request failed',
    isTransient: boolean = true,
    details?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', undefined, details);
    this.name = 'NetworkError';
    this.isTransient = isTransient;
  }
}

/**
 * Server error (500+).
 *
 * Thrown when the server returns an internal error.
 */
export class ServerError extends AuthHubError {
  constructor(
    message: string = 'Internal server error',
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message, 'SERVER_ERROR', statusCode, details);
    this.name = 'ServerError';
  }
}

/**
 * Not found error (404).
 *
 * Thrown when the requested resource does not exist.
 */
export class NotFoundError extends AuthHubError {
  /**
   * The resource type that was not found.
   */
  readonly resource: string | undefined;

  constructor(
    message: string = 'Resource not found',
    resource?: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'NOT_FOUND', 404, { ...details, resource });
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

// ============================================================================
// AI-Specific Errors
// ============================================================================

/**
 * Error codes specific to AI operations.
 */
export type AIErrorCode =
  | 'invalid_model'
  | 'no_provider_configured'
  | 'provider_unavailable'
  | 'rate_limit_exceeded'
  | 'timeout'
  | 'circuit_open'
  | 'content_filtered'
  | 'context_length_exceeded'
  | 'internal_error';

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
export class AIError extends AuthHubError {
  /**
   * AI-specific error code for programmatic handling.
   */
  readonly aiCode: AIErrorCode;

  /**
   * Model ID that caused the error (if applicable).
   */
  readonly model: string | undefined;

  constructor(
    message: string,
    aiCode: AIErrorCode,
    statusCode?: number,
    model?: string
  ) {
    super(message, 'AI_ERROR', statusCode, { aiCode, model });
    this.name = 'AIError';
    this.aiCode = aiCode;
    this.model = model;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIError);
    }
  }

  /**
   * Whether this error is likely transient and worth retrying.
   *
   * Returns true for rate limits, timeouts, circuit breaker, and provider unavailability.
   */
  get isRetryable(): boolean {
    return [
      'rate_limit_exceeded',
      'timeout',
      'circuit_open',
      'provider_unavailable',
    ].includes(this.aiCode);
  }

  /**
   * User-friendly suggestion for resolving this error.
   */
  get suggestion(): string {
    switch (this.aiCode) {
      case 'invalid_model':
        return 'Use client.ai.listModels() to see available models.';
      case 'no_provider_configured':
        return 'Contact your administrator to configure an AI provider in AuthHub.';
      case 'provider_unavailable':
        return 'The AI provider is temporarily unavailable. Try again in a few moments.';
      case 'rate_limit_exceeded':
        return 'You are being rate limited. Wait and retry with exponential backoff.';
      case 'circuit_open':
        return 'Provider circuit breaker is open due to repeated failures. Try later.';
      case 'timeout':
        return 'Request timed out. Try a shorter prompt or increase the timeout.';
      case 'content_filtered':
        return 'Content was filtered by the model\'s safety systems. Modify your prompt.';
      case 'context_length_exceeded':
        return 'Prompt exceeds model context window. Use a model with larger context or shorten your input.';
      case 'internal_error':
      default:
        return 'An unexpected error occurred. Check AuthHub logs for details.';
    }
  }

  /**
   * Get a human-readable description of this error code.
   */
  get description(): string {
    switch (this.aiCode) {
      case 'invalid_model':
        return 'The specified model ID is not recognized or not available.';
      case 'no_provider_configured':
        return 'No AI provider is configured for the model type you requested.';
      case 'provider_unavailable':
        return 'The AI provider is not responding or has an outage.';
      case 'rate_limit_exceeded':
        return 'Too many requests sent to the AI provider.';
      case 'circuit_open':
        return 'The provider has been temporarily disabled due to errors.';
      case 'timeout':
        return 'The AI request took too long to complete.';
      case 'content_filtered':
        return 'The request or response was blocked by content filtering.';
      case 'context_length_exceeded':
        return 'The prompt is too long for the selected model.';
      case 'internal_error':
      default:
        return 'An internal error occurred while processing your request.';
    }
  }
}

/**
 * Parse an API error response and return the appropriate error class.
 *
 * @param statusCode - HTTP status code
 * @param body - Error response body
 * @param headers - Response headers
 * @returns Appropriate AuthHubError subclass
 *
 * @internal
 */
export function parseApiError(
  statusCode: number,
  body: Record<string, unknown>,
  headers?: Headers
): AuthHubError {
  const error = body['error'] as Record<string, unknown> | undefined;
  const message = (error?.['message'] as string) ?? `Request failed with status ${statusCode}`;
  const code = (error?.['code'] as string) ?? undefined;
  const details = (error?.['details'] as Record<string, unknown>) ?? undefined;

  switch (statusCode) {
    case 400:
      return new ValidationError(message, undefined, details);
    case 401:
      return new AuthError(message, details);
    case 403:
      return new AuthError(`Access denied: ${message}`, details);
    case 404:
      return new NotFoundError(message, undefined, details);
    case 429: {
      const retryAfter = headers?.get('Retry-After');
      return new RateLimitError(
        message,
        retryAfter ? parseInt(retryAfter, 10) : undefined,
        details
      );
    }
    default:
      if (statusCode >= 500) {
        return new ServerError(message, statusCode, details);
      }
      return new AuthHubError(message, code ?? 'UNKNOWN_ERROR', statusCode, details);
  }
}
