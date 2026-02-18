/**
 * Tests for Capture Strategy Types
 * @task TASK-566
 * @feature FTR-119
 */

import { describe, it, expect } from 'vitest';
import type {
  CaptureStrategy,
  CaptureContext,
  ElementNode,
  SemanticDOMCapture,
  SyntheticScreenshotCapture,
  AccessibilityNode,
  AOMTreeCapture,
  ASTCapture,
} from './types.js';

describe('Capture Strategy Types', () => {
  it('should allow constructing CaptureContext', () => {
    const ctx: CaptureContext = {
      error: new Error('test'),
    };
    expect(ctx.error).toBeDefined();
  });

  it('should allow constructing ElementNode', () => {
    const node: ElementNode = {
      tag: 'div',
      id: 'test',
      classList: ['container'],
      children: [{ tag: 'span' }],
    };
    expect(node.tag).toBe('div');
  });

  it('should allow constructing SemanticDOMCapture', () => {
    const capture: SemanticDOMCapture = {
      rootElement: { tag: 'body' },
      scrollPosition: { x: 0, y: 0 },
      viewportSize: { width: 1920, height: 1080 },
      capturedAt: new Date().toISOString(),
    };
    expect(capture.rootElement.tag).toBe('body');
  });

  it('should allow constructing AccessibilityNode', () => {
    const node: AccessibilityNode = {
      role: 'button',
      name: 'Submit',
      state: { disabled: false },
    };
    expect(node.role).toBe('button');
  });

  it('should allow constructing AOMTreeCapture', () => {
    const capture: AOMTreeCapture = {
      rootNode: { role: 'document' },
      focusOrder: [],
      landmarks: [],
      capturedAt: new Date().toISOString(),
    };
    expect(capture.rootNode.role).toBe('document');
  });

  it('should allow constructing ASTCapture', () => {
    const capture: ASTCapture = {
      errorLocation: { file: 'test.ts', line: 1, column: 1 },
      contextNodes: [],
      callStack: [],
      capturedAt: new Date().toISOString(),
    };
    expect(capture.errorLocation.file).toBe('test.ts');
  });

  it('should allow implementing CaptureStrategy interface', () => {
    // Type-level test - verifies the interface is correctly defined
    const mockStrategy: CaptureStrategy<string> = {
      name: 'mock-strategy',
      maxSize: 1024,
      capture: async () => 'captured',
    };
    expect(mockStrategy.name).toBe('mock-strategy');
    expect(mockStrategy.maxSize).toBe(1024);
  });

  it('should allow SyntheticScreenshotCapture with all fields', () => {
    const capture: SyntheticScreenshotCapture = {
      imageData: 'data:image/png;base64,...',
      dimensions: { width: 800, height: 600 },
      errorLocation: { x: 100, y: 200, selector: '#error-element' },
      maskedElements: ['.sensitive-data', '#password-field'],
      capturedAt: new Date().toISOString(),
    };
    expect(capture.imageData).toBeDefined();
    expect(capture.dimensions.width).toBe(800);
    expect(capture.maskedElements).toHaveLength(2);
  });
});
