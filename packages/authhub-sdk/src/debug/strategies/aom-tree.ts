/**
 * AOM Tree Capture Strategy for Zero-Trust Debug Logging
 * Captures accessibility tree structure, focus order, and landmarks
 *
 * @task TASK-575
 * @feature FTR-121
 */

import type {
  CaptureStrategy,
  CaptureContext,
  AOMTreeCapture,
  AccessibilityNode,
  AccessibilityState,
  LandmarkInfo,
} from './types.js';

export class AOMTreeStrategy implements CaptureStrategy<AOMTreeCapture> {
  readonly name = 'aom_tree';
  readonly maxSize = 8192; // 8KB
  static readonly MAX_DEPTH = 8;

  /**
   * Implicit role mapping for semantic HTML elements
   * Based on WAI-ARIA 1.2 specification
   */
  static readonly IMPLICIT_ROLES: Record<string, string | undefined> = {
    a: 'link',
    article: 'article',
    aside: 'complementary',
    button: 'button',
    footer: 'contentinfo',
    form: 'form',
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading',
    header: 'banner',
    img: 'img',
    input: undefined, // Depends on type
    li: 'listitem',
    main: 'main',
    nav: 'navigation',
    ol: 'list',
    option: 'option',
    progress: 'progressbar',
    section: 'region',
    select: 'combobox',
    table: 'table',
    textarea: 'textbox',
    ul: 'list',
  };

  /**
   * Input type to role mapping for input elements
   */
  static readonly INPUT_TYPE_ROLES: Record<string, string> = {
    button: 'button',
    checkbox: 'checkbox',
    email: 'textbox',
    number: 'spinbutton',
    radio: 'radio',
    range: 'slider',
    search: 'searchbox',
    submit: 'button',
    tel: 'textbox',
    text: 'textbox',
  };

  async capture(_context?: CaptureContext): Promise<AOMTreeCapture> {
    if (typeof document === 'undefined') {
      throw new Error('AOMTreeStrategy requires a DOM environment');
    }

    const result: AOMTreeCapture = {
      rootNode: this.captureAccessibilityNode(document.body),
      focusOrder: this.getFocusOrder(),
      landmarks: this.getLandmarks(),
      capturedAt: new Date().toISOString(),
    };
    const focused = this.getFocusedElementSelector();
    if (focused) result.focusedElement = focused;
    return result;
  }

  private getFocusedElementSelector(): string | undefined {
    const focused = document.activeElement;
    if (!focused || focused === document.body) return undefined;
    return this.generateSelector(focused as HTMLElement);
  }

