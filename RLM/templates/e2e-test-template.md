# E2E Test Generation Template

This template is used by the Verifier Agent to generate Playwright E2E tests from feature acceptance criteria.

## Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `{{FEATURE_ID}}` | Feature spec | e.g., FTR-001 |
| `{{FEATURE_NAME}}` | Feature spec | e.g., User Authentication |
| `{{ROUTE}}` | Technical spec | e.g., /login |
| `{{USER_STORY_ID}}` | Feature spec | e.g., US-001 |
| `{{USER_STORY_TITLE}}` | Feature spec | e.g., User Login |
| `{{CRITERION}}` | Acceptance criteria | The testable criterion |

---

## Functional Test Template

**File**: `rlm-app/tests/e2e/features/{{FEATURE_ID}}/{{FEATURE_ID}}.functional.test.ts`

```typescript
import { test, expect } from '@playwright/test';
import { {{FEATURE_NAME}}Page } from '../../page-objects/{{feature-name}}.page';

/**
 * Functional E2E Tests for {{FEATURE_ID}}: {{FEATURE_NAME}}
 * Generated from: RLM/specs/features/{{FEATURE_ID}}/spec.md
 */
test.describe('{{FEATURE_ID}}: {{FEATURE_NAME}}', () => {

  test.describe('{{USER_STORY_ID}}: {{USER_STORY_TITLE}}', () => {
    let featurePage: {{FEATURE_NAME}}Page;

    test.beforeEach(async ({ page }) => {
      featurePage = new {{FEATURE_NAME}}Page(page);
      await featurePage.goto();
    });

    /**
     * Criterion: {{CRITERION}}
     * Type: Functional
     */
    test('should {{criterion_in_test_form}}', async ({ page }) => {
      // Arrange: Set up test data and preconditions
      // [Generated based on criterion type]

      // Act: Perform the action described in the criterion
      // [Generated based on criterion action]

      // Assert: Verify the expected outcome
      // [Generated based on criterion outcome]
    });

    // Additional tests generated from other criteria...
  });

  // Additional user story test blocks...
});
```

---

## Accessibility Test Template

**File**: `rlm-app/tests/e2e/features/{{FEATURE_ID}}/{{FEATURE_ID}}.a11y.test.ts`

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility E2E Tests for {{FEATURE_ID}}: {{FEATURE_NAME}}
 * WCAG 2.1 AA Compliance
 */
test.describe('{{FEATURE_ID}}: {{FEATURE_NAME}} - Accessibility', () => {

  test('main page meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('{{ROUTE}}');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Detailed violation reporting
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
        violation.nodes.forEach(node => {
          console.log(`  Element: ${node.html}`);
          console.log(`  Fix: ${node.failureSummary}`);
        });
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('error state meets accessibility standards', async ({ page }) => {
    await page.goto('{{ROUTE}}');

    // Trigger error state (customize based on feature)
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('[role="alert"], [data-testid="error"]', { timeout: 5000 }).catch(() => {});

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('all interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('{{ROUTE}}');

    const focusableSelector =
      'button, a[href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusableElements = page.locator(focusableSelector);
    const count = await focusableElements.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');
      const focused = page.locator(':focus');
      await expect(focused).toBeVisible();
    }
  });

  test('focus indicators are visible on all interactive elements', async ({ page }) => {
    await page.goto('{{ROUTE}}');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.focus();

        const hasFocusStyle = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          const outline = style.outline;
          const boxShadow = style.boxShadow;
          const borderColor = style.borderColor;

          return (
            (outline !== 'none' && outline !== '0px none rgb(0, 0, 0)') ||
            (boxShadow !== 'none' && boxShadow !== '') ||
            borderColor !== 'rgb(0, 0, 0)'
          );
        });

        expect(hasFocusStyle).toBe(true);
      }
    }
  });

  test('color contrast meets WCAG AA requirements', async ({ page }) => {
    await page.goto('{{ROUTE}}');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter(v =>
      v.id.includes('contrast')
    );

    expect(contrastViolations).toEqual([]);
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('{{ROUTE}}');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Images must have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBe(true);
    }
  });

  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('{{ROUTE}}');

    const inputs = page.locator('input, select, textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');

      // Skip hidden inputs
      if (type === 'hidden') continue;

      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;

        expect(labelExists || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });
});
```

---

## Visual Regression Test Template

**File**: `rlm-app/tests/e2e/features/{{FEATURE_ID}}/{{FEATURE_ID}}.visual.test.ts`

```typescript
import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for {{FEATURE_ID}}: {{FEATURE_NAME}}
 * Captures screenshots for baseline comparison.
 */
