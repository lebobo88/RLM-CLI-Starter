/**
 * Synthetic Screenshot Capture Strategy
 * Uses dom-to-image for DOM-to-canvas rendering
 *
 * @task TASK-572
 * @feature FTR-120
 */

import type {
  CaptureStrategy,
  CaptureContext,
  SyntheticScreenshotCapture,
} from './types.js';

/** Selectors for elements that should be masked during capture */
export const MASK_SELECTORS = [
  'input[type="password"]',
  'input[type="email"]',
  'input[type="tel"]',
  'input[type="text"]',
  'input[type="number"]',
  'input:not([type])', // Default inputs without type
  'textarea',
  '[data-sensitive]',
  '[data-pii]',
];

/** Mask value - 8 bullet characters */
export const MASK_VALUE = '••••••••';

export class SyntheticScreenshotStrategy
  implements CaptureStrategy<SyntheticScreenshotCapture>
{
  readonly name = 'synthetic_screenshot';
  readonly maxSize = 15360; // 15KB

  // Storage for masked element restoration
  private maskedElements: Array<{
    element: HTMLInputElement | HTMLTextAreaElement;
    originalValue: string;
    selector: string;
  }> = [];

  async capture(context?: CaptureContext): Promise<SyntheticScreenshotCapture> {
    // Check for DOM environment
    if (typeof document === 'undefined') {
      throw new Error('SyntheticScreenshotStrategy requires a DOM environment');
    }

    const maskedSelectors = this.maskInputs();

    try {
      const scrollHeight = document.body.scrollHeight
        || document.documentElement?.scrollHeight
        || window.innerHeight;

      const { default: domToImage } = await import('dom-to-image-more');
      const dataUrl = await domToImage.toPng(document.body, {
        quality: 0.6,
        bgcolor: '#ffffff',
        width: Math.min(window.innerWidth, 1920),
        height: Math.min(scrollHeight, 4000),
      });

      // Strip data URL prefix
      const imageData = dataUrl.replace(/^data:image\/png;base64,/, '');

      // Calculate error element position if provided
      let errorLocation: { x: number; y: number; selector: string } | undefined;
      if (context?.element) {
        const rect = context.element.getBoundingClientRect();
        errorLocation = {
          x: rect.left,
          y: rect.top,
          selector: this.generateSelector(context.element),
        };
      }

      // Use scrollHeight from body, documentElement, or fallback to innerHeight
      const height = document.body.scrollHeight
        || document.documentElement?.scrollHeight
        || window.innerHeight;

      const result: SyntheticScreenshotCapture = {
        imageData,
        dimensions: {
          width: window.innerWidth,
          height,
        },
        maskedElements: maskedSelectors,
        capturedAt: new Date().toISOString(),
      };
      if (errorLocation) result.errorLocation = errorLocation;
      return result;
    } finally {
      this.restoreInputs();
    }
  }

  private generateSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    const classes = el.className
      ? el.className.split(' ').filter(Boolean).slice(0, 2).join('.')
      : '';
    return classes
      ? `${el.tagName.toLowerCase()}.${classes}`
      : el.tagName.toLowerCase();
  }

  private maskInputs(): string[] {
    const selectors: string[] = [];
    const selectorQuery = MASK_SELECTORS.join(', ');
    const inputs = document.querySelectorAll(selectorQuery);

    inputs.forEach((input) => {
      const el = input as HTMLInputElement | HTMLTextAreaElement;
      const originalValue = el.value;
      const selector = this.generateSelector(el);

      if (originalValue) {
        this.maskedElements.push({
          element: el,
          originalValue,
          selector,
        });
        selectors.push(selector);

        // Store original value in dataset before masking
        (el.dataset as Record<string, string>)['__originalValue'] = originalValue;

        // Mask with 8 bullet characters
        el.value = MASK_VALUE;
      }
    });

    return selectors;
  }

  private restoreInputs(): void {
    this.maskedElements.forEach(({ element, originalValue }) => {
      element.value = originalValue;
      // Clean up dataset backup
      delete (element.dataset as Record<string, string>)['__originalValue'];
    });
    this.maskedElements = [];
  }
}
