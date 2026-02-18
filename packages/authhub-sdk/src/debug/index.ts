/**
 * DebugModule - Zero-Trust Debug Logging SDK
 * @task TASK-583
 * @feature FTR-124
 */

import { BreadcrumbTracker } from './breadcrumbs.js';
import {
  SemanticDOMStrategy,
  SyntheticScreenshotStrategy,
  AOMTreeStrategy,
  ASTStrategy,
  type CaptureStrategy,
} from './strategies/index.js';
import type {
  DebugModuleConfig,
  CaptureStrategyName,
  UserContext,
  CaptureOptions,
  CaptureResult,
  CaptureEvent,
  BreadcrumbType,
  BreadcrumbLevel,
} from './types.js';

/**
 * Mapping from public hyphenated strategy names to internal underscore names
 * used by strategy classes.
 */
const STRATEGY_NAME_MAP: Record<CaptureStrategyName, string> = {
  'semantic-dom': 'semantic_dom',
  'synthetic-screenshot': 'synthetic_screenshot',
  'aom-tree': 'aom_tree',
  'ast-capture': 'ast',
};

export class DebugModule {
  private config: DebugModuleConfig;
  private breadcrumbTracker: BreadcrumbTracker;
  private strategies: Map<string, CaptureStrategy>;
  private userContext: UserContext | null = null;
  private tags: Record<string, string> = {};
  private sessionId: string;
  private initialized = false;
  private originalOnError: OnErrorEventHandler | null = null;
  private unhandledRejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;
  private cspViolationHandler: ((event: SecurityPolicyViolationEvent) => void) | null = null;

  constructor(config: DebugModuleConfig) {
    this.config = {
      enabled: config.enabled ?? true,
      sampleRate: config.sampleRate ?? 1.0,
      environment: config.environment ?? 'production',
      release: config.release ?? '',
      maxBreadcrumbs: config.maxBreadcrumbs ?? 50,
      appId: config.appId,
      apiUrl: config.apiUrl,
    };
    if (config.strategies) this.config.strategies = config.strategies;
    if (config.beforeCapture) this.config.beforeCapture = config.beforeCapture;
    if (config.request) this.config.request = config.request;

    this.breadcrumbTracker = new BreadcrumbTracker({
      maxBreadcrumbs: this.config.maxBreadcrumbs ?? 50,
    });

    this.strategies = new Map<string, CaptureStrategy>([
      ['semantic_dom', new SemanticDOMStrategy()],
      ['synthetic_screenshot', new SyntheticScreenshotStrategy()],
      ['aom_tree', new AOMTreeStrategy()],
      ['ast', new ASTStrategy()],
    ]);

    this.sessionId = this.getOrCreateSessionId();
  }

  /**
   * Generate or retrieve a persistent session ID.
   * Uses sessionStorage in browser environments for persistence
   * across page navigations within the same session.
   * Falls back to random generation in non-browser environments.
   */
  private getOrCreateSessionId(): string {
    if (typeof globalThis.sessionStorage === 'undefined') {
      return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
    const key = '__authhub_debug_session_id';
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
  resolveStrategyName(name: CaptureStrategyName): string {
    return STRATEGY_NAME_MAP[name];
  }

  /**
   * Get a capture strategy by its internal underscore-format name.
   */
  getStrategy(name: string): CaptureStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * Get the current session ID.
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Check if the module has been initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if the module is enabled.
   */
  isEnabled(): boolean {
    return this.config.enabled ?? true;
  }

  /**
   * Get the current configuration (read-only copy).
   */
  getConfig(): DebugModuleConfig {
    return { ...this.config };
  }

  /**
   * Get the breadcrumb tracker instance.
   */
  getBreadcrumbTracker(): BreadcrumbTracker {
    return this.breadcrumbTracker;
  }

  /**
   * Set user context for associating captures with an anonymous user.
   */
  setUserContext(user: UserContext | null): void {
    this.userContext = user;
  }

  /**
   * Get the current user context.
   */
  getUserContext(): UserContext | null {
    return this.userContext;
  }

  /**
   * Set a tag key-value pair for all future captures.
   */
  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  /**
   * Get all currently set tags.
   */
  getTags(): Record<string, string> {
    return { ...this.tags };
  }

  /**
   * Initialize auto-instrumentation
   * Registers global error handler and unhandled rejection handler.
   * Safe to call multiple times -- only initializes once.
   * @task TASK-584
   */
  init(): void {
    if (this.initialized) return;
    if (typeof window === 'undefined') return;

    this.initialized = true;
    this.breadcrumbTracker.init();

    // Global error handler
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

    // Unhandled promise rejection handler
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      if (this.isEnabled()) {
        const error = event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
        this.captureError(error, { level: 'error' });
      }
    };
    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);

    // CSP violation handler - captures as errors
    this.cspViolationHandler = (event: SecurityPolicyViolationEvent) => {
      if (this.isEnabled()) {
        const error = new Error(
          `CSP violation: ${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`
        );
        error.name = 'SecurityPolicyViolation';
        this.captureError(error, {
          level: 'error',
          tags: {
            'csp.directive': event.violatedDirective,
            'csp.blockedURI': event.blockedURI || '',
            'csp.sourceFile': event.sourceFile || '',
          },
        });
      }
    };
    document.addEventListener('securitypolicyviolation', this.cspViolationHandler);
  }

