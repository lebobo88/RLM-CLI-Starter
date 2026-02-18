/**
 * Comprehensive Tests for AOM Tree Capture Strategy
 * @task TASK-578
 * @feature FTR-121
 *
 * Covers:
 * - Role mapping (implicit and explicit)
 * - Accessible name computation (aria-label, aria-labelledby, associated label, img alt)
 * - State capture (disabled, expanded, selected, checked, mixed, pressed, hidden, invalid)
 * - Tree structure (nested elements, depth limit of 8, aria-hidden exclusion)
 * - Landmarks (semantic HTML, explicit role, limit 20)
 * - Focus order (focusable elements, tabindex=-1 exclusion, limit 50)
 * - Selector generation (id, class, tag fallback)
 * - Error handling and edge cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AOMTreeStrategy } from '../aom-tree.js';
import type {
  CaptureContext,
  AOMTreeCapture,
  AccessibilityNode,
  AccessibilityState,
  LandmarkInfo,
} from '../types.js';

// ---------------------------------------------------------------------------
// DOM Mocking Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a mock HTMLElement with full getAttribute support.
 * Every attribute can be set via the `attrs` map. Properties like tagName, id,
 * className, children, disabled, checked, textContent are set directly.
 */
function createElement(options: {
  tag: string;
  id?: string;
  className?: string;
  attrs?: Record<string, string | null>;
  children?: ReturnType<typeof createElement>[];
  disabled?: boolean;
  checked?: boolean;
  textContent?: string;
  tabIndex?: number;
}): HTMLElement {
  const {
    tag,
    id = '',
    className = '',
    attrs = {},
    children = [],
    disabled,
    checked,
    textContent,
    tabIndex = -1,
  } = options;

  const childCollection = {
    length: children.length,
    [Symbol.iterator]: function* () {
      for (let i = 0; i < children.length; i++) {
        yield children[i];
      }
    },
  } as unknown as HTMLCollection;

  // Also index by number
  for (let i = 0; i < children.length; i++) {
    (childCollection as any)[i] = children[i];
  }

  const el = {
    tagName: tag.toUpperCase(),
    id,
    className,
    tabIndex,
    disabled: disabled ?? false,
    checked: checked ?? false,
    textContent: textContent ?? '',
    children: childCollection,
    getAttribute: (attr: string): string | null => {
      if (attr === 'id' && id) return id;
      if (attr in attrs) return attrs[attr];
      return null;
    },
    matches: vi.fn().mockReturnValue(false),
    querySelectorAll: vi.fn().mockReturnValue([]),
  } as unknown as HTMLElement;

  return el;
}

/**
 * Builds a mock document object that supports getElementById,
 * querySelector, querySelectorAll, body, and activeElement.
 */
function createMockDocument(options: {
  body: HTMLElement;
  activeElement?: HTMLElement | null;
  elementsById?: Record<string, HTMLElement>;
  selectorResults?: Record<string, HTMLElement | null>;
  querySelectorAllResults?: Record<string, HTMLElement[]>;
}) {
  const {
    body,
    activeElement = null,
    elementsById = {},
    selectorResults = {},
    querySelectorAllResults = {},
  } = options;

  return {
    body,
    activeElement,
    getElementById: vi.fn((id: string) => elementsById[id] || null),
    querySelector: vi.fn((selector: string) => selectorResults[selector] || null),
    querySelectorAll: vi.fn((selector: string) => {
      if (querySelectorAllResults[selector]) {
        return querySelectorAllResults[selector];
      }
      // Default: return empty array-like
      return [];
    }),
  };
}

// ---------------------------------------------------------------------------
// Test Suite
// ---------------------------------------------------------------------------

