/**
 * Tests for BreadcrumbTracker
 * @task TASK-561, TASK-563, TASK-564
 * @feature FTR-123
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BreadcrumbTracker } from './breadcrumbs.js';

/**
 * Helper to create a proper browser environment mock
 * Includes all APIs needed by init(): window, document, history, fetch, XMLHttpRequest
 */
function createBrowserMock() {
  const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

  return {
    window: {
      addEventListener: (type: string, handler: (...args: unknown[]) => void) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(handler);
      },
      removeEventListener: () => {},
      fetch: async () => ({ status: 200 }),
      XMLHttpRequest: class {
        open() {}
        addEventListener() {}
      },
      location: {
        href: 'http://localhost/test',
        origin: 'http://localhost',
        pathname: '/test',
      },
    },
    document: {
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    history: {
      pushState: () => {},
      replaceState: () => {},
    },
  };
}

describe('BreadcrumbTracker', () => {
  let tracker: BreadcrumbTracker;

  beforeEach(() => {
    tracker = new BreadcrumbTracker();
  });

  describe('constructor', () => {
    it('should use default config when none provided', () => {
      const config = tracker.getConfig();
      expect(config.maxBreadcrumbs).toBe(50);
      expect(config.enabledTypes).toContain('click');
    });

    it('should use provided config', () => {
      const customTracker = new BreadcrumbTracker({
        maxBreadcrumbs: 10,
        enabledTypes: ['click', 'custom'],
      });
      const config = customTracker.getConfig();
      expect(config.maxBreadcrumbs).toBe(10);
      expect(config.enabledTypes).toEqual(['click', 'custom']);
    });
  });

  describe('add()', () => {
    it('should add breadcrumb to list', () => {
      tracker.add({
        type: 'click',
        category: 'ui',
        message: 'Button clicked',
      });
      expect(tracker.getBreadcrumbs()).toHaveLength(1);
    });

    it('should add timestamp if not provided', () => {
      const before = new Date().toISOString();
      tracker.add({
        type: 'click',
        category: 'ui',
        message: 'Test',
      });
      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].timestamp).toBeDefined();
      expect(breadcrumbs[0].timestamp >= before).toBe(true);
    });

    it('should use provided timestamp', () => {
      const timestamp = '2024-01-01T00:00:00.000Z';
      tracker.add({
        type: 'click',
        category: 'ui',
        message: 'Test',
        timestamp,
      });
      expect(tracker.getBreadcrumbs()[0].timestamp).toBe(timestamp);
    });
  });

  describe('FIFO enforcement', () => {
    it('should remove oldest when max exceeded', () => {
      const customTracker = new BreadcrumbTracker({ maxBreadcrumbs: 3 });

      customTracker.add({ type: 'click', category: 'ui', message: 'First' });
      customTracker.add({ type: 'click', category: 'ui', message: 'Second' });
      customTracker.add({ type: 'click', category: 'ui', message: 'Third' });
      customTracker.add({ type: 'click', category: 'ui', message: 'Fourth' });

      const bcs = customTracker.getBreadcrumbs();
      expect(bcs).toHaveLength(3);
      expect(bcs[0].message).toBe('Second');
      expect(bcs[2].message).toBe('Fourth');
    });
  });

  describe('getBreadcrumbs()', () => {
    it('should return copy, not reference', () => {
      tracker.add({ type: 'click', category: 'ui', message: 'Test' });
      const bcs1 = tracker.getBreadcrumbs();
      const bcs2 = tracker.getBreadcrumbs();
      expect(bcs1).not.toBe(bcs2);
      expect(bcs1).toEqual(bcs2);
    });
  });

  describe('clear()', () => {
    it('should empty breadcrumbs list', () => {
      tracker.add({ type: 'click', category: 'ui', message: 'Test1' });
      tracker.add({ type: 'click', category: 'ui', message: 'Test2' });
      expect(tracker.getBreadcrumbs()).toHaveLength(2);

      tracker.clear();
      expect(tracker.getBreadcrumbs()).toHaveLength(0);
    });
  });

  describe('beforeBreadcrumb hook', () => {
    it('should filter breadcrumbs when returning null', () => {
      const filterTracker = new BreadcrumbTracker({
        beforeBreadcrumb: (bc) => (bc.message.includes('skip') ? null : bc),
      });

      filterTracker.add({ type: 'click', category: 'ui', message: 'keep this' });
      filterTracker.add({ type: 'click', category: 'ui', message: 'skip this' });
      filterTracker.add({ type: 'click', category: 'ui', message: 'keep too' });

      expect(filterTracker.getBreadcrumbs()).toHaveLength(2);
    });

    it('should allow modifying breadcrumbs', () => {
      const modifyTracker = new BreadcrumbTracker({
        beforeBreadcrumb: (bc) => ({ ...bc, message: `[Modified] ${bc.message}` }),
      });

      modifyTracker.add({ type: 'click', category: 'ui', message: 'Test' });
      expect(modifyTracker.getBreadcrumbs()[0].message).toBe('[Modified] Test');
    });
  });

  describe('enabledTypes', () => {
    it('should not add disabled types', () => {
      const limitedTracker = new BreadcrumbTracker({
        enabledTypes: ['click', 'custom'],
      });

      limitedTracker.add({ type: 'click', category: 'ui', message: 'Enabled' });
      limitedTracker.add({ type: 'navigation', category: 'nav', message: 'Disabled' });
      limitedTracker.add({ type: 'custom', category: 'test', message: 'Enabled' });

      expect(limitedTracker.getBreadcrumbs()).toHaveLength(2);
    });
  });

  describe('click tracking', () => {
    let originalWindow: typeof global.window;
    let originalDocument: typeof global.document;
    let originalHistory: typeof global.history;

    beforeEach(() => {
      originalWindow = global.window;
      originalDocument = global.document;
      originalHistory = global.history;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.document = originalDocument;
      global.history = originalHistory;
    });

    it('should not be initialized by default', () => {
      expect(tracker.isInitialized()).toBe(false);
    });

    it('should set initialized flag after init()', () => {
      const mock = createBrowserMock();
      global.window = mock.window as unknown as typeof window;
      global.document = mock.document as unknown as typeof document;
      global.history = mock.history as unknown as typeof history;

      tracker.init();
      expect(tracker.isInitialized()).toBe(true);
    });

    it('should only initialize once', () => {
      const mock = createBrowserMock();
      global.window = mock.window as unknown as typeof window;
      global.document = mock.document as unknown as typeof document;
      global.history = mock.history as unknown as typeof history;

      tracker.init();
      tracker.init();
      expect(tracker.isInitialized()).toBe(true);
    });

    it('should not initialize when window is undefined', () => {
      // @ts-expect-error - Testing undefined window
      delete global.window;

      tracker.init();
      expect(tracker.isInitialized()).toBe(false);
    });

    it('should not initialize when document is undefined', () => {
      const mock = createBrowserMock();
      global.window = mock.window as unknown as typeof window;
      // @ts-expect-error - Testing undefined document
      delete global.document;

      tracker.init();
      expect(tracker.isInitialized()).toBe(false);
    });

    it('should reset initialized flag after destroy()', () => {
      const mock = createBrowserMock();
      global.window = mock.window as unknown as typeof window;
      global.document = mock.document as unknown as typeof document;
      global.history = mock.history as unknown as typeof history;

      tracker.init();
      expect(tracker.isInitialized()).toBe(true);

      tracker.destroy();
      expect(tracker.isInitialized()).toBe(false);
    });

    it('should not destroy when not initialized', () => {
      const mock = createBrowserMock();
      global.window = mock.window as unknown as typeof window;
      global.document = mock.document as unknown as typeof document;
      global.history = mock.history as unknown as typeof history;

      // Should not throw when destroying without init
      expect(() => tracker.destroy()).not.toThrow();
      expect(tracker.isInitialized()).toBe(false);
    });
  });

  describe('console tracking', () => {
    let originalConsole: {
      debug: typeof console.debug;
      info: typeof console.info;
      warn: typeof console.warn;
      error: typeof console.error;
    };
    let originalWindow: typeof global.window;
    let originalDocument: typeof global.document;
    let originalHistory: typeof global.history;

    beforeEach(() => {
      // Save original console methods
      originalConsole = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
      };

      // Save original globals
      originalWindow = global.window;
      originalDocument = global.document;
      originalHistory = global.history;

      // Setup browser mocks
      const mock = createBrowserMock();
      global.window = mock.window as unknown as typeof window;
      global.document = mock.document as unknown as typeof document;
      global.history = mock.history as unknown as typeof history;
    });

    afterEach(() => {
      // Restore original console methods
      console.debug = originalConsole.debug;
      console.info = originalConsole.info;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;

      // Restore original globals
      global.window = originalWindow;
      global.document = originalDocument;
      global.history = originalHistory;
    });

    it('should create error breadcrumb from console.error', () => {
      tracker.init();
      console.error('Test error message');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].type).toBe('console');
      expect(breadcrumbs[0].category).toBe('console');
      expect(breadcrumbs[0].level).toBe('error');
      expect(breadcrumbs[0].message).toBe('Test error message');
    });

    it('should create warning breadcrumb from console.warn', () => {
      tracker.init();
      console.warn('Test warning message');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].level).toBe('warning');
      expect(breadcrumbs[0].message).toBe('Test warning message');
    });

    it('should create info breadcrumb from console.info', () => {
      tracker.init();
      console.info('Test info message');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].level).toBe('info');
      expect(breadcrumbs[0].message).toBe('Test info message');
    });

    it('should create debug breadcrumb from console.debug', () => {
      tracker.init();
      console.debug('Test debug message');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].level).toBe('debug');
      expect(breadcrumbs[0].message).toBe('Test debug message');
    });

    it('should truncate long messages with ellipsis', () => {
      const longMessage = 'a'.repeat(600);
      tracker.init();
      console.error(longMessage);

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message.length).toBe(500);
      expect(breadcrumbs[0].message).toMatch(/\.\.\.$/);
    });

    it('should redact email addresses from messages', () => {
      tracker.init();
      console.error('User logged in: user@example.com');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).toBe('User logged in: [REDACTED]');
      expect(breadcrumbs[0].message).not.toContain('user@example.com');
    });

    it('should show objects as [Object]', () => {
      tracker.init();
      console.error('User data:', { name: 'John', email: 'john@example.com' });

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).toBe('User data: [Object]');
    });

    it('should format Error objects with message', () => {
      tracker.init();
      console.error('Caught:', new Error('Something went wrong'));

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).toBe('Caught: Error: Something went wrong');
    });

    it('should preserve original console behavior', () => {
      const calls: string[] = [];
      const origError = console.error;
      console.error = (...args: unknown[]) => {
        calls.push(args.map(String).join(' '));
        origError.apply(console, args);
      };

      tracker.init();
      console.error('This should still be logged');

      expect(calls).toContain('This should still be logged');
    });

    it('should join multiple arguments with spaces', () => {
      tracker.init();
      console.error('Value:', 123, 'Status:', true);

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).toBe('Value: 123 Status: true');
    });

    it('should handle null values', () => {
      tracker.init();
      console.error('Result:', null);

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).toBe('Result: null');
    });

    it('should handle undefined values', () => {
      tracker.init();
      console.error('Result:', undefined);

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).toBe('Result: undefined');
    });
  });

  /**
   * Navigation tracking tests
   * @task TASK-563
   */
  describe('navigation tracking', () => {
    let originalWindow: typeof global.window;
    let originalDocument: typeof global.document;
    let originalHistory: typeof global.history;
    let popstateHandler: (() => void) | null = null;

    beforeEach(() => {
      originalWindow = global.window;
      originalDocument = global.document;
      originalHistory = global.history;

      // Mock window with location
      global.window = {
        location: {
          href: 'http://localhost/test-page',
          origin: 'http://localhost',
          pathname: '/test-page',
        },
        addEventListener: (event: string, handler: () => void) => {
          if (event === 'popstate') {
            popstateHandler = handler;
          }
        },
        removeEventListener: () => {},
        fetch: vi.fn(),
        XMLHttpRequest: vi.fn(),
      } as unknown as typeof window;

      global.document = {
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as typeof document;

      global.history = {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      } as unknown as typeof history;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.document = originalDocument;
      global.history = originalHistory;
      popstateHandler = null;
    });

    it('should track popstate navigation events', () => {
      tracker.init();

      // Simulate popstate event (just calling the handler, no PopStateEvent needed)
      if (popstateHandler) {
        popstateHandler();
      }

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].type).toBe('navigation');
      expect(breadcrumbs[0].category).toBe('navigation');
      expect(breadcrumbs[0].message).toContain('Navigated to');
      expect(breadcrumbs[0].data).toHaveProperty('path');
    });

    it('should track history.pushState navigation', () => {
      tracker.init();

      // Call the wrapped pushState
      history.pushState({}, '', '/new-page');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].type).toBe('navigation');
      expect(breadcrumbs[0].data).toHaveProperty('method', 'pushState');
    });

    it('should track history.replaceState navigation', () => {
      tracker.init();

      // Call the wrapped replaceState
      history.replaceState({}, '', '/replaced-page');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].type).toBe('navigation');
      expect(breadcrumbs[0].data).toHaveProperty('method', 'replaceState');
    });

    it('should sanitize URLs by removing query params', () => {
      // Update window location with query params
      (global.window as unknown as { location: { href: string; pathname: string } }).location = {
        href: 'http://localhost/page?token=secret&user=john@example.com',
        origin: 'http://localhost',
        pathname: '/page',
      } as Location;

      tracker.init();

      // Simulate popstate event
      if (popstateHandler) {
        popstateHandler();
      }

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).not.toContain('token=secret');
      expect(breadcrumbs[0].message).not.toContain('john@example.com');
      expect(breadcrumbs[0].data?.path).toBe('/page');
    });

    it('should sanitize URLs by removing hash fragments', () => {
      (global.window as unknown as { location: { href: string; pathname: string } }).location = {
        href: 'http://localhost/page#section-with-data',
        origin: 'http://localhost',
        pathname: '/page',
      } as Location;

      tracker.init();

      // Simulate popstate event
      if (popstateHandler) {
        popstateHandler();
      }

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].message).not.toContain('#section-with-data');
      expect(breadcrumbs[0].data?.path).toBe('/page');
    });
  });

  /**
   * HTTP tracking tests (fetch and XHR)
   * @task TASK-563
   */
  describe('HTTP tracking', () => {
    let originalWindow: typeof global.window;
    let originalDocument: typeof global.document;
    let originalHistory: typeof global.history;
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      originalWindow = global.window;
      originalDocument = global.document;
      originalHistory = global.history;

      mockFetch = vi.fn();

      global.window = {
        location: {
          href: 'http://localhost/',
          origin: 'http://localhost',
          pathname: '/',
        },
        addEventListener: () => {},
        removeEventListener: () => {},
        fetch: mockFetch,
        XMLHttpRequest: class MockXHR {
          status = 200;
          open = vi.fn();
          send = vi.fn();
          addEventListener = vi.fn();
        } as unknown as typeof XMLHttpRequest,
      } as unknown as typeof window;

      global.document = {
        addEventListener: () => {},
        removeEventListener: () => {},
      } as unknown as typeof document;

      global.history = {
        pushState: vi.fn(),
        replaceState: vi.fn(),
      } as unknown as typeof history;
    });

    afterEach(() => {
      global.window = originalWindow;
      global.document = originalDocument;
      global.history = originalHistory;
    });

    describe('fetch tracking', () => {
      it('should track successful fetch requests', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
        });

        tracker.init();

        await window.fetch('/api/users');

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs).toHaveLength(1);
        expect(breadcrumbs[0].type).toBe('fetch');
        expect(breadcrumbs[0].category).toBe('http');
        expect(breadcrumbs[0].message).toContain('GET');
        expect(breadcrumbs[0].message).toContain('/api/users');
        expect(breadcrumbs[0].message).toContain('200');
        expect(breadcrumbs[0].data).toEqual({
          method: 'GET',
          path: '/api/users',
          status: 200,
        });
      });

      it('should track fetch with custom method', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 201,
          ok: true,
        });

        tracker.init();

        await window.fetch('/api/users', { method: 'POST' });

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs[0].message).toContain('POST');
        expect(breadcrumbs[0].data?.method).toBe('POST');
        expect(breadcrumbs[0].data?.status).toBe(201);
      });

      it('should track failed fetch requests', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        tracker.init();

        await expect(window.fetch('/api/data')).rejects.toThrow('Network error');

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs).toHaveLength(1);
        expect(breadcrumbs[0].message).toContain('failed');
        expect(breadcrumbs[0].data?.error).toBe('network_error');
        expect(breadcrumbs[0].level).toBe('error');
      });

      it('should sanitize query params from fetch URLs', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
        });

        tracker.init();

        await window.fetch('/api/users?token=secret123&session=abc');

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs[0].data?.path).toBe('/api/users');
        expect(breadcrumbs[0].message).not.toContain('token=secret');
        expect(breadcrumbs[0].message).not.toContain('session=abc');
      });

      it('should NOT capture request bodies (security)', async () => {
        mockFetch.mockResolvedValueOnce({
          status: 200,
          ok: true,
        });

        tracker.init();

        await window.fetch('/api/users', {
          method: 'POST',
          body: JSON.stringify({ password: 'secret123', ssn: '123-45-6789' }),
        });

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs[0].data).not.toHaveProperty('body');
        expect(JSON.stringify(breadcrumbs[0])).not.toContain('secret123');
        expect(JSON.stringify(breadcrumbs[0])).not.toContain('123-45-6789');
      });
    });

    describe('XHR tracking', () => {
      it('should create XHR breadcrumb with method, path, status', () => {
        let loadendHandler: (() => void) | null = null;

        global.window = {
          ...global.window,
          XMLHttpRequest: class MockXHR {
            status = 200;
            open = vi.fn();
            send = vi.fn();
            addEventListener = (event: string, handler: () => void) => {
              if (event === 'loadend') {
                loadendHandler = handler;
              }
            };
          } as unknown as typeof XMLHttpRequest,
        } as unknown as typeof window;

        tracker.init();

        const xhr = new window.XMLHttpRequest();
        xhr.open('GET', '/api/data');
        xhr.send();

        // Trigger loadend
        if (loadendHandler) {
          loadendHandler();
        }

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs).toHaveLength(1);
        expect(breadcrumbs[0].type).toBe('xhr');
        expect(breadcrumbs[0].category).toBe('http');
        expect(breadcrumbs[0].data?.method).toBe('GET');
        expect(breadcrumbs[0].data?.path).toBe('/api/data');
        expect(breadcrumbs[0].data?.status).toBe(200);
      });

      it('should set error level for 4xx/5xx status codes', () => {
        let loadendHandler: (() => void) | null = null;

        global.window = {
          ...global.window,
          XMLHttpRequest: class MockXHR {
            status = 500;
            open = vi.fn();
            send = vi.fn();
            addEventListener = (event: string, handler: () => void) => {
              if (event === 'loadend') {
                loadendHandler = handler;
              }
            };
          } as unknown as typeof XMLHttpRequest,
        } as unknown as typeof window;

        tracker.init();

        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', '/api/error');
        xhr.send();

        if (loadendHandler) {
          loadendHandler();
        }

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs[0].level).toBe('error');
      });

      it('should set info level for successful status codes', () => {
        let loadendHandler: (() => void) | null = null;

        global.window = {
          ...global.window,
          XMLHttpRequest: class MockXHR {
            status = 201;
            open = vi.fn();
            send = vi.fn();
            addEventListener = (event: string, handler: () => void) => {
              if (event === 'loadend') {
                loadendHandler = handler;
              }
            };
          } as unknown as typeof XMLHttpRequest,
        } as unknown as typeof window;

        tracker.init();

        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', '/api/create');
        xhr.send();

        if (loadendHandler) {
          loadendHandler();
        }

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs[0].level).toBe('info');
      });

      it('should sanitize query params from XHR URLs', () => {
        let loadendHandler: (() => void) | null = null;

        global.window = {
          ...global.window,
          XMLHttpRequest: class MockXHR {
            status = 200;
            open = vi.fn();
            send = vi.fn();
            addEventListener = (event: string, handler: () => void) => {
              if (event === 'loadend') {
                loadendHandler = handler;
              }
            };
          } as unknown as typeof XMLHttpRequest,
        } as unknown as typeof window;

        tracker.init();

        const xhr = new window.XMLHttpRequest();
        xhr.open('GET', '/api/users?apiKey=secret&email=user@example.com');
        xhr.send();

        if (loadendHandler) {
          loadendHandler();
        }

        const breadcrumbs = tracker.getBreadcrumbs();
        expect(breadcrumbs[0].data?.path).toBe('/api/users');
        expect(JSON.stringify(breadcrumbs[0])).not.toContain('apiKey=secret');
        expect(JSON.stringify(breadcrumbs[0])).not.toContain('user@example.com');
      });
    });
  });
});
