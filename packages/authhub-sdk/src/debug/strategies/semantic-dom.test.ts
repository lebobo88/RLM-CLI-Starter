/**
 * Tests for Semantic DOM Capture Strategy
 * @task TASK-567, TASK-568
 * @feature FTR-119
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SemanticDOMStrategy, MAX_DEPTH, EXCLUDED_TAGS, SAFE_ATTRIBUTES, PII_PATTERNS } from './semantic-dom.js';

// Mock DOM environment
const createMockElement = (overrides: Partial<HTMLElement> = {}): HTMLElement => ({
  tagName: 'DIV',
  id: '',
  className: '',
  attributes: [] as unknown as NamedNodeMap,
  children: [] as unknown as HTMLCollection,
  getAttribute: () => null,
  ...overrides,
} as unknown as HTMLElement);

const mockDocument = {
  body: createMockElement({
    tagName: 'BODY',
  }),
  activeElement: null as Element | null,
  getElementById: () => null,
  querySelector: () => null,
};

const mockWindow = {
  scrollX: 100,
  scrollY: 200,
  innerWidth: 1920,
  innerHeight: 1080,
};

describe('SemanticDOMStrategy', () => {
  let strategy: SemanticDOMStrategy;
  let originalDocument: typeof globalThis.document;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    strategy = new SemanticDOMStrategy();
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;
    // @ts-expect-error - mocking globals
    globalThis.document = mockDocument;
    // @ts-expect-error - mocking globals
    globalThis.window = mockWindow;
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  });

  describe('constructor', () => {
    it('should have correct name', () => {
      expect(strategy.name).toBe('semantic_dom');
    });

    it('should have 5KB max size', () => {
      expect(strategy.maxSize).toBe(5120);
    });
  });

  describe('capture()', () => {
    it('should return SemanticDOMCapture structure', async () => {
      const result = await strategy.capture();

      expect(result).toHaveProperty('rootElement');
      expect(result).toHaveProperty('scrollPosition');
      expect(result).toHaveProperty('viewportSize');
      expect(result).toHaveProperty('capturedAt');
    });

    it('should capture scroll position', async () => {
      const result = await strategy.capture();

      expect(result.scrollPosition.x).toBe(100);
      expect(result.scrollPosition.y).toBe(200);
    });

    it('should capture viewport size', async () => {
      const result = await strategy.capture();

      expect(result.viewportSize.width).toBe(1920);
      expect(result.viewportSize.height).toBe(1080);
    });

    it('should have ISO timestamp', async () => {
      const result = await strategy.capture();

      expect(result.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return undefined activeElement when body is focused', async () => {
      mockDocument.activeElement = mockDocument.body;
      const result = await strategy.capture();

      expect(result.activeElement).toBeUndefined();
    });

    it('should throw error when document is undefined', async () => {
      // @ts-expect-error - mocking globals
      globalThis.document = undefined;

      await expect(strategy.capture()).rejects.toThrow('SemanticDOMStrategy requires a DOM environment');
    });
  });

  describe('constants', () => {
    it('should have MAX_DEPTH of 10', () => {
      expect(MAX_DEPTH).toBe(10);
    });

    it('should exclude script, style, iframe tags', () => {
      expect(EXCLUDED_TAGS.has('script')).toBe(true);
      expect(EXCLUDED_TAGS.has('style')).toBe(true);
      expect(EXCLUDED_TAGS.has('iframe')).toBe(true);
    });

    it('should exclude noscript, svg, template tags', () => {
      expect(EXCLUDED_TAGS.has('noscript')).toBe(true);
      expect(EXCLUDED_TAGS.has('svg')).toBe(true);
      expect(EXCLUDED_TAGS.has('template')).toBe(true);
    });

    it('should exclude link and meta tags', () => {
      expect(EXCLUDED_TAGS.has('link')).toBe(true);
      expect(EXCLUDED_TAGS.has('meta')).toBe(true);
    });

    it('should only allow safe attributes', () => {
      expect(SAFE_ATTRIBUTES.has('id')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('class')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('role')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('data-testid')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('data-component')).toBe(true);
    });

    it('should allow form-related safe attributes', () => {
      expect(SAFE_ATTRIBUTES.has('type')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('name')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('placeholder')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('disabled')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('readonly')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('required')).toBe(true);
    });

    it('should allow ARIA attributes', () => {
      expect(SAFE_ATTRIBUTES.has('aria-label')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('aria-describedby')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('aria-expanded')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('aria-selected')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('aria-hidden')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('aria-haspopup')).toBe(true);
      expect(SAFE_ATTRIBUTES.has('aria-controls')).toBe(true);
    });

    it('should NOT allow potentially unsafe attributes', () => {
      // Value can contain PII
      expect(SAFE_ATTRIBUTES.has('value')).toBe(false);
      // href can contain sensitive URLs
      expect(SAFE_ATTRIBUTES.has('href')).toBe(false);
      // src can contain sensitive URLs
      expect(SAFE_ATTRIBUTES.has('src')).toBe(false);
      // onclick can contain code
      expect(SAFE_ATTRIBUTES.has('onclick')).toBe(false);
    });
  });

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

  describe('PII Filtering', () => {
    it('should detect email patterns as PII', () => {
      expect(PII_PATTERNS.some(p => p.test('test@example.com'))).toBe(true);
      expect(PII_PATTERNS.some(p => p.test('user.name+tag@domain.co.uk'))).toBe(true);
    });

    it('should detect phone patterns as PII', () => {
      expect(PII_PATTERNS.some(p => p.test('555-123-4567'))).toBe(true);
      expect(PII_PATTERNS.some(p => p.test('555.123.4567'))).toBe(true);
      expect(PII_PATTERNS.some(p => p.test('5551234567'))).toBe(true);
    });

    it('should detect credit card patterns as PII', () => {
      expect(PII_PATTERNS.some(p => p.test('4111-1111-1111-1111'))).toBe(true);
      expect(PII_PATTERNS.some(p => p.test('4111 1111 1111 1111'))).toBe(true);
      expect(PII_PATTERNS.some(p => p.test('4111111111111111'))).toBe(true);
    });

    it('should not flag normal values as PII', () => {
      expect(PII_PATTERNS.some(p => p.test('my-button'))).toBe(false);
      expect(PII_PATTERNS.some(p => p.test('container primary'))).toBe(false);
      expect(PII_PATTERNS.some(p => p.test('submit-form'))).toBe(false);
      expect(PII_PATTERNS.some(p => p.test('user-profile'))).toBe(false);
    });

    it('should not flag short numeric strings as PII', () => {
      expect(PII_PATTERNS.some(p => p.test('123'))).toBe(false);
      expect(PII_PATTERNS.some(p => p.test('12345'))).toBe(false);
    });
  });
});
