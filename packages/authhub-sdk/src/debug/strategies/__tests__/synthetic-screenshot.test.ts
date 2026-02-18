/**
 * Tests for Synthetic Screenshot Capture Strategy
 * @task TASK-574
 * @feature FTR-120
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SyntheticScreenshotStrategy,
  MASK_SELECTORS,
  MASK_VALUE,
} from '../synthetic-screenshot.js';
import type { CaptureContext, SyntheticScreenshotCapture } from '../types.js';

// Mock dom-to-image-more
vi.mock('dom-to-image-more', () => ({
  default: {
    toPng: vi.fn().mockResolvedValue('data:image/png;base64,TEST'),
  },
}));

// ---------------------------------------------------------------------------
// DOM mock helpers
// ---------------------------------------------------------------------------

const createMockElement = (overrides: Partial<HTMLElement> = {}): HTMLElement =>
  ({
    tagName: 'DIV',
    id: '',
    className: '',
    value: '',
    dataset: {},
    getBoundingClientRect: () => ({
      x: 100,
      y: 200,
      width: 300,
      height: 150,
      top: 200,
      left: 100,
      right: 400,
      bottom: 350,
    }),
    querySelectorAll: () => [],
    getAttribute: () => null,
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    ...overrides,
  }) as unknown as HTMLElement;

/**
 * Creates a mock input element whose `value` property can be spied on.
 * The `valueSpy` callback is invoked every time `.value` is set, allowing
 * tests to record intermediate masking values that would otherwise be
 * overwritten by the restore step.
 */
const createSpyableInput = (
  type: string,
  initialValue: string,
  opts: { id?: string; className?: string } = {},
) => {
  const dataset: Record<string, string> = {};
  let currentValue = initialValue;
  const valueLog: string[] = [];

  const input = {
    tagName: 'INPUT',
    type,
    dataset,
    id: opts.id ?? '',
    className: opts.className ?? '',
    getAttribute: (attr: string) => (attr === 'type' ? type : null),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    hasAttribute: () => false,
  } as unknown as Record<string, unknown>;

  // Use a real getter/setter so we can track every write
  Object.defineProperty(input, 'value', {
    get: () => currentValue,
    set: (v: string) => {
      valueLog.push(v);
      currentValue = v;
    },
    configurable: true,
  });

  return {
    element: input as unknown as HTMLInputElement,
    /** All values that were ever assigned to `.value` in order */
    valueLog,
    /** Current value (same as element.value) */
    get currentValue() {
      return currentValue;
    },
  };
};

/**
 * Creates a spyable textarea element.
 */
const createSpyableTextarea = (
  initialValue: string,
  opts: { id?: string } = {},
) => {
  const dataset: Record<string, string> = {};
  let currentValue = initialValue;
  const valueLog: string[] = [];

  const el = {
    tagName: 'TEXTAREA',
    dataset,
    id: opts.id ?? '',
    className: '',
    getAttribute: () => null,
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    hasAttribute: () => false,
  } as unknown as Record<string, unknown>;

  Object.defineProperty(el, 'value', {
    get: () => currentValue,
    set: (v: string) => {
      valueLog.push(v);
      currentValue = v;
    },
    configurable: true,
  });

  return {
    element: el as unknown as HTMLTextAreaElement,
    valueLog,
    get currentValue() {
      return currentValue;
    },
  };
};

/**
 * Creates a spyable element with a custom data-attribute (e.g. [data-sensitive]).
 */
const createSpyableAttributeElement = (
  tagName: string,
  attributeName: string,
  initialValue: string,
  opts: { id?: string } = {},
) => {
  const dataset: Record<string, string> = {};
  let currentValue = initialValue;
  const valueLog: string[] = [];

  const el = {
    tagName,
    dataset,
    id: opts.id ?? '',
    className: '',
    getAttribute: (attr: string) => (attr === attributeName ? '' : null),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    hasAttribute: (attr: string) => attr === attributeName,
  } as unknown as Record<string, unknown>;

  Object.defineProperty(el, 'value', {
    get: () => currentValue,
    set: (v: string) => {
      valueLog.push(v);
      currentValue = v;
    },
    configurable: true,
  });

  return {
    element: el as unknown as HTMLElement,
    valueLog,
    get currentValue() {
      return currentValue;
    },
  };
};

