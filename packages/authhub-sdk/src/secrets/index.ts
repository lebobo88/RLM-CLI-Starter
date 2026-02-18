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
 * Response from the get secret endpoint.
 */
interface SecretResponse {
  name: string;
  value: string;
}

/**
 * Response from the list secrets endpoint.
 */
interface SecretsListResponse {
  secrets: string[];
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
export class SecretsModule {
  private readonly config: SecretsModuleConfig;

  /**
   * Creates a new secrets module instance.
   * @internal
   */
  constructor(config: SecretsModuleConfig) {
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
  async get(name: string): Promise<string> {
    if (!name || typeof name !== 'string') {
      throw new Error('secret name must be a non-empty string');
    }

    // Validate name format (alphanumeric, underscores, hyphens only)
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error('secret name contains invalid characters');
    }

    try {
      const response = await this.config.request<SecretResponse>({
        method: 'GET',
        path: `/api/v1/secrets/${encodeURIComponent(name)}`,
      });

      return response.value;
    } catch (error) {
      // Sanitize error message to not expose secret name details
      if (error instanceof Error) {
        // Check for authorization errors
        if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) {
          throw new Error(`Access denied to secret '${name}'`);
        }
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
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
  async list(): Promise<string[]> {
    const response = await this.config.request<SecretsListResponse>({
      method: 'GET',
      path: '/api/v1/secrets',
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
  async exists(name: string): Promise<boolean> {
    try {
      const secrets = await this.list();
      return secrets.includes(name);
    } catch {
      return false;
    }
  }
}
