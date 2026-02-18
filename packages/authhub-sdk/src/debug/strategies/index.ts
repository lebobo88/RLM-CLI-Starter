/**
 * Capture Strategies - Barrel Export
 * @task TASK-581
 * @feature FTR-119
 */

// Types
export type {
  CaptureStrategy,
  CaptureContext,
  SemanticDOMCapture,
  SyntheticScreenshotCapture,
  AOMTreeCapture,
  ASTCapture,
  ElementNode,
  AccessibilityNode,
  AccessibilityState,
  LandmarkInfo,
  CallStackFrame,
  ASTNode,
} from './types.js';

// Strategies
export { SemanticDOMStrategy } from './semantic-dom.js';
export { SyntheticScreenshotStrategy } from './synthetic-screenshot.js';
export { AOMTreeStrategy } from './aom-tree.js';
export { ASTStrategy } from './ast.js';