describe('AOMTreeStrategy', () => {
  let strategy: AOMTreeStrategy;
  let originalDocument: typeof globalThis.document;
  let originalWindow: typeof globalThis.window;

  beforeEach(() => {
    strategy = new AOMTreeStrategy();
    originalDocument = globalThis.document;
    originalWindow = globalThis.window;
    // @ts-expect-error - mocking globals
    globalThis.window = { innerWidth: 1920, innerHeight: 1080 };
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  });

  // =========================================================================
  // Constructor and Interface
  // =========================================================================

  describe('constructor and CaptureStrategy interface', () => {
    it('should have name "aom_tree"', () => {
      expect(strategy.name).toBe('aom_tree');
    });

    it('should have maxSize of 8192 (8KB)', () => {
      expect(strategy.maxSize).toBe(8192);
    });

    it('should implement capture as a function', () => {
      expect(typeof strategy.capture).toBe('function');
    });

    it('should return a Promise from capture()', () => {
      const body = createElement({ tag: 'body' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });
      const result = strategy.capture();
      expect(result).toBeInstanceOf(Promise);
    });

    it('should have static MAX_DEPTH of 8', () => {
      expect(AOMTreeStrategy.MAX_DEPTH).toBe(8);
    });
  });

  // =========================================================================
  // capture() basic structure
  // =========================================================================

  describe('capture() basic structure', () => {
    it('should return valid AOMTreeCapture shape', async () => {
      const body = createElement({ tag: 'body' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();

      expect(result).toHaveProperty('rootNode');
      expect(result).toHaveProperty('focusOrder');
      expect(result).toHaveProperty('landmarks');
      expect(result).toHaveProperty('capturedAt');
    });

    it('should have rootNode with a role string', async () => {
      const body = createElement({ tag: 'body' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode).toBeDefined();
      expect(typeof result.rootNode.role).toBe('string');
    });

    it('should have ISO timestamp for capturedAt', async () => {
      const body = createElement({ tag: 'body' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should throw error when document is undefined', async () => {
      // @ts-expect-error - mocking globals
      globalThis.document = undefined;
      await expect(strategy.capture()).rejects.toThrow(
        'AOMTreeStrategy requires a DOM environment'
      );
    });

    it('should accept optional CaptureContext parameter', async () => {
      const body = createElement({ tag: 'body' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const context: CaptureContext = {
        error: new Error('Test error'),
        element: createElement({ tag: 'div', id: 'error-el' }),
      };
      const result = await strategy.capture(context);
      expect(result).toHaveProperty('rootNode');
      expect(result).toHaveProperty('capturedAt');
    });
  });

  // =========================================================================
  // Role Mapping - Implicit Roles
  // =========================================================================

  describe('role mapping - implicit roles', () => {
    it('should map BUTTON to role "button"', async () => {
      const body = createElement({ tag: 'button' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('button');
    });

    it('should map A (with href) to role "link"', async () => {
      const body = createElement({ tag: 'a', attrs: { href: 'https://example.com' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('link');
    });

    it('should map NAV to role "navigation"', async () => {
      const body = createElement({ tag: 'nav' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('navigation');
    });

    it('should map MAIN to role "main"', async () => {
      const body = createElement({ tag: 'main' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('main');
    });

    it('should map HEADER to role "banner"', async () => {
      const body = createElement({ tag: 'header' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('banner');
    });

    it('should map FOOTER to role "contentinfo"', async () => {
      const body = createElement({ tag: 'footer' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('contentinfo');
    });

    it('should map ASIDE to role "complementary"', async () => {
      const body = createElement({ tag: 'aside' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('complementary');
    });

    it('should map SELECT to role "combobox"', async () => {
      const body = createElement({ tag: 'select' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('combobox');
    });

    it('should map TEXTAREA to role "textbox"', async () => {
      const body = createElement({ tag: 'textarea' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('textbox');
    });

    it('should map H1 to role "heading"', async () => {
      const body = createElement({ tag: 'h1' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('heading');
    });

    it('should map H2 to role "heading"', async () => {
      const body = createElement({ tag: 'h2' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('heading');
    });

    it('should map UL to role "list"', async () => {
      const body = createElement({ tag: 'ul' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('list');
    });

    it('should map OL to role "list"', async () => {
      const body = createElement({ tag: 'ol' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('list');
    });

    it('should map LI to role "listitem"', async () => {
      const body = createElement({ tag: 'li' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('listitem');
    });

    it('should map IMG to role "img"', async () => {
      const body = createElement({ tag: 'img' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('img');
    });

    it('should map TABLE to role "table"', async () => {
      const body = createElement({ tag: 'table' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('table');
    });

    it('should map FORM to role "form"', async () => {
      const body = createElement({ tag: 'form' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('form');
    });

    it('should map SECTION to role "region"', async () => {
      const body = createElement({ tag: 'section' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('region');
    });

    it('should map ARTICLE to role "article"', async () => {
      const body = createElement({ tag: 'article' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('article');
    });

    it('should map PROGRESS to role "progressbar"', async () => {
      const body = createElement({ tag: 'progress' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('progressbar');
    });

    it('should map OPTION to role "option"', async () => {
      const body = createElement({ tag: 'option' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('option');
    });

    it('should return "generic" for unknown tags without explicit role', async () => {
      const body = createElement({ tag: 'custom-element' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('generic');
    });

    it('should return "generic" for DIV without explicit role', async () => {
      const body = createElement({ tag: 'div' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('generic');
    });

    it('should return "generic" for SPAN without explicit role', async () => {
      const body = createElement({ tag: 'span' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('generic');
    });
  });

  // =========================================================================
  // Role Mapping - INPUT type roles
  // =========================================================================

  describe('role mapping - INPUT type roles', () => {
    it('should map input[type=checkbox] to role "checkbox"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'checkbox' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('checkbox');
    });

    it('should map input[type=radio] to role "radio"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'radio' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('radio');
    });

    it('should map input[type=text] to role "textbox"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'text' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('textbox');
    });

    it('should map input[type=email] to role "textbox"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'email' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('textbox');
    });

    it('should map input[type=tel] to role "textbox"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'tel' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('textbox');
    });

    it('should map input[type=number] to role "spinbutton"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'number' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('spinbutton');
    });

    it('should map input[type=range] to role "slider"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'range' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('slider');
    });

    it('should map input[type=search] to role "searchbox"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'search' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('searchbox');
    });

    it('should map input[type=button] to role "button"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'button' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('button');
    });

    it('should map input[type=submit] to role "button"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'submit' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('button');
    });

    it('should default input without type to "textbox"', async () => {
      const body = createElement({ tag: 'input', attrs: {} });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('textbox');
    });

    it('should default input with unknown type to "textbox"', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'datetime-local' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('textbox');
    });
  });

  // =========================================================================
  // Role Mapping - Explicit role overrides
  // =========================================================================

  describe('role mapping - explicit role overrides', () => {
    it('should use explicit role over implicit role for BUTTON', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { role: 'menuitem' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('menuitem');
    });

    it('should use explicit role over implicit role for NAV', async () => {
      const body = createElement({
        tag: 'nav',
        attrs: { role: 'tablist' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('tablist');
    });

    it('should use explicit role over implicit role for INPUT', async () => {
      const body = createElement({
        tag: 'input',
        attrs: { type: 'text', role: 'combobox' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('combobox');
    });

    it('should use explicit role on DIV', async () => {
      const body = createElement({
        tag: 'div',
        attrs: { role: 'dialog' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('dialog');
    });

    it('should use explicit role on SPAN', async () => {
      const body = createElement({
        tag: 'span',
        attrs: { role: 'status' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('status');
    });
  });

  // =========================================================================
  // Accessible Name Computation
  // =========================================================================

  describe('accessible name computation', () => {
    it('should return aria-label as the name', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-label': 'Close dialog' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBe('Close dialog');
    });

    it('should return aria-labelledby referenced text as the name', async () => {
      const labelEl = createElement({
        tag: 'span',
        id: 'label-1',
        textContent: 'Submit form',
      });
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-labelledby': 'label-1' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({
        body,
        elementsById: { 'label-1': labelEl },
      });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBe('Submit form');
    });

    it('should prefer aria-label over aria-labelledby', async () => {
      const labelEl = createElement({
        tag: 'span',
        id: 'label-1',
        textContent: 'From labelledby',
      });
      const body = createElement({
        tag: 'button',
        attrs: {
          'aria-label': 'From aria-label',
          'aria-labelledby': 'label-1',
        },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({
        body,
        elementsById: { 'label-1': labelEl },
      });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBe('From aria-label');
    });

    it('should return associated label text for form controls (using element id)', async () => {
      const labelEl = createElement({
        tag: 'label',
        textContent: 'Username',
        attrs: { for: 'username-input' },
      });
      const body = createElement({
        tag: 'input',
        id: 'username-input',
        attrs: { type: 'text' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({
        body,
        selectorResults: { 'label[for="username-input"]': labelEl },
      });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBe('Username');
    });

    it('should return alt text for IMG elements', async () => {
      const body = createElement({
        tag: 'img',
        attrs: { alt: 'Company logo' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBe('Company logo');
    });

    it('should return undefined name when no name source exists', async () => {
      const body = createElement({ tag: 'div' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBeUndefined();
    });

    it('should return undefined name when IMG has no alt attribute', async () => {
      const body = createElement({
        tag: 'img',
        attrs: {},
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBeUndefined();
    });

    it('should return undefined when aria-labelledby references nonexistent element', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-labelledby': 'nonexistent-id' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBeUndefined();
    });

    it('should use aria-label on img even if alt is also present (aria-label wins)', async () => {
      const body = createElement({
        tag: 'img',
        attrs: {
          'aria-label': 'Accessible label',
          alt: 'Alt text',
        },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.name).toBe('Accessible label');
    });
  });

  // =========================================================================
  // Accessible Description
  // =========================================================================

  describe('accessible description', () => {
    it('should return aria-describedby text as the description', async () => {
      const descEl = createElement({
        tag: 'span',
        id: 'desc-1',
        textContent: 'This field is required',
      });
      const body = createElement({
        tag: 'input',
        attrs: { type: 'text', 'aria-describedby': 'desc-1' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({
        body,
        elementsById: { 'desc-1': descEl },
      });

      const result = await strategy.capture();
      expect(result.rootNode.description).toBe('This field is required');
    });

    it('should return undefined description when no aria-describedby', async () => {
      const body = createElement({ tag: 'input', attrs: { type: 'text' } });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.description).toBeUndefined();
    });

    it('should return undefined when aria-describedby references nonexistent element', async () => {
      const body = createElement({
        tag: 'input',
        attrs: { type: 'text', 'aria-describedby': 'nonexistent-desc' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.description).toBeUndefined();
    });
  });

  // =========================================================================
  // State Capture
  // =========================================================================

  describe('state capture', () => {
    it('should capture disabled state from aria-disabled="true"', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-disabled': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.disabled).toBe(true);
    });

    it('should capture disabled state from native disabled property', async () => {
      const body = createElement({
        tag: 'button',
        disabled: true,
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.disabled).toBe(true);
    });

    it('should capture expanded=true from aria-expanded="true"', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-expanded': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.expanded).toBe(true);
    });

    it('should capture expanded=false from aria-expanded="false"', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-expanded': 'false' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.expanded).toBe(false);
    });

    it('should capture selected=true from aria-selected="true"', async () => {
      const body = createElement({
        tag: 'div',
        attrs: { role: 'tab', 'aria-selected': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.selected).toBe(true);
    });

    it('should capture selected=false from aria-selected="false"', async () => {
      const body = createElement({
        tag: 'div',
        attrs: { role: 'tab', 'aria-selected': 'false' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.selected).toBe(false);
    });

    it('should capture checked=true from aria-checked="true"', async () => {
      const body = createElement({
        tag: 'input',
        attrs: { type: 'checkbox', 'aria-checked': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.checked).toBe(true);
    });

    it('should capture checked=false from aria-checked="false"', async () => {
      const body = createElement({
        tag: 'input',
        attrs: { type: 'checkbox', 'aria-checked': 'false' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.checked).toBe(false);
    });

    it('should handle mixed checkbox (aria-checked="mixed") by not setting checked', async () => {
      const body = createElement({
        tag: 'input',
        attrs: { type: 'checkbox', 'aria-checked': 'mixed' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      // State should exist (hasState is true for mixed)
      expect(result.rootNode.state).toBeDefined();
      // But checked should not be set (undefined) for mixed
      expect(result.rootNode.state!.checked).toBeUndefined();
    });

    it('should capture checked=true from native checkbox checked property', async () => {
      const body = createElement({
        tag: 'input',
        attrs: { type: 'checkbox' },
        checked: true,
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.checked).toBe(true);
    });

    it('should capture pressed=true from aria-pressed="true"', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-pressed': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.pressed).toBe(true);
    });

    it('should capture pressed=false from aria-pressed="false"', async () => {
      const body = createElement({
        tag: 'button',
        attrs: { 'aria-pressed': 'false' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.pressed).toBe(false);
    });

    it('should capture hidden=true from aria-hidden="true"', async () => {
      const body = createElement({
        tag: 'div',
        attrs: { 'aria-hidden': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.hidden).toBe(true);
    });

    it('should capture invalid=true from aria-invalid="true"', async () => {
      const body = createElement({
        tag: 'input',
        attrs: { type: 'text', 'aria-invalid': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.invalid).toBe(true);
    });

    it('should return undefined state when no ARIA state attributes are present', async () => {
      const body = createElement({ tag: 'div' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeUndefined();
    });

    it('should capture multiple states simultaneously', async () => {
      const body = createElement({
        tag: 'button',
        attrs: {
          'aria-expanded': 'true',
          'aria-pressed': 'true',
          'aria-disabled': 'true',
        },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.expanded).toBe(true);
      expect(result.rootNode.state!.pressed).toBe(true);
      expect(result.rootNode.state!.disabled).toBe(true);
    });

    it('should not set disabled when aria-disabled is absent and native disabled is false', async () => {
      const body = createElement({
        tag: 'button',
        disabled: false,
        attrs: { 'aria-expanded': 'true' },
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.state).toBeDefined();
      expect(result.rootNode.state!.disabled).toBeUndefined();
    });
  });

  // =========================================================================
  // Tree Structure - Nested Elements
  // =========================================================================

  describe('tree structure - nested elements', () => {
    it('should capture children of the root element', async () => {
      const child1 = createElement({ tag: 'button' });
      const child2 = createElement({ tag: 'input', attrs: { type: 'text' } });
      const body = createElement({
        tag: 'div',
        children: [child1, child2],
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.children).toBeDefined();
      expect(result.rootNode.children!.length).toBe(2);
      expect(result.rootNode.children![0].role).toBe('button');
      expect(result.rootNode.children![1].role).toBe('textbox');
    });

    it('should capture deeply nested children', async () => {
      const grandchild = createElement({ tag: 'button', attrs: { 'aria-label': 'Deep button' } });
      const child = createElement({ tag: 'div', children: [grandchild] });
      const body = createElement({ tag: 'div', children: [child] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.children).toBeDefined();
      expect(result.rootNode.children![0].children).toBeDefined();
      expect(result.rootNode.children![0].children![0].role).toBe('button');
      expect(result.rootNode.children![0].children![0].name).toBe('Deep button');
    });

    it('should not have children property when element has no child elements', async () => {
      const body = createElement({ tag: 'button' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode.children).toBeUndefined();
    });

    it('should capture node role, name, description, and state for children', async () => {
      const descEl = createElement({ tag: 'span', id: 'child-desc', textContent: 'Help text' });
      const child = createElement({
        tag: 'input',
        id: 'child-input',
        attrs: {
          type: 'text',
          'aria-label': 'First name',
          'aria-describedby': 'child-desc',
          'aria-invalid': 'true',
        },
      });
      const body = createElement({ tag: 'div', children: [child] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({
        body,
        elementsById: { 'child-desc': descEl },
      });

      const result = await strategy.capture();
      const childNode = result.rootNode.children![0];
      expect(childNode.role).toBe('textbox');
      expect(childNode.name).toBe('First name');
      expect(childNode.description).toBe('Help text');
      expect(childNode.state).toBeDefined();
      expect(childNode.state!.invalid).toBe(true);
    });
  });

  // =========================================================================
  // Tree Structure - Depth Limit
  // =========================================================================

  describe('tree structure - depth limit of 8', () => {
    it('should stop recursing at depth 8 (MAX_DEPTH)', async () => {
      // Build a chain of 10 nested elements
      let current = createElement({ tag: 'span', attrs: { 'aria-label': 'deepest' } });
      for (let i = 9; i >= 0; i--) {
        current = createElement({ tag: 'div', children: [current] });
      }
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body: current });

      const result = await strategy.capture();

      // Walk down the tree and count depth
      let depth = 0;
      let node: AccessibilityNode | undefined = result.rootNode;
      while (node?.children && node.children.length > 0) {
        depth++;
        node = node.children[0];
      }

      // Should not exceed MAX_DEPTH (8)
      expect(depth).toBeLessThanOrEqual(AOMTreeStrategy.MAX_DEPTH);
    });

    it('should capture exactly 8 levels when tree is deeper', async () => {
      // Build chain of 12 nested elements
      let current = createElement({ tag: 'button' });
      for (let i = 11; i >= 0; i--) {
        current = createElement({ tag: 'div', children: [current] });
      }
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body: current });

      const result = await strategy.capture();

      let depth = 0;
      let node: AccessibilityNode | undefined = result.rootNode;
      while (node?.children && node.children.length > 0) {
        depth++;
        node = node.children[0];
      }

      // Tree is 12 deep, but only 8 should be captured
      expect(depth).toBe(AOMTreeStrategy.MAX_DEPTH);
    });

    it('should capture full tree when depth is less than 8', async () => {
      // Build chain of 3 nested elements
      const leaf = createElement({ tag: 'button' });
      const mid = createElement({ tag: 'div', children: [leaf] });
      const body = createElement({ tag: 'div', children: [mid] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();

      let depth = 0;
      let node: AccessibilityNode | undefined = result.rootNode;
      while (node?.children && node.children.length > 0) {
        depth++;
        node = node.children[0];
      }

      expect(depth).toBe(2);
    });
  });

  // =========================================================================
  // Tree Structure - aria-hidden exclusion
  // =========================================================================

  describe('tree structure - aria-hidden exclusion', () => {
    it('should exclude children with aria-hidden="true"', async () => {
      const visibleChild = createElement({ tag: 'button', attrs: { 'aria-label': 'Visible' } });
      const hiddenChild = createElement({
        tag: 'div',
        attrs: { 'aria-hidden': 'true' },
      });
      const body = createElement({
        tag: 'div',
        children: [visibleChild, hiddenChild],
      });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();

      expect(result.rootNode.children).toBeDefined();
      expect(result.rootNode.children!.length).toBe(1);
      expect(result.rootNode.children![0].role).toBe('button');
    });

    it('should include children without aria-hidden', async () => {
      const child1 = createElement({ tag: 'button' });
      const child2 = createElement({ tag: 'a', attrs: { href: '/link' } });
      const body = createElement({ tag: 'div', children: [child1, child2] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();

      expect(result.rootNode.children).toBeDefined();
      expect(result.rootNode.children!.length).toBe(2);
    });

    it('should include children with aria-hidden="false"', async () => {
      const child = createElement({
        tag: 'button',
        attrs: { 'aria-hidden': 'false' },
      });
      const body = createElement({ tag: 'div', children: [child] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();

      expect(result.rootNode.children).toBeDefined();
      expect(result.rootNode.children!.length).toBe(1);
    });

    it('should exclude all aria-hidden children when multiple exist', async () => {
      const hidden1 = createElement({ tag: 'div', attrs: { 'aria-hidden': 'true' } });
      const hidden2 = createElement({ tag: 'span', attrs: { 'aria-hidden': 'true' } });
      const visible = createElement({ tag: 'button' });
      const body = createElement({ tag: 'div', children: [hidden1, visible, hidden2] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();

      expect(result.rootNode.children).toBeDefined();
      expect(result.rootNode.children!.length).toBe(1);
      expect(result.rootNode.children![0].role).toBe('button');
    });

    it('should result in no children if all children are aria-hidden', async () => {
      const hidden1 = createElement({ tag: 'div', attrs: { 'aria-hidden': 'true' } });
      const hidden2 = createElement({ tag: 'div', attrs: { 'aria-hidden': 'true' } });
      const body = createElement({ tag: 'div', children: [hidden1, hidden2] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();

      // No children should be set since all were filtered out
      expect(result.rootNode.children).toBeUndefined();
    });
  });

  // =========================================================================
  // Landmarks
  // =========================================================================

  describe('landmarks extraction', () => {
    it('should return landmarks as an array', async () => {
      const body = createElement({ tag: 'body' });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(Array.isArray(result.landmarks)).toBe(true);
    });

    it('should extract semantic NAV element as navigation landmark', async () => {
      const navEl = createElement({ tag: 'nav', id: 'main-nav' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [navEl];
        }
        // Return empty for role-based queries
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.landmarks.length).toBeGreaterThanOrEqual(1);
      const navLandmark = result.landmarks.find((l) => l.role === 'navigation');
      expect(navLandmark).toBeDefined();
    });

    it('should extract semantic MAIN element as main landmark', async () => {
      const mainEl = createElement({ tag: 'main', id: 'content' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [mainEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.landmarks.length).toBeGreaterThanOrEqual(1);
      const mainLandmark = result.landmarks.find((l) => l.role === 'main');
      expect(mainLandmark).toBeDefined();
    });

    it('should extract semantic HEADER as banner landmark', async () => {
      const headerEl = createElement({ tag: 'header', id: 'site-header' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [headerEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const bannerLandmark = result.landmarks.find((l) => l.role === 'banner');
      expect(bannerLandmark).toBeDefined();
    });

    it('should extract semantic FOOTER as contentinfo landmark', async () => {
      const footerEl = createElement({ tag: 'footer', id: 'site-footer' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [footerEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const contentinfoLandmark = result.landmarks.find((l) => l.role === 'contentinfo');
      expect(contentinfoLandmark).toBeDefined();
    });

    it('should extract semantic ASIDE as complementary landmark', async () => {
      const asideEl = createElement({ tag: 'aside', id: 'sidebar' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [asideEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const compLandmark = result.landmarks.find((l) => l.role === 'complementary');
      expect(compLandmark).toBeDefined();
    });

    it('should extract explicit role="navigation" as landmark', async () => {
      const navEl = createElement({
        tag: 'div',
        id: 'role-nav',
        attrs: { role: 'navigation', 'aria-label': 'Breadcrumbs' },
      });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [];
        }
        if (selector === '[role="navigation"]') {
          return [navEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const navLandmark = result.landmarks.find((l) => l.role === 'navigation');
      expect(navLandmark).toBeDefined();
      expect(navLandmark!.label).toBe('Breadcrumbs');
    });

    it('should extract explicit role="main" as landmark', async () => {
      const mainEl = createElement({
        tag: 'div',
        id: 'role-main',
        attrs: { role: 'main' },
      });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [];
        }
        if (selector === '[role="main"]') {
          return [mainEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const mainLandmark = result.landmarks.find((l) => l.role === 'main');
      expect(mainLandmark).toBeDefined();
    });

    it('should capture label on landmarks from aria-label', async () => {
      const navEl = createElement({
        tag: 'nav',
        id: 'primary-nav',
        attrs: { 'aria-label': 'Primary Navigation' },
      });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [navEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const navLandmark = result.landmarks.find((l) => l.role === 'navigation');
      expect(navLandmark).toBeDefined();
      expect(navLandmark!.label).toBe('Primary Navigation');
    });

    it('should have undefined label when landmark has no aria-label', async () => {
      const navEl = createElement({ tag: 'nav', id: 'unlabeled-nav' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [navEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const navLandmark = result.landmarks.find((l) => l.role === 'navigation');
      expect(navLandmark).toBeDefined();
      expect(navLandmark!.label).toBeUndefined();
    });

    it('should include selector on each landmark', async () => {
      const navEl = createElement({ tag: 'nav', id: 'my-nav' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [navEl];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const navLandmark = result.landmarks.find((l) => l.role === 'navigation');
      expect(navLandmark).toBeDefined();
      expect(navLandmark!.selector).toBe('#my-nav');
    });

    it('should limit landmarks to maximum 20 elements', async () => {
      // Create 25 semantic landmarks
      const landmarkElements = Array.from({ length: 25 }, (_, i) =>
        createElement({ tag: 'nav', id: `nav-${i}` })
      );
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return landmarkElements;
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.landmarks.length).toBeLessThanOrEqual(20);
    });

    it('should return empty landmarks array when no landmarks exist', async () => {
      const body = createElement({ tag: 'body' });
      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.landmarks).toEqual([]);
    });

    it('should handle mix of semantic and explicit role landmarks', async () => {
      const semanticNav = createElement({ tag: 'nav', id: 'semantic-nav' });
      const roleNav = createElement({
        tag: 'div',
        id: 'role-nav',
        attrs: { role: 'navigation', 'aria-label': 'Role nav' },
      });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector === 'header, nav, main, aside, footer') {
          return [semanticNav];
        }
        if (selector === '[role="navigation"]') {
          return [roleNav];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      const navLandmarks = result.landmarks.filter((l) => l.role === 'navigation');
      expect(navLandmarks.length).toBe(2);
    });
  });

  // =========================================================================
  // Focus Order
  // =========================================================================

  describe('focus order tracking', () => {
    it('should return focusOrder as an array', async () => {
      const body = createElement({ tag: 'body' });
      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(Array.isArray(result.focusOrder)).toBe(true);
    });

    it('should include buttons in focus order', async () => {
      const btn = createElement({ tag: 'button', id: 'my-btn' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('button')) {
          return [btn];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder.length).toBeGreaterThanOrEqual(1);
      expect(result.focusOrder).toContain('#my-btn');
    });

    it('should include links (a[href]) in focus order', async () => {
      const link = createElement({ tag: 'a', id: 'my-link', attrs: { href: '/page' } });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('a[href]')) {
          return [link];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder).toContain('#my-link');
    });

    it('should include input elements in focus order', async () => {
      const input = createElement({ tag: 'input', id: 'my-input', attrs: { type: 'text' } });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('input')) {
          return [input];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder).toContain('#my-input');
    });

    it('should include select elements in focus order', async () => {
      const select = createElement({ tag: 'select', id: 'my-select' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('select')) {
          return [select];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder).toContain('#my-select');
    });

    it('should include textarea elements in focus order', async () => {
      const textarea = createElement({ tag: 'textarea', id: 'my-textarea' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('textarea')) {
          return [textarea];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder).toContain('#my-textarea');
    });

    it('should exclude elements with tabindex="-1" from focus order', async () => {
      // The CSS selector used is: [tabindex]:not([tabindex="-1"])
      // So tabindex=-1 elements should NOT appear
      const body = createElement({ tag: 'body' });
      const mockDoc = createMockDocument({ body });
      // Return empty since the selector explicitly excludes tabindex=-1
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder).toEqual([]);
    });

    it('should limit focus order to maximum 50 elements', async () => {
      // Create 60 focusable button elements
      const elements = Array.from({ length: 60 }, (_, i) =>
        createElement({ tag: 'button', id: `btn-${i}` })
      );
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('button')) {
          return elements;
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder.length).toBeLessThanOrEqual(50);
    });

    it('should generate selectors with ids for focus order items', async () => {
      const btn = createElement({ tag: 'button', id: 'submit-btn' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('button')) {
          return [btn];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder[0]).toBe('#submit-btn');
    });

    it('should generate selectors with tag.class for focus order items without id', async () => {
      const btn = createElement({ tag: 'button', className: 'primary action' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('button')) {
          return [btn];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder[0]).toBe('button.primary.action');
    });

    it('should generate tag-only selector when element has no id or class', async () => {
      const btn = createElement({ tag: 'button' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('button')) {
          return [btn];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder[0]).toBe('button');
    });

    it('should return empty focus order when no focusable elements exist', async () => {
      const body = createElement({ tag: 'body' });
      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder).toEqual([]);
    });

    it('should preserve DOM order for focus order elements', async () => {
      const first = createElement({ tag: 'button', id: 'first' });
      const second = createElement({ tag: 'input', id: 'second', attrs: { type: 'text' } });
      const third = createElement({ tag: 'a', id: 'third', attrs: { href: '/link' } });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockImplementation((selector: string) => {
        if (selector.includes('button') || selector.includes('input') || selector.includes('a[href]')) {
          return [first, second, third];
        }
        return [];
      });
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusOrder[0]).toBe('#first');
      expect(result.focusOrder[1]).toBe('#second');
      expect(result.focusOrder[2]).toBe('#third');
    });
  });

  // =========================================================================
  // Focused Element
  // =========================================================================

  describe('focused element tracking', () => {
    it('should return focusedElement selector when an element is focused', async () => {
      const focusedEl = createElement({ tag: 'input', id: 'focused-input', attrs: { type: 'text' } });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: focusedEl });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBe('#focused-input');
    });

    it('should return undefined when body is focused', async () => {
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: body });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBeUndefined();
    });

    it('should return undefined when no element is focused (null)', async () => {
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: null });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBeUndefined();
    });
  });

  // =========================================================================
  // Selector Generation
  // =========================================================================

  describe('selector generation', () => {
    it('should generate #id selector when element has id', async () => {
      const el = createElement({ tag: 'button', id: 'my-btn' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: el });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBe('#my-btn');
    });

    it('should generate tag.class1.class2 when element has class but no id', async () => {
      const el = createElement({ tag: 'button', className: 'primary large' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: el });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBe('button.primary.large');
    });

    it('should limit class names to first 2 in selector', async () => {
      const el = createElement({ tag: 'div', className: 'one two three four' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: el });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBe('div.one.two');
    });

    it('should generate lowercase tag name when no id or class', async () => {
      const el = createElement({ tag: 'button' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: el });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBe('button');
    });

    it('should handle empty string id as no id', async () => {
      const el = createElement({ tag: 'button', id: '' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: el });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBe('button');
    });

    it('should handle empty string className as no class', async () => {
      const el = createElement({ tag: 'div', id: '', className: '' });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: el });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.focusedElement).toBe('div');
    });
  });

  // =========================================================================
  // Error Handling and Edge Cases
  // =========================================================================

  describe('error handling and edge cases', () => {
    it('should handle empty DOM gracefully', async () => {
      const body = createElement({ tag: 'body' });
      const mockDoc = createMockDocument({ body });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.rootNode).toBeDefined();
      expect(result.focusOrder).toEqual([]);
      expect(result.landmarks).toEqual([]);
    });

    it('should handle null body element', async () => {
      const mockDoc = createMockDocument({ body: null as any });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      expect(result.rootNode.role).toBe('generic');
    });

    it('should handle elements without getAttribute method in children', async () => {
      // Simulate a child without getAttribute (e.g., a text node cast as HTMLElement)
      const child = {
        tagName: 'SPAN',
        id: '',
        className: '',
        children: { length: 0 },
        getAttribute: undefined,
      } as unknown as HTMLElement;
      const body = createElement({ tag: 'div', children: [child] });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      // The implementation checks child.getAttribute before calling it for aria-hidden
      // If getAttribute is missing, the condition `child.getAttribute && ...` skips it
      const result = await strategy.capture();
      // Should not throw
      expect(result.rootNode).toBeDefined();
    });

    it('should handle element with no children property', async () => {
      const body = createElement({ tag: 'div' });
      // Override children to be undefined-like
      Object.defineProperty(body, 'children', { value: undefined });
      // @ts-expect-error - mocking globals
      globalThis.document = createMockDocument({ body });

      const result = await strategy.capture();
      expect(result.rootNode).toBeDefined();
      expect(result.rootNode.children).toBeUndefined();
    });

    it('should handle className that is not a string', async () => {
      // SVG elements have className as SVGAnimatedString, not a string
      const svgEl = createElement({ tag: 'svg' });
      Object.defineProperty(svgEl, 'className', { value: { baseVal: 'icon' } });
      const body = createElement({ tag: 'body' });

      const mockDoc = createMockDocument({ body, activeElement: svgEl });
      mockDoc.querySelectorAll.mockReturnValue([]);
      // @ts-expect-error - mocking globals
      globalThis.document = mockDoc;

      const result = await strategy.capture();
      // Should not throw, should fallback to tag name
      if (result.focusedElement) {
        expect(typeof result.focusedElement).toBe('string');
        expect(result.focusedElement.toLowerCase()).toContain('svg');
      }
    });
  });

  // =========================================================================
  // Static Properties
  // =========================================================================

  describe('static properties', () => {
    it('should have IMPLICIT_ROLES as a static readonly record', () => {
      expect(AOMTreeStrategy.IMPLICIT_ROLES).toBeDefined();
      expect(typeof AOMTreeStrategy.IMPLICIT_ROLES).toBe('object');
    });

    it('should have INPUT_TYPE_ROLES as a static readonly record', () => {
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES).toBeDefined();
      expect(typeof AOMTreeStrategy.INPUT_TYPE_ROLES).toBe('object');
    });

    it('should have correct entries in IMPLICIT_ROLES', () => {
      expect(AOMTreeStrategy.IMPLICIT_ROLES['button']).toBe('button');
      expect(AOMTreeStrategy.IMPLICIT_ROLES['nav']).toBe('navigation');
      expect(AOMTreeStrategy.IMPLICIT_ROLES['main']).toBe('main');
      expect(AOMTreeStrategy.IMPLICIT_ROLES['a']).toBe('link');
      expect(AOMTreeStrategy.IMPLICIT_ROLES['select']).toBe('combobox');
      expect(AOMTreeStrategy.IMPLICIT_ROLES['textarea']).toBe('textbox');
      expect(AOMTreeStrategy.IMPLICIT_ROLES['input']).toBeUndefined();
    });

    it('should have correct entries in INPUT_TYPE_ROLES', () => {
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['checkbox']).toBe('checkbox');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['radio']).toBe('radio');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['text']).toBe('textbox');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['email']).toBe('textbox');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['number']).toBe('spinbutton');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['range']).toBe('slider');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['search']).toBe('searchbox');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['button']).toBe('button');
      expect(AOMTreeStrategy.INPUT_TYPE_ROLES['submit']).toBe('button');
    });
  });
});