  /**
   * Clean up auto-instrumentation and stop tracking.
   * @task TASK-584
   */
  destroy(): void {
    if (!this.initialized) return;

    this.breadcrumbTracker.destroy();

    // Restore original error handler
    if (typeof window !== 'undefined') {
      window.onerror = this.originalOnError;
      this.originalOnError = null;

      if (this.unhandledRejectionHandler) {
        window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
        this.unhandledRejectionHandler = null;
      }
    }

    if (typeof document !== 'undefined' && this.cspViolationHandler) {
      document.removeEventListener('securitypolicyviolation', this.cspViolationHandler);
      this.cspViolationHandler = null;
    }

    this.initialized = false;
  }

  /**
   * Capture an error with the configured strategy
   * @task TASK-585
   */
  async captureError(
    error: Error,
    options: CaptureOptions = {}
  ): Promise<CaptureResult | null> {
    if (!this.isEnabled()) return null;
    if (Math.random() > (this.config.sampleRate ?? 1)) return null;

    try {
      const requestedStrategy = options.strategies?.[0] || this.config.strategies?.[0] || 'semantic-dom' as CaptureStrategyName;
      const strategyName = this.resolveStrategyName(requestedStrategy) || 'semantic_dom';

      const strategy = this.strategies.get(strategyName);
      if (!strategy) return null;

      const captureData = await strategy.capture({ error });

      const errorInfo: CaptureEvent['error'] = {
        name: error.name,
        message: error.message,
      };
      if (error.stack) errorInfo.stack = error.stack;

      const context: CaptureEvent['context'] = {
        tags: { ...this.tags, ...options.tags },
      };
      if (this.userContext) context.user = this.userContext;

      let event: CaptureEvent = {
        error: errorInfo,
        capture: {
          strategies: [requestedStrategy],
          timestamp: new Date().toISOString(),
          data: captureData,
        },
        context,
        breadcrumbs: this.breadcrumbTracker.getBreadcrumbs(),
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
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              error: {
                type: event.error.name,
                message: event.error.message,
                stack: event.error.stack,
              },
              severity: options.level === 'debug' ? 'info' : (options.level ?? 'error'),
              capture: { strategy: strategyName, data: event.capture.data },
              context: typeof window !== 'undefined' ? {
                url: window.location.pathname,
                userAgent: navigator.userAgent,
                viewport: { width: window.innerWidth, height: window.innerHeight },
              } : undefined,
              breadcrumbs: event.breadcrumbs?.map((bc) => ({
                ...bc,
                timestamp: new Date(bc.timestamp).getTime(),
              })),
              metadata: {
                environment: this.config.environment,
                release: this.config.release,
                sessionId: this.sessionId,
              },
            }),
          }
        );

        if (response.ok) {
          return await response.json() as CaptureResult;
        }

        if (response.status === 429) {
          console.warn('[AuthHub Debug] Rate limited');
        } else if (response.status === 403) {
          console.warn('[AuthHub Debug] API key lacks debug scope');
        } else {
          const body = await response.text().catch(() => '');
          console.warn(`[AuthHub Debug] Capture failed (${response.status}): ${body}`);
        }
      }

      return null;
    } catch (err) {
      console.error('[AuthHub Debug] Capture error:', err);
      return null;
    }
  }

  /**
   * Capture a non-error message
   * @task TASK-587
   */
  async captureMessage(message: string, options: CaptureOptions = {}): Promise<CaptureResult | null> {
    const error = new Error(message);
    error.name = 'Message';
    return this.captureError(error, { level: 'info', ...options });
  }

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
  }): void {
    const bc: Parameters<BreadcrumbTracker['add']>[0] = {
      type: breadcrumb.type ?? 'custom',
      category: breadcrumb.category,
      message: breadcrumb.message,
    };
    if (breadcrumb.data) bc.data = breadcrumb.data;
    if (breadcrumb.level) bc.level = breadcrumb.level;
    this.breadcrumbTracker.add(bc);
  }

  /**
   * Set user context (anonymous ID only)
   * @task TASK-587
   */
  setUser(user: UserContext | null): void {
    if (user && !user.id) {
      console.warn('[AuthHub Debug] UserContext requires id field');
      return;
    }
    this.userContext = user;
  }

  /**
   * Set multiple tags
   * @task TASK-587
   */
  setTags(tags: Record<string, string>): void {
    this.tags = { ...this.tags, ...tags };
  }

  /**
   * Clear all breadcrumbs
   * @task TASK-587
   */
  clearBreadcrumbs(): void {
    this.breadcrumbTracker.clear();
  }

  /**
   * Get current user context
   * @task TASK-587
   */
  getUser(): UserContext | null {
    return this.userContext;
  }
}
