/**
 * BreadcrumbTracker - Core breadcrumb tracking for Zero-Trust Debug Logging
 * @task TASK-561
 * @feature FTR-123
 */

import type { Breadcrumb, BreadcrumbConfig, BreadcrumbType, ElementDescriptor, BreadcrumbLevel } from './types.js';

/** Default breadcrumb types to track */
const DEFAULT_BREADCRUMB_TYPES: BreadcrumbType[] = [
  'click',
  'navigation',
  'xhr',
  'fetch',
  'console',
  'dom',
  'security',
  'custom',
];

/**
 * BreadcrumbTracker maintains a list of user interactions
 * for debugging context when errors occur.
 */
export class BreadcrumbTracker {
  private breadcrumbs: Breadcrumb[] = [];
  private config: Required<BreadcrumbConfig>;
  private initialized = false;
  private cspViolationHandler: ((event: SecurityPolicyViolationEvent) => void) | null = null;

  constructor(config: BreadcrumbConfig = {}) {
    this.config = {
      maxBreadcrumbs: config.maxBreadcrumbs ?? 50,
      enabledTypes: config.enabledTypes ?? DEFAULT_BREADCRUMB_TYPES,
      beforeBreadcrumb: config.beforeBreadcrumb ?? ((b) => b),
    };
  }

  /**
   * Add a breadcrumb to the list
   * @param breadcrumb - Breadcrumb to add (timestamp optional)
   */
  add(breadcrumb: Omit<Breadcrumb, 'timestamp'> & { timestamp?: string }): void {
    const bc: Breadcrumb = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp ?? new Date().toISOString(),
    };

    // Apply beforeBreadcrumb hook
    const processed = this.config.beforeBreadcrumb(bc);
    if (!processed) return;

    // Check if type is enabled
    if (!this.config.enabledTypes.includes(processed.type)) return;

    this.breadcrumbs.push(processed);

    // FIFO enforcement - remove oldest when exceeding max
    while (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Get a copy of all breadcrumbs
   * @returns Copy of breadcrumbs array
   */
  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Clear all breadcrumbs
   */
  clear(): void {
    this.breadcrumbs = [];
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<BreadcrumbConfig> {
    return { ...this.config };
  }

  /**
   * Check if tracker is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize click, navigation, and HTTP tracking with event listeners
   * Safe to call multiple times - will only initialize once
   * @task TASK-563
   */
  init(): void {
    if (this.initialized || typeof window === 'undefined' || typeof document === 'undefined') return;
    this.initialized = true;

    // Click tracking
    document.addEventListener('click', this.handleClick.bind(this), true);

    // Navigation tracking (TASK-563)
    window.addEventListener('popstate', this.handleNavigation.bind(this));
    this.wrapHistoryMethod('pushState');
    this.wrapHistoryMethod('replaceState');

    // HTTP tracking (TASK-563)
    this.wrapFetch();
    this.wrapXHR();

    // Console tracking (TASK-564)
    this.wrapConsole();

    // CSP violation tracking
    this.cspViolationHandler = this.handleCSPViolation.bind(this);
    document.addEventListener('securitypolicyviolation', this.cspViolationHandler);
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (!this.initialized || typeof window === 'undefined' || typeof document === 'undefined') return;
    document.removeEventListener('click', this.handleClick.bind(this), true);
    if (this.cspViolationHandler) {
      document.removeEventListener('securitypolicyviolation', this.cspViolationHandler);
      this.cspViolationHandler = null;
    }
    this.initialized = false;
  }

  /**
   * Handle click events and create breadcrumbs
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    const descriptor = this.getElementDescriptor(target);

    this.add({
      type: 'click',
      category: 'ui',
      message: `Clicked ${descriptor.tag}${descriptor.id ? '#' + descriptor.id : ''}`,
      data: { element: descriptor },
    });
  }

  /**
   * Get safe element descriptor without PII
   * Only captures structural/identifying attributes
   */
  private getElementDescriptor(el: HTMLElement): ElementDescriptor {
    const desc: ElementDescriptor = {
      tag: el.tagName.toLowerCase(),
    };
    if (el.id) desc.id = el.id;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(Boolean);
      if (classes.length > 0) desc.classes = classes;
    }
    const role = el.getAttribute('role');
    if (role) desc.role = role;
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) desc['aria-label'] = ariaLabel;
    const testId = el.getAttribute('data-testid');
    if (testId) desc['data-testid'] = testId;
    return desc;
  }

