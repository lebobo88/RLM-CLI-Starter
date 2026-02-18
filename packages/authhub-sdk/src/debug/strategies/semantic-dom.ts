/**
 * Semantic DOM Capture Strategy
 * Captures a privacy-safe representation of the DOM for debugging
 * @task TASK-567, TASK-568
 * @feature FTR-119
 */

import type {
  CaptureStrategy,
  CaptureContext,
  SemanticDOMCapture,
  ElementNode,
} from './types.js';

/** Maximum depth for recursive element capture */
const MAX_DEPTH = 10;

/** Tags to exclude from capture */
const EXCLUDED_TAGS = new Set([
  'script', 'style', 'noscript', 'svg', 'template', 'iframe', 'link', 'meta',
]);

/** Safe attributes to capture (whitelist) */
const SAFE_ATTRIBUTES = new Set([
  'id', 'class', 'role',
  'aria-label', 'aria-describedby', 'aria-expanded', 'aria-selected',
  'aria-hidden', 'aria-haspopup', 'aria-controls',
  'type', 'name', 'placeholder',
  'disabled', 'readonly', 'required',
  'data-testid', 'data-component',
]);

/** PII patterns for filtering sensitive data */
const PII_PATTERNS = [
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,  // Email
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,  // Phone
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/,   // Credit card
];

/**
 * Strategy that captures a semantic representation of the DOM
 * without any text content or input values (PII safe)
 */
export class SemanticDOMStrategy implements CaptureStrategy<SemanticDOMCapture> {
  readonly name = 'semantic_dom';
  readonly maxSize = 5120; // 5KB

  async capture(_context?: CaptureContext): Promise<SemanticDOMCapture> {
    if (typeof document === 'undefined') {
      throw new Error('SemanticDOMStrategy requires a DOM environment');
    }

    const rootElement = this.captureElement(document.body);

    const result: SemanticDOMCapture = {
      rootElement: rootElement || { tag: 'body' },
      scrollPosition: {
        x: typeof window !== 'undefined' ? window.scrollX : 0,
        y: typeof window !== 'undefined' ? window.scrollY : 0,
      },
      viewportSize: {
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
      },
      capturedAt: new Date().toISOString(),
    };
    const activeEl = this.getActiveElementSelector();
    if (activeEl) result.activeElement = activeEl;
    return result;
  }

  private getActiveElementSelector(): string | undefined {
    const active = document.activeElement;
    if (!active || active === document.body) return undefined;
    return this.generateSelector(active as HTMLElement);
  }

  private generateSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;

    const tag = el.tagName.toLowerCase();
    const classes = el.className && typeof el.className === 'string'
      ? el.className.split(' ').filter(Boolean).slice(0, 2).join('.')
      : '';

    return classes ? `${tag}.${classes}` : tag;
  }

  private captureElement(el: HTMLElement | null, depth = 0): ElementNode | null {
    if (!el) return null;

    const tag = el.tagName.toLowerCase();

    // Exclude certain tags
    if (EXCLUDED_TAGS.has(tag)) {
      return null;
    }

    // Stop at max depth
    if (depth > MAX_DEPTH) {
      return { tag, children: [] };
    }

    const node: ElementNode = { tag };

    // Capture ID
    if (el.id) node.id = el.id;

    // Capture classes
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(Boolean);
      if (classes.length) node.classList = classes;
    }

    // Capture safe attributes only
    const attributes: Record<string, string> = {};
    for (const attr of Array.from(el.attributes)) {
      if (SAFE_ATTRIBUTES.has(attr.name) || attr.name.startsWith('aria-') || attr.name.startsWith('data-')) {
        // Skip class and id as they're already captured
        if (attr.name !== 'class' && attr.name !== 'id') {
          // Skip if looks like PII
          if (this.isPotentialPII(attr.value)) continue;

          // Truncate long values (>100 chars)
          const truncatedValue = attr.value.length > 100 ? attr.value.slice(0, 97) + '...' : attr.value;
          attributes[attr.name] = truncatedValue;
        }
      }
    }
    if (Object.keys(attributes).length) {
      node.attributes = attributes;
    }

    // Extract role
    const role = el.getAttribute('role');
    if (role) node.role = role;

    // Extract label (aria-label or associated label)
    const label = this.extractLabel(el);
    if (label) node.label = label;

    // Recurse into children with depth limit
    if (depth < MAX_DEPTH && el.children.length > 0) {
      const children: ElementNode[] = [];
      for (const child of Array.from(el.children)) {
        const captured = this.captureElement(child as HTMLElement, depth + 1);
        if (captured) children.push(captured);
      }
      if (children.length) node.children = children;
    }

    return node;
  }

  private isPotentialPII(value: string): boolean {
    return PII_PATTERNS.some(pattern => pattern.test(value));
  }

  private extractLabel(el: HTMLElement): string | undefined {
    // Try aria-label first
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Try aria-labelledby
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) return labelEl.textContent?.trim() || undefined;
    }

    // Try associated label for form elements
    if (el.id) {
      const label = document.querySelector(`label[for="${el.id}"]`);
      if (label) return label.textContent?.trim() || undefined;
    }

    return undefined;
  }
}

export { MAX_DEPTH, EXCLUDED_TAGS, SAFE_ATTRIBUTES, PII_PATTERNS };
