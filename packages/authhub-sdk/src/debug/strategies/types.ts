/**
 * Capture Strategy Types for Zero-Trust Debug Logging
 * @task TASK-566
 * @feature FTR-119
 */

/**
 * Context provided to capture strategies
 */
export interface CaptureContext {
  /** Error that triggered the capture */
  error?: Error;
  /** Element associated with the error */
  element?: HTMLElement;
}

/**
 * Base interface for all capture strategies
 */
export interface CaptureStrategy<T = unknown> {
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
export interface ElementNode {
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
export interface SemanticDOMCapture {
  rootElement: ElementNode;
  activeElement?: string;
  scrollPosition: { x: number; y: number };
  viewportSize: { width: number; height: number };
  capturedAt: string;
}

/**
 * Result of synthetic screenshot capture
 */
export interface SyntheticScreenshotCapture {
  imageData: string;
  dimensions: { width: number; height: number };
  errorLocation?: { x: number; y: number; selector: string };
  maskedElements: string[];
  capturedAt: string;
}

/**
 * Accessibility state for AOM nodes
 */
export interface AccessibilityState {
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
export interface AccessibilityNode {
  role: string;
  name?: string;
  description?: string;
  state?: AccessibilityState;
  children?: AccessibilityNode[];
}

/**
 * Landmark information for accessibility
 */
export interface LandmarkInfo {
  role: string;
  label?: string;
  selector: string;
}

/**
 * Result of AOM tree capture
 */
export interface AOMTreeCapture {
  rootNode: AccessibilityNode;
  focusedElement?: string;
  focusOrder: string[];
  landmarks: LandmarkInfo[];
  capturedAt: string;
}

/**
 * AST node representation
 */
export interface ASTNode {
  type: string;
  name?: string;
  location?: { line: number; column: number };
  value?: string;
  children?: ASTNode[];
}

/**
 * Call stack frame information
 */
export interface CallStackFrame {
  functionName: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
}

/**
 * Result of AST capture
 */
export interface ASTCapture {
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