  /**
   * Handle CSP violation events and create breadcrumbs
   */
  private handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    this.add({
      type: 'security',
      category: 'csp',
      message: `CSP violation: ${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`,
      data: {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
        originalPolicy: event.originalPolicy,
      },
      level: 'error',
    });
  }

  /**
   * Handle popstate navigation events
   * @task TASK-563
   */
  private handleNavigation(): void {
    this.add({
      type: 'navigation',
      category: 'navigation',
      message: `Navigated to ${this.sanitizeUrl(window.location.href)}`,
      data: { path: this.sanitizeUrl(window.location.href) },
    });
  }

  /**
   * Sanitize URL to remove query params and hash for privacy
   * Only returns pathname to avoid capturing PII in URLs
   * @task TASK-563
   */
  private sanitizeUrl(url: string): string {
    try {
      let base = 'http://localhost';
      if (typeof window !== 'undefined' && window.location && window.location.origin) {
        base = window.location.origin;
      }
      const parsed = new URL(url, base);
      return parsed.pathname;
    } catch {
      const noQuery = url.split('?')[0] ?? url;
      return noQuery.split('#')[0] ?? noQuery;
    }
  }

  /**
   * Wrap history pushState/replaceState to track SPA navigation
   * @task TASK-563
   */
  private wrapHistoryMethod(method: 'pushState' | 'replaceState'): void {
    const original = history[method].bind(history);
    const tracker = this;
    history[method] = function(...args: Parameters<typeof history.pushState>) {
      const result = original(...args);
      tracker.add({
        type: 'navigation',
        category: 'navigation',
        message: `Navigated to ${tracker.sanitizeUrl(window.location.pathname)}`,
        data: { method, path: tracker.sanitizeUrl(window.location.pathname) },
      });
      return result;
    };
  }

  /**
   * Wrap fetch API to track HTTP requests
   * Only captures method, path, and status - never request bodies
   * @task TASK-563
   */
  private wrapFetch(): void {
    const originalFetch = window.fetch.bind(window);
    const tracker = this;
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : (input as Request).url;
      const method = init?.method || 'GET';

      try {
        const response = await originalFetch(input, init);
        tracker.add({
          type: 'fetch',
          category: 'http',
          message: `${method} ${tracker.sanitizeUrl(url)} ${response.status}`,
          data: { method, path: tracker.sanitizeUrl(url), status: response.status },
        });
        return response;
      } catch (error) {
        tracker.add({
          type: 'fetch',
          category: 'http',
          message: `${method} ${tracker.sanitizeUrl(url)} failed`,
          data: { method, path: tracker.sanitizeUrl(url), error: 'network_error' },
          level: 'error',
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
  private wrapXHR(): void {
    const tracker = this;
    const OriginalXHR = window.XMLHttpRequest;

    window.XMLHttpRequest = function() {
      const xhr = new OriginalXHR();
      let method = 'GET';
      let url = '';

      const originalOpen = xhr.open.bind(xhr);
      xhr.open = function(reqMethod: string, reqUrl: string | URL, async_?: boolean, username?: string | null, password?: string | null) {
        method = reqMethod;
        url = typeof reqUrl === 'string' ? reqUrl : reqUrl.toString();
        return originalOpen(reqMethod, reqUrl, async_ ?? true, username ?? null, password ?? null);
      };

      xhr.addEventListener('loadend', () => {
        tracker.add({
          type: 'xhr',
          category: 'http',
          message: `${method} ${tracker.sanitizeUrl(url)} ${xhr.status}`,
          data: { method, path: tracker.sanitizeUrl(url), status: xhr.status },
          level: xhr.status >= 400 ? 'error' : 'info',
        });
      });

      return xhr;
    } as unknown as typeof XMLHttpRequest;
  }

  /**
   * Wrap console methods to track debug/info/warn/error
   * @task TASK-564
   */
  private wrapConsole(): void {
    const levels: Array<{ method: 'debug' | 'info' | 'warn' | 'error'; level: BreadcrumbLevel }> = [
      { method: 'debug', level: 'debug' },
      { method: 'info', level: 'info' },
      { method: 'warn', level: 'warning' },
      { method: 'error', level: 'error' },
    ];

    for (const { method, level } of levels) {
      const original = console[method].bind(console);
      const tracker = this;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any)[method] = function(...args: unknown[]) {
        tracker.addConsoleBreadcrumb(level, args);
        original(...args);
      };
    }
  }

  /**
   * Add a console breadcrumb from logged message
   * @task TASK-564
   */
  private addConsoleBreadcrumb(level: BreadcrumbLevel, args: unknown[]): void {
    const message = this.formatConsoleMessage(args);

    this.add({
      type: 'console',
      category: 'console',
      message,
      level,
    });
  }

  /**
   * Format console arguments into a safe message string
   * Truncates at 500 chars, sanitizes PII, and replaces objects
   * @task TASK-564
   */
  private formatConsoleMessage(args: unknown[]): string {
    const parts = args.map(arg => {
      if (typeof arg === 'string') {
        return this.sanitizeConsoleString(arg);
      }
      if (arg instanceof Error) {
        return `Error: ${arg.message}`;
      }
      if (typeof arg === 'object' && arg !== null) {
        return '[Object]';
      }
      return String(arg);
    });

    const message = parts.join(' ');
    return message.length > 500 ? message.slice(0, 497) + '...' : message;
  }

  /**
   * Sanitize console string to redact PII patterns
   * @task TASK-564
   */
  private sanitizeConsoleString(str: string): string {
    // Redact emails
    return str.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[REDACTED]'
    );
  }
}