  private generateSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    const tag = el.tagName.toLowerCase();
    const classes =
      el.className && typeof el.className === 'string'
        ? el.className
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .join('.')
        : '';
    return classes ? `${tag}.${classes}` : tag;
  }

  private getFocusOrder(): string[] {
    const focusable = document.querySelectorAll<HTMLElement>(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return Array.from(focusable)
      .slice(0, 50)
      .map((el) => this.generateSelector(el));
  }

  private getLandmarks(): LandmarkInfo[] {
    const landmarks: LandmarkInfo[] = [];

    // Semantic HTML elements as landmarks
    const semanticLandmarks = document.querySelectorAll(
      'header, nav, main, aside, footer'
    );
    for (let i = 0; i < semanticLandmarks.length && landmarks.length < 20; i++) {
      const el = semanticLandmarks[i] as HTMLElement;
      const info: LandmarkInfo = {
        role: this.getImplicitRole(el),
        selector: this.generateSelector(el),
      };
      const lbl = el.getAttribute('aria-label');
      if (lbl) info.label = lbl;
      landmarks.push(info);
    }

    // Explicit role landmarks
    const landmarkRoles = [
      'banner',
      'navigation',
      'main',
      'complementary',
      'contentinfo',
      'search',
      'form',
      'region',
    ];

    for (const role of landmarkRoles) {
      if (landmarks.length >= 20) break;
      const elements = document.querySelectorAll(`[role="${role}"]`);
      for (let i = 0; i < elements.length && landmarks.length < 20; i++) {
        const el = elements[i] as HTMLElement;
        const info: LandmarkInfo = {
          role,
          selector: this.generateSelector(el),
        };
        const lbl = el.getAttribute('aria-label');
        if (lbl) info.label = lbl;
        landmarks.push(info);
      }
    }

    return landmarks.slice(0, 20);
  }

  /**
   * Get the role for an element, preferring explicit over implicit
   */
  private getRole(el: HTMLElement): string {
    // Explicit role always takes precedence
    const explicitRole = el.getAttribute('role');
    if (explicitRole) return explicitRole;

    const tag = el.tagName.toLowerCase();

    // Handle input elements specially based on type
    if (tag === 'input') {
      const type = el.getAttribute('type') || 'text';
      return AOMTreeStrategy.INPUT_TYPE_ROLES[type] || 'textbox';
    }

    // Use implicit role mapping
    const implicitRole = AOMTreeStrategy.IMPLICIT_ROLES[tag];
    return implicitRole ?? 'generic';
  }

  /**
   * Get the implicit role for semantic landmark elements
   * Used specifically for landmark extraction
   */
  private getImplicitRole(el: HTMLElement): string {
    const tag = el.tagName.toLowerCase();
    const implicitRoles: Record<string, string> = {
      header: 'banner',
      nav: 'navigation',
      main: 'main',
      aside: 'complementary',
      footer: 'contentinfo',
    };
    return implicitRoles[tag] || 'generic';
  }

  /**
   * Get the accessible name for an element following ARIA name computation
   * Priority: aria-label > aria-labelledby > associated label > alt (for images)
   */
  private getAccessibleName(el: HTMLElement): string | undefined {
    // 1. aria-label takes highest priority
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // 2. aria-labelledby references another element
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement?.textContent) {
        return labelElement.textContent;
      }
    }

    // 3. Associated label for form controls
    const id = el.getAttribute('id') || el.id;
    if (id) {
      const associatedLabel = document.querySelector(`label[for="${id}"]`);
      if (associatedLabel?.textContent) {
        return associatedLabel.textContent;
      }
    }

    // 4. alt text for images
    const tag = el.tagName.toLowerCase();
    if (tag === 'img') {
      const alt = el.getAttribute('alt');
      if (alt) return alt;
    }

    return undefined;
  }

  /**
   * Get the accessible description for an element from aria-describedby
   */
  private getAccessibleDescription(el: HTMLElement): string | undefined {
    const describedBy = el.getAttribute('aria-describedby');
    if (describedBy) {
      const descElement = document.getElementById(describedBy);
      if (descElement?.textContent) {
        return descElement.textContent;
      }
    }
    return undefined;
  }

  /**
   * Capture the accessibility state of an element from ARIA attributes
   * and native HTML properties.
   *
   * Supports: disabled, expanded, selected, checked (including mixed),
   * pressed, hidden, and invalid states.
   */
  private getState(el: HTMLElement): AccessibilityState | undefined {
    const state: AccessibilityState = {};
    let hasState = false;

    // disabled: aria-disabled or native disabled property
    const ariaDisabled = el.getAttribute('aria-disabled');
    if (ariaDisabled === 'true' || (el as HTMLButtonElement).disabled === true) {
      state.disabled = true;
      hasState = true;
    }

    // expanded: aria-expanded
    const ariaExpanded = el.getAttribute('aria-expanded');
    if (ariaExpanded === 'true') {
      state.expanded = true;
      hasState = true;
    } else if (ariaExpanded === 'false') {
      state.expanded = false;
      hasState = true;
    }

    // selected: aria-selected
    const ariaSelected = el.getAttribute('aria-selected');
    if (ariaSelected === 'true') {
      state.selected = true;
      hasState = true;
    } else if (ariaSelected === 'false') {
      state.selected = false;
      hasState = true;
    }

    // checked: aria-checked (supports "true", "false", "mixed")
    // For native checkboxes, also check the checked property
    const ariaChecked = el.getAttribute('aria-checked');
    if (ariaChecked === 'true') {
      state.checked = true;
      hasState = true;
    } else if (ariaChecked === 'false') {
      state.checked = false;
      hasState = true;
    } else if (ariaChecked === 'mixed') {
      // Mixed state represented as undefined checked but we need a signal.
      // The AccessibilityState interface uses boolean, so we encode mixed
      // by omitting checked but noting it in state. However, since the
      // interface only supports boolean, we'll use undefined to indicate mixed
      // and rely on the 'mixed' string from aria-checked.
      // For now, we store it as false to indicate "not fully checked"
      // but mark it in a way tests can verify. Since the type is boolean | undefined,
      // we represent mixed as undefined (not set) - consumers should check
      // aria-checked="mixed" directly if they need tri-state.
      // Actually, let's just not set checked for mixed - the absence combined
      // with aria-checked="mixed" on the element is the signal.
      hasState = true;
    } else if (
      el.tagName.toLowerCase() === 'input' &&
      el.getAttribute('type') === 'checkbox' &&
      (el as HTMLInputElement).checked === true
    ) {
      state.checked = true;
      hasState = true;
    }

    // pressed: aria-pressed
    const ariaPressed = el.getAttribute('aria-pressed');
    if (ariaPressed === 'true') {
      state.pressed = true;
      hasState = true;
    } else if (ariaPressed === 'false') {
      state.pressed = false;
      hasState = true;
    }

    // hidden: aria-hidden
    const ariaHidden = el.getAttribute('aria-hidden');
    if (ariaHidden === 'true') {
      state.hidden = true;
      hasState = true;
    }

    // invalid: aria-invalid
    const ariaInvalid = el.getAttribute('aria-invalid');
    if (ariaInvalid === 'true') {
      state.invalid = true;
      hasState = true;
    }

    return hasState ? state : undefined;
  }

  /**
   * Recursively capture an accessibility node and its children.
   *
   * - Excludes elements with aria-hidden="true" from the tree
   * - Enforces a depth limit of MAX_DEPTH (8 levels) to prevent
   *   excessive recursion in deeply nested DOMs
   * - Captures role, name, description, state, and children
   *
   * @param el - The HTML element to capture
   * @param depth - Current recursion depth (0-based)
   * @returns The accessibility node representation
   */
  private captureAccessibilityNode(
    el: HTMLElement | null,
    depth: number = 0
  ): AccessibilityNode {
    if (!el) return { role: 'generic' };

    const node: AccessibilityNode = {
      role: this.getRole(el),
    };
    const name = this.getAccessibleName(el);
    if (name) node.name = name;
    const description = this.getAccessibleDescription(el);
    if (description) node.description = description;

    // Capture accessibility state
    const state = this.getState(el);
    if (state) {
      node.state = state;
    }

    // Recurse into children if within depth limit
    if (depth < AOMTreeStrategy.MAX_DEPTH && el.children && el.children.length > 0) {
      const children: AccessibilityNode[] = [];

      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i] as HTMLElement;

        // Skip elements with aria-hidden="true"
        if (child.getAttribute && child.getAttribute('aria-hidden') === 'true') {
          continue;
        }

        children.push(this.captureAccessibilityNode(child, depth + 1));
      }

      if (children.length > 0) {
        node.children = children;
      }
    }

    return node;
  }
}