test.describe('{{FEATURE_ID}}: {{FEATURE_NAME}} - Visual Regression', () => {

  test('default state matches baseline', async ({ page }) => {
    await page.goto('{{ROUTE}}');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('{{FEATURE_ID}}-default.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('error state matches baseline', async ({ page }) => {
    await page.goto('{{ROUTE}}');

    // Trigger error state
    await page.locator('button[type="submit"]').click();

    // Wait for error to appear
    await page.waitForSelector('[role="alert"], [data-testid="error"], .error', {
      timeout: 5000,
    }).catch(() => {});

    await expect(page).toHaveScreenshot('{{FEATURE_ID}}-error.png', {
      fullPage: true,
    });
  });

  test('loading state matches baseline', async ({ page }) => {
    // Slow down network to capture loading state
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('{{ROUTE}}');

    await expect(page).toHaveScreenshot('{{FEATURE_ID}}-loading.png', {
      fullPage: true,
    });
  });

  test('mobile layout matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('{{ROUTE}}');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('{{FEATURE_ID}}-mobile.png', {
      fullPage: true,
    });
  });

  test('tablet layout matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('{{ROUTE}}');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('{{FEATURE_ID}}-tablet.png', {
      fullPage: true,
    });
  });

  test('hover states match baseline', async ({ page }) => {
    await page.goto('{{ROUTE}}');
    await page.waitForLoadState('networkidle');

    // Find primary action button
    const primaryButton = page.locator(
      'button[type="submit"], button.primary, [data-testid="primary-action"]'
    ).first();

    if (await primaryButton.isVisible()) {
      await primaryButton.hover();
      await expect(primaryButton).toHaveScreenshot('{{FEATURE_ID}}-button-hover.png');
    }
  });

  test('focus states match baseline', async ({ page }) => {
    await page.goto('{{ROUTE}}');
    await page.waitForLoadState('networkidle');

    // Focus first input
    const firstInput = page.locator('input, button').first();
    await firstInput.focus();

    await expect(page).toHaveScreenshot('{{FEATURE_ID}}-focus.png', {
      fullPage: true,
    });
  });

  // Dark mode test (if applicable)
  test('dark mode matches baseline', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('{{ROUTE}}');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('{{FEATURE_ID}}-dark-mode.png', {
      fullPage: true,
    });
  });
});
```

---

## Page Object Template

**File**: `rlm-app/tests/e2e/page-objects/{{feature-name}}.page.ts`

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object for {{FEATURE_NAME}}
 * Route: {{ROUTE}}
 */
export class {{FEATURE_NAME}}Page extends BasePage {
  // ============================================================================
  // Locators
  // ============================================================================

  readonly heading: Locator;
  readonly form: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loadingIndicator: Locator;

  // Feature-specific locators
  // [Add based on feature spec]

  constructor(page: Page) {
    super(page, '{{ROUTE}}');

    // Common locators
    this.heading = page.locator('h1');
    this.form = page.locator('form');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button[type="button"], [data-testid="cancel"]');
    this.errorMessage = page.locator('[role="alert"], [data-testid="error-message"], .error');
    this.successMessage = page.locator('[data-testid="success-message"], .success');
    this.loadingIndicator = page.locator('[data-testid="loading"], .loading, .spinner');

    // Feature-specific locators
    // [Add based on feature spec]
  }

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Submit the form with given data
   */
  async submitForm(data: Record<string, string>): Promise<void> {
    for (const [name, value] of Object.entries(data)) {
      const input = this.page.locator(`[name="${name}"], #${name}`);
      await input.fill(value);
    }
    await this.submitButton.click();
  }

  /**
   * Cancel the current operation
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading(): Promise<void> {
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
  }

  // Feature-specific actions
  // [Add based on acceptance criteria]

  // ============================================================================
  // Assertions
  // ============================================================================

  /**
   * Assert error message is displayed
   */
  async expectError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Assert success message is displayed
   */
  async expectSuccess(message?: string): Promise<void> {
    await expect(this.successMessage).toBeVisible();
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  /**
   * Assert page heading
   */
  async expectHeading(text: string): Promise<void> {
    await expect(this.heading).toContainText(text);
  }

  /**
   * Assert form is visible and ready
   */
  async expectFormReady(): Promise<void> {
    await expect(this.form).toBeVisible();
    await expect(this.submitButton).toBeEnabled();
  }

  // Feature-specific assertions
  // [Add based on acceptance criteria]
}
```

---

## Criterion-to-Test Mapping

Use these patterns to generate test code from acceptance criteria:

### User Action Criteria

Criterion: `"User can [action]"`

```typescript
test('should allow user to [action]', async ({ page }) => {
  // Arrange
  await featurePage.goto();

  // Act
  await featurePage.[performAction]();

  // Assert
  await expect([outcome]).toBeVisible();
});
```

### Visibility Criteria

Criterion: `"[Element] displays/shows [content]"`

```typescript
test('should display [content] in [element]', async ({ page }) => {
  await featurePage.goto();

  await expect(featurePage.[element]).toBeVisible();
  await expect(featurePage.[element]).toContainText('[content]');
});
```

### Error Handling Criteria

Criterion: `"Invalid [input] shows appropriate error message"`

```typescript
test('should show error for invalid [input]', async ({ page }) => {
  await featurePage.goto();

  // Submit invalid data
  await featurePage.submitForm({ [field]: 'invalid-value' });

  // Verify error
  await featurePage.expectError('Invalid [input]');
});
```

### Navigation Criteria

Criterion: `"Successful [action] redirects to [destination]"`

```typescript
test('should redirect to [destination] on successful [action]', async ({ page }) => {
  await featurePage.goto();

  // Perform successful action
  await featurePage.[performSuccessfulAction]();

  // Verify redirect
  await expect(page).toHaveURL(/[destination-pattern]/);
});
```

### Rate Limiting Criteria

Criterion: `"Rate limiting prevents [abuse]"`

```typescript
test('should enforce rate limiting', async ({ page }) => {
  await featurePage.goto();

  // Attempt action multiple times
  for (let i = 0; i < 6; i++) {
    await featurePage.[performAction]();
  }

  // Verify rate limit
  await featurePage.expectError(/rate limit|too many/i);
});
```

---

## Test Naming Conventions

| Criterion Type | Test Name Pattern |
|----------------|-------------------|
| User action | `should allow user to [action]` |
| Display/Show | `should display [content]` |
| Error | `should show error for [condition]` |
| Redirect | `should redirect to [destination] on [trigger]` |
| Validation | `should validate [field]` |
| Rate limit | `should enforce rate limiting` |
| Session | `should [expire/maintain] session after [condition]` |
