/**
 * Breadcrumb Types for Zero-Trust Debug Logging SDK
 * @task TASK-560
 * @feature FTR-123
 */

/**
 * Type of breadcrumb event
 */
export type BreadcrumbType =
  | 'click'
  | 'navigation'
  | 'xhr'
  | 'fetch'
  | 'console'
  | 'dom'
  | 'security'
  | 'custom';

/**
 * Severity level for breadcrumbs
 */
export type BreadcrumbLevel = 'debug' | 'info' | 'warning' | 'error';

/**
 * Represents a single breadcrumb event
 */
export interface Breadcrumb {
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
export interface BreadcrumbConfig {
  /** Maximum number of breadcrumbs to keep (default: 50) */
  maxBreadcrumbs?: number;
  /** Which breadcrumb types to enable */
  enabledTypes?: BreadcrumbType[];
  /** Hook to modify or filter breadcrumbs before adding */
  beforeBreadcrumb?: (breadcrumb: Breadcrumb) => Breadcrumb | null;
}

/**
 * Element descriptor for click tracking (no PII)
 */
export interface ElementDescriptor {
  tag: string;
  id?: string;
  classes?: string[];
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

// ===== Debug Module Types (TASK-582) =====

/**
 * Available capture strategy names
 */
export type CaptureStrategyName =
  | 'semantic-dom'
  | 'synthetic-screenshot'
  | 'aom-tree'
  | 'ast-capture';

/**
 * Custom request function type for HTTP calls
 */
export type RequestFn = (
  url: string,
  init?: RequestInit
) => Promise<Response>;

/**
 * Configuration for the debug module
 */
export interface DebugModuleConfig {
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
  request?: RequestFn;
}

/**
 * Per-capture options
 */
export interface CaptureOptions {
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
export interface CaptureResult {
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
export interface UserContext {
  /** Anonymous user identifier */
  id: string;
}

/**
 * Internal event structure for processing captures
 */
export interface CaptureEvent {
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