// ---------------------------------------------------------------------------
// Shared mock document / window
// ---------------------------------------------------------------------------

const mockDocument = {
  body: createMockElement({
    tagName: 'BODY',
    scrollHeight: 1080,
  } as Partial<HTMLElement>),
  documentElement: createMockElement({
    tagName: 'HTML',
    scrollWidth: 1920,
    scrollHeight: 1080,
  } as Partial<HTMLElement>),
  querySelectorAll: vi.fn().mockReturnValue([]),
  querySelector: () => null,
};

const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SyntheticScreenshotStrategy', () => {
  let strategy: SyntheticScreenshotStrategy;
  let originalDocument: typeof globalThis.document;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    strategy = new SyntheticScreenshotStrategy();
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;
    // @ts-expect-error - mocking globals
    globalThis.document = mockDocument;
    // @ts-expect-error - mocking globals
    globalThis.window = mockWindow;
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  });

  // -------------------------------------------------------------------------
  // Constructor / identity
  // -------------------------------------------------------------------------

  describe('constructor', () => {
    it('should have correct name', () => {
      expect(strategy.name).toBe('synthetic_screenshot');
    });

    it('should have 15KB max size', () => {
      expect(strategy.maxSize).toBe(15360);
    });
  });

  // -------------------------------------------------------------------------
  // MASK_SELECTORS constant
  // -------------------------------------------------------------------------

  describe('MASK_SELECTORS constant', () => {
    it('should be exported and non-empty', () => {
      expect(MASK_SELECTORS).toBeDefined();
      expect(MASK_SELECTORS.length).toBeGreaterThan(0);
    });

    it('should include password inputs', () => {
      expect(MASK_SELECTORS).toContain('input[type="password"]');
    });

    it('should include email inputs', () => {
      expect(MASK_SELECTORS).toContain('input[type="email"]');
    });

    it('should include tel inputs', () => {
      expect(MASK_SELECTORS).toContain('input[type="tel"]');
    });

    it('should include text inputs', () => {
      expect(MASK_SELECTORS).toContain('input[type="text"]');
    });

    it('should include number inputs', () => {
      expect(MASK_SELECTORS).toContain('input[type="number"]');
    });

    it('should include textarea', () => {
      expect(MASK_SELECTORS).toContain('textarea');
    });

    it('should include [data-sensitive] elements', () => {
      expect(MASK_SELECTORS).toContain('[data-sensitive]');
    });

    it('should include [data-pii] elements', () => {
      expect(MASK_SELECTORS).toContain('[data-pii]');
    });
  });

  // -------------------------------------------------------------------------
  // MASK_VALUE constant
  // -------------------------------------------------------------------------

  describe('MASK_VALUE constant', () => {
    it('should equal 8 bullet characters', () => {
      expect(MASK_VALUE).toBe('\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022');
    });

    it('should have exactly 8 characters', () => {
      expect(MASK_VALUE.length).toBe(8);
    });
  });

  // -------------------------------------------------------------------------
  // CaptureStrategy interface conformance
  // -------------------------------------------------------------------------

  describe('CaptureStrategy interface', () => {
    it('should implement CaptureStrategy interface', () => {
      expect(typeof strategy.name).toBe('string');
      expect(typeof strategy.maxSize).toBe('number');
      expect(typeof strategy.capture).toBe('function');
    });

    it('should return a Promise from capture()', () => {
      const result = strategy.capture();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  // -------------------------------------------------------------------------
  // capture() return structure
  // -------------------------------------------------------------------------

  describe('capture() return structure', () => {
    it('should return valid SyntheticScreenshotCapture structure', async () => {
      const result = await strategy.capture();

      expect(result).toHaveProperty('imageData');
      expect(result).toHaveProperty('dimensions');
      expect(result).toHaveProperty('maskedElements');
      expect(result).toHaveProperty('capturedAt');
    });

    it('should return base64 image data without data URL prefix', async () => {
      const result = await strategy.capture();

      expect(result.imageData).toBe('TEST');
      expect(result.imageData).not.toContain('data:image/png;base64,');
    });

    it('should capture dimensions matching viewport', async () => {
      const result = await strategy.capture();

      expect(result.dimensions.width).toBe(1920);
      expect(result.dimensions.height).toBe(1080);
    });

    it('should return maskedElements as an array', async () => {
      const result = await strategy.capture();

      expect(Array.isArray(result.maskedElements)).toBe(true);
    });

    it('should have ISO timestamp for capturedAt', async () => {
      const result = await strategy.capture();

      expect(result.capturedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
      );
    });
  });

  // -------------------------------------------------------------------------
  // Masking is applied to all input types
  // -------------------------------------------------------------------------

  describe('masking all input types', () => {
    it('should mask password input values to MASK_VALUE during capture', async () => {
      const spy = createSpyableInput('password', 'secret123', { id: 'pwd' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      // The first write should be the mask value
      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      // After capture, the original should be restored
      expect(spy.currentValue).toBe('secret123');
    });

    it('should mask email input values to MASK_VALUE during capture', async () => {
      const spy = createSpyableInput('email', 'user@example.com', {
        id: 'email-field',
      });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      expect(spy.currentValue).toBe('user@example.com');
    });

    it('should mask tel input values to MASK_VALUE during capture', async () => {
      const spy = createSpyableInput('tel', '+1-555-0100', { id: 'phone' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      expect(spy.currentValue).toBe('+1-555-0100');
    });

    it('should mask text input values to MASK_VALUE during capture', async () => {
      const spy = createSpyableInput('text', 'John Doe', { id: 'name' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      expect(spy.currentValue).toBe('John Doe');
    });

    it('should mask number input values to MASK_VALUE during capture', async () => {
      const spy = createSpyableInput('number', '42', { id: 'age' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      expect(spy.currentValue).toBe('42');
    });

    it('should mask textarea values to MASK_VALUE during capture', async () => {
      const spy = createSpyableTextarea('Private notes here', { id: 'notes' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      expect(spy.currentValue).toBe('Private notes here');
    });

    it('should not mask inputs with empty values', async () => {
      const spy = createSpyableInput('text', '', { id: 'empty' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      const result = await strategy.capture();

      // No writes should occur because value is empty
      expect(spy.valueLog.length).toBe(0);
      expect(result.maskedElements).not.toContain('#empty');
    });

    it('should mask multiple inputs in a single capture', async () => {
      const pwd = createSpyableInput('password', 'secret', { id: 'pwd' });
      const email = createSpyableInput('email', 'a@b.com', { id: 'email' });
      const text = createSpyableInput('text', 'name', { id: 'name' });
      mockDocument.querySelectorAll.mockReturnValue([
        pwd.element,
        email.element,
        text.element,
      ]);

      const result = await strategy.capture();

      // All three should have been masked
      expect(pwd.valueLog[0]).toBe(MASK_VALUE);
      expect(email.valueLog[0]).toBe(MASK_VALUE);
      expect(text.valueLog[0]).toBe(MASK_VALUE);

      // All three should be restored
      expect(pwd.currentValue).toBe('secret');
      expect(email.currentValue).toBe('a@b.com');
      expect(text.currentValue).toBe('name');

      // maskedElements should list all three selectors
      expect(result.maskedElements).toHaveLength(3);
    });
  });

  // -------------------------------------------------------------------------
  // Custom mask selector support: [data-sensitive] and [data-pii]
  // -------------------------------------------------------------------------

  describe('custom mask selector support', () => {
    it('should mask [data-sensitive] elements during capture', async () => {
      const spy = createSpyableAttributeElement(
        'SPAN',
        'data-sensitive',
        'SSN: 123-45-6789',
        { id: 'ssn' },
      );
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      const result = await strategy.capture();

      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      expect(spy.currentValue).toBe('SSN: 123-45-6789');
      expect(result.maskedElements).toContain('#ssn');
    });

    it('should mask [data-pii] elements during capture', async () => {
      const spy = createSpyableAttributeElement(
        'DIV',
        'data-pii',
        'CC: 4111-1111-1111-1111',
        { id: 'cc' },
      );
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      const result = await strategy.capture();

      expect(spy.valueLog[0]).toBe(MASK_VALUE);
      expect(spy.currentValue).toBe('CC: 4111-1111-1111-1111');
      expect(result.maskedElements).toContain('#cc');
    });
  });

  // -------------------------------------------------------------------------
  // Restoration after capture
  // -------------------------------------------------------------------------

  describe('restoration after capture', () => {
    it('should restore all masked values after successful capture', async () => {
      const pwd = createSpyableInput('password', 'pass1', { id: 'p1' });
      const email = createSpyableInput('email', 'e@e.com', { id: 'e1' });
      mockDocument.querySelectorAll.mockReturnValue([
        pwd.element,
        email.element,
      ]);

      await strategy.capture();

      expect(pwd.currentValue).toBe('pass1');
      expect(email.currentValue).toBe('e@e.com');
    });

    it('should clean up dataset.__originalValue after restore', async () => {
      const spy = createSpyableInput('password', 'mypass', { id: 'p' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      // After restore, the dataset backup key should be deleted
      expect(
        (spy.element.dataset as Record<string, string>).__originalValue,
      ).toBeUndefined();
    });

    it('should write exactly two values per masked element (mask then restore)', async () => {
      const spy = createSpyableInput('text', 'hello', { id: 't' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      // First write = mask, second write = restore
      expect(spy.valueLog).toEqual([MASK_VALUE, 'hello']);
    });
  });

  // -------------------------------------------------------------------------
  // Restoration on error
  // -------------------------------------------------------------------------

  describe('restoration on error', () => {
    it('should restore values even when dom-to-image throws', async () => {
      const domToImage = await import('dom-to-image-more');
      vi.mocked(domToImage.default.toPng).mockRejectedValueOnce(
        new Error('Canvas render failed'),
      );

      const spy = createSpyableInput('password', 'important-secret', {
        id: 'secret',
      });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await expect(strategy.capture()).rejects.toThrow('Canvas render failed');

      // The value should still be restored by the finally block
      expect(spy.currentValue).toBe('important-secret');
    });

    it('should restore multiple elements on error', async () => {
      const domToImage = await import('dom-to-image-more');
      vi.mocked(domToImage.default.toPng).mockRejectedValueOnce(
        new Error('Failed'),
      );

      const a = createSpyableInput('email', 'a@a.com', { id: 'a' });
      const b = createSpyableTextarea('notes', { id: 'b' });
      mockDocument.querySelectorAll.mockReturnValue([a.element, b.element]);

      try {
        await strategy.capture();
      } catch {
        // expected
      }

      expect(a.currentValue).toBe('a@a.com');
      expect(b.currentValue).toBe('notes');
    });

    it('should clean up dataset backup on error', async () => {
      const domToImage = await import('dom-to-image-more');
      vi.mocked(domToImage.default.toPng).mockRejectedValueOnce(
        new Error('Boom'),
      );

      const spy = createSpyableInput('text', 'data', { id: 'x' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      try {
        await strategy.capture();
      } catch {
        // expected
      }

      expect(
        (spy.element.dataset as Record<string, string>).__originalValue,
      ).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Dimension limits
  // -------------------------------------------------------------------------

  describe('dimension limits', () => {
    it('should clamp width to a maximum of 1920px', async () => {
      const domToImage = await import('dom-to-image-more');
      // Set viewport wider than 1920
      Object.assign(mockWindow, { innerWidth: 3840 });

      await strategy.capture();

      const callArgs = vi.mocked(domToImage.default.toPng).mock.calls[0];
      expect(callArgs).toBeDefined();
      const options = callArgs[1] as Record<string, unknown>;
      expect(options.width).toBe(1920);

      // Restore
      Object.assign(mockWindow, { innerWidth: 1920 });
    });

    it('should use viewport width when less than 1920', async () => {
      const domToImage = await import('dom-to-image-more');
      Object.assign(mockWindow, { innerWidth: 1024 });

      await strategy.capture();

      const callArgs = vi.mocked(domToImage.default.toPng).mock.calls[0];
      const options = callArgs[1] as Record<string, unknown>;
      expect(options.width).toBe(1024);

      Object.assign(mockWindow, { innerWidth: 1920 });
    });

    it('should clamp height to a maximum of 4000px', async () => {
      const domToImage = await import('dom-to-image-more');
      // Make body scrollHeight very large
      Object.defineProperty(mockDocument.body, 'scrollHeight', {
        value: 10000,
        configurable: true,
      });

      await strategy.capture();

      const callArgs = vi.mocked(domToImage.default.toPng).mock.calls[0];
      const options = callArgs[1] as Record<string, unknown>;
      expect(options.height).toBe(4000);

      // Restore
      Object.defineProperty(mockDocument.body, 'scrollHeight', {
        value: 1080,
        configurable: true,
      });
    });

    it('should use scroll height when less than 4000', async () => {
      const domToImage = await import('dom-to-image-more');
      Object.defineProperty(mockDocument.body, 'scrollHeight', {
        value: 2000,
        configurable: true,
      });

      await strategy.capture();

      const callArgs = vi.mocked(domToImage.default.toPng).mock.calls[0];
      const options = callArgs[1] as Record<string, unknown>;
      expect(options.height).toBe(2000);

      Object.defineProperty(mockDocument.body, 'scrollHeight', {
        value: 1080,
        configurable: true,
      });
    });

    it('should pass bgcolor #ffffff to dom-to-image', async () => {
      const domToImage = await import('dom-to-image-more');
      await strategy.capture();

      const callArgs = vi.mocked(domToImage.default.toPng).mock.calls[0];
      const options = callArgs[1] as Record<string, unknown>;
      expect(options.bgcolor).toBe('#ffffff');
    });
  });

  // -------------------------------------------------------------------------
  // Quality settings
  // -------------------------------------------------------------------------

  describe('quality settings', () => {
    it('should use quality 0.6 for size control', async () => {
      const domToImage = await import('dom-to-image-more');
      await strategy.capture();

      const callArgs = vi.mocked(domToImage.default.toPng).mock.calls[0];
      expect(callArgs).toBeDefined();
      const options = callArgs[1] as Record<string, unknown>;
      expect(options.quality).toBe(0.6);
    });
  });

  // -------------------------------------------------------------------------
  // Error location / selector generation
  // -------------------------------------------------------------------------

  describe('error location', () => {
    it('should calculate errorLocation when context.element provided', async () => {
      const errorElement = createMockElement({
        id: 'error-button',
        className: 'btn-danger',
      });

      const context: CaptureContext = {
        element: errorElement,
        error: new Error('Test error'),
      };

      const result = await strategy.capture(context);

      expect(result.errorLocation).toBeDefined();
      expect(result.errorLocation?.x).toBe(100);
      expect(result.errorLocation?.y).toBe(200);
      expect(result.errorLocation?.selector).toBe('#error-button');
    });

    it('should return undefined errorLocation when no context', async () => {
      const result = await strategy.capture();
      expect(result.errorLocation).toBeUndefined();
    });

    it('should return undefined errorLocation when context has no element', async () => {
      const context: CaptureContext = { error: new Error('no element') };
      const result = await strategy.capture(context);
      expect(result.errorLocation).toBeUndefined();
    });
  });

  describe('selector generation', () => {
    it('should generate selector with id if available', async () => {
      const el = createMockElement({ id: 'submit-btn', tagName: 'BUTTON' });
      const result = await strategy.capture({ element: el });
      expect(result.errorLocation?.selector).toBe('#submit-btn');
    });

    it('should generate selector with class if no id', async () => {
      const el = createMockElement({
        id: '',
        className: 'btn primary',
        tagName: 'BUTTON',
      });
      const result = await strategy.capture({ element: el });
      expect(result.errorLocation?.selector).toBe('button.btn.primary');
    });

    it('should fallback to tag name when no id or classes', async () => {
      const el = createMockElement({
        id: '',
        className: '',
        tagName: 'BUTTON',
      });
      const result = await strategy.capture({ element: el });
      expect(result.errorLocation?.selector).toBe('button');
    });
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  describe('error handling', () => {
    it('should propagate dom-to-image errors', async () => {
      const domToImage = await import('dom-to-image-more');
      vi.mocked(domToImage.default.toPng).mockRejectedValueOnce(
        new Error('Capture failed'),
      );

      await expect(strategy.capture()).rejects.toThrow('Capture failed');
    });

    it('should throw when document is undefined', async () => {
      // @ts-expect-error - mocking globals
      globalThis.document = undefined;

      await expect(strategy.capture()).rejects.toThrow(
        'SyntheticScreenshotStrategy requires a DOM environment',
      );
    });
  });

  // -------------------------------------------------------------------------
  // Masked elements in result
  // -------------------------------------------------------------------------

  describe('masked elements in result', () => {
    it('should return selectors for all masked elements', async () => {
      const pwd = createSpyableInput('password', 'secret', { id: 'pw' });
      const email = createSpyableInput('email', 'e@e.com', { id: 'em' });
      mockDocument.querySelectorAll.mockReturnValue([
        pwd.element,
        email.element,
      ]);

      const result = await strategy.capture();

      expect(result.maskedElements).toContain('#pw');
      expect(result.maskedElements).toContain('#em');
      expect(result.maskedElements).toHaveLength(2);
    });

    it('should return empty maskedElements when no inputs found', async () => {
      mockDocument.querySelectorAll.mockReturnValue([]);

      const result = await strategy.capture();

      expect(result.maskedElements).toEqual([]);
    });

    it('should use class-based selector when element has no id', async () => {
      const spy = createSpyableInput('password', 'x', {
        className: 'form-input secret',
      });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      const result = await strategy.capture();

      expect(result.maskedElements[0]).toBe('input.form-input.secret');
    });

    it('should use tag-only selector when no id or class', async () => {
      const spy = createSpyableInput('password', 'x');
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      const result = await strategy.capture();

      expect(result.maskedElements[0]).toBe('input');
    });
  });

  // -------------------------------------------------------------------------
  // Dataset backup during masking
  // -------------------------------------------------------------------------

  describe('dataset backup', () => {
    it('should store original value in dataset.__originalValue during masking', async () => {
      // We intercept the toPng call to check the element state mid-capture
      const domToImage = await import('dom-to-image-more');
      let datasetDuringCapture: string | undefined;

      vi.mocked(domToImage.default.toPng).mockImplementationOnce(
        async () => {
          // At this point, masking has occurred but restore has not
          datasetDuringCapture = (spy.element.dataset as Record<string, string>).__originalValue;
          return 'data:image/png;base64,SNAPSHOT';
        },
      );

      const spy = createSpyableInput('password', 'original-pw', { id: 'ds' });
      mockDocument.querySelectorAll.mockReturnValue([spy.element]);

      await strategy.capture();

      expect(datasetDuringCapture).toBe('original-pw');
      // After capture, it should be cleaned up
      expect(
        (spy.element.dataset as Record<string, string>).__originalValue,
      ).toBeUndefined();
    });
  });
});
