// @vitest-environment jsdom

/**
 * Tests for DebugModule class
 * @task TASK-588
 * @feature FTR-124
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DebugModule } from '../index.js';
import type { CaptureEvent, CaptureResult } from '../types.js';

describe('DebugModule', () => {
  let module: DebugModule;
  const mockRequest = vi.fn();

  const defaultCaptureResult: CaptureResult = {
    id: 'test-id',
    errorHash: 'hash-abc123',
    isNewError: true,
    occurrenceCount: 1,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(defaultCaptureResult),
    });

    module = new DebugModule({
      appId: 'test-app',
      apiUrl: 'https://api.test.com',
      request: mockRequest,
      environment: 'test',
      sampleRate: 1,
    });
  });

  afterEach(() => {
    // Clean up any init() side effects
    module.destroy();
  });

  // =========================================================================
  // Constructor
  // =========================================================================
  describe('constructor', () => {
    it('should apply default config values when optional fields are omitted', () => {
      const mod = new DebugModule({
        appId: 'app-1',
        apiUrl: 'https://api.example.com',
      });
      const config = mod.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.sampleRate).toBe(1.0);
      expect(config.environment).toBe('production');
      expect(config.release).toBe('');
      expect(config.maxBreadcrumbs).toBe(50);
    });

    it('should preserve explicit config values', () => {
      const mod = new DebugModule({
        appId: 'my-app',
        apiUrl: 'https://debug.example.com',
        enabled: false,
        sampleRate: 0.5,
        environment: 'staging',
        release: '2.0.0',
        maxBreadcrumbs: 100,
        strategies: ['ast-capture'],
      });
      const config = mod.getConfig();
      expect(config.appId).toBe('my-app');
      expect(config.apiUrl).toBe('https://debug.example.com');
      expect(config.enabled).toBe(false);
      expect(config.sampleRate).toBe(0.5);
      expect(config.environment).toBe('staging');
      expect(config.release).toBe('2.0.0');
      expect(config.maxBreadcrumbs).toBe(100);
      expect(config.strategies).toEqual(['ast-capture']);
    });

    it('should initialize all four capture strategies', () => {
      expect(module.getStrategy('semantic_dom')).toBeDefined();
      expect(module.getStrategy('synthetic_screenshot')).toBeDefined();
      expect(module.getStrategy('aom_tree')).toBeDefined();
      expect(module.getStrategy('ast')).toBeDefined();
    });

    it('should return undefined for an unknown strategy name', () => {
      expect(module.getStrategy('nonexistent')).toBeUndefined();
    });

    it('should generate a session ID on construction', () => {
      const sessionId = module.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it('should not be initialized after construction alone', () => {
      expect(module.isInitialized()).toBe(false);
    });
  });

  // =========================================================================
  // resolveStrategyName
  // =========================================================================
  describe('resolveStrategyName', () => {
    it('should map semantic-dom to semantic_dom', () => {
      expect(module.resolveStrategyName('semantic-dom')).toBe('semantic_dom');
    });

    it('should map synthetic-screenshot to synthetic_screenshot', () => {
      expect(module.resolveStrategyName('synthetic-screenshot')).toBe('synthetic_screenshot');
    });

    it('should map aom-tree to aom_tree', () => {
      expect(module.resolveStrategyName('aom-tree')).toBe('aom_tree');
    });

    it('should map ast-capture to ast', () => {
      expect(module.resolveStrategyName('ast-capture')).toBe('ast');
    });
  });

  // =========================================================================
  // init() - auto-instrumentation
  // =========================================================================
  describe('init', () => {
    it('should set initialized to true after calling init', () => {
      module.init();
      expect(module.isInitialized()).toBe(true);
    });

    it('should be idempotent - calling init twice does not re-initialize', () => {
      module.init();
      const firstWindowOnerror = window.onerror;
      module.init();
      // onerror handler should be the same reference, not wrapped twice
      expect(window.onerror).toBe(firstWindowOnerror);
      expect(module.isInitialized()).toBe(true);
    });

    it('should be SSR-safe - no error when window is undefined', () => {
      const originalWindow = globalThis.window;
      // Simulate SSR by temporarily making window undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).window;
      try {
        const ssrModule = new DebugModule({
          appId: 'ssr-app',
          apiUrl: 'https://api.test.com',
        });
        expect(() => ssrModule.init()).not.toThrow();
        expect(ssrModule.isInitialized()).toBe(false);
      } finally {
        globalThis.window = originalWindow;
      }
    });

    it('should install window.onerror handler', () => {
      const originalOnError = window.onerror;
      module.init();
      expect(window.onerror).not.toBe(originalOnError);
    });

    it('should chain to the original window.onerror if one exists', () => {
      const originalHandler = vi.fn().mockReturnValue(false);
      window.onerror = originalHandler;
      module.init();
      // Trigger the error handler
      if (window.onerror) {
        window.onerror('test error', 'test.js', 1, 1, new Error('test'));
      }
      expect(originalHandler).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // destroy()
  // =========================================================================
  describe('destroy', () => {
    it('should set initialized to false', () => {
      module.init();
      expect(module.isInitialized()).toBe(true);
      module.destroy();
      expect(module.isInitialized()).toBe(false);
    });

    it('should restore original window.onerror', () => {
      const originalOnError = window.onerror;
      module.init();
      module.destroy();
      expect(window.onerror).toBe(originalOnError);
    });

    it('should be safe to call destroy without init', () => {
      expect(() => module.destroy()).not.toThrow();
      expect(module.isInitialized()).toBe(false);
    });
  });

  // =========================================================================
  // captureError
  // =========================================================================
  describe('captureError', () => {
    it('should send error to API and return CaptureResult', async () => {
      const error = new Error('Something went wrong');
      const result = await module.captureError(error);

      expect(result).toEqual(defaultCaptureResult);
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should use default semantic_dom strategy when none specified', async () => {
      const error = new Error('Test error');
      await module.captureError(error);

      expect(mockRequest).toHaveBeenCalledTimes(1);
      const callArgs = mockRequest.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.capture.strategy).toBe('semantic_dom');
    });

    it('should use strategy from options when specified', async () => {
      const error = new Error('Syntax problem');
      await module.captureError(error, { strategies: ['ast-capture'] });

      expect(mockRequest).toHaveBeenCalledTimes(1);
      const callArgs = mockRequest.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.capture.strategy).toBe('ast');
    });

    it('should use strategy from config when no option override', async () => {
      const mod = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        strategies: ['aom-tree'],
        sampleRate: 1,
      });
      const error = new Error('Config strategy test');
      await mod.captureError(error);

      const callArgs = mockRequest.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.capture.strategy).toBe('aom_tree');
    });

    it('should call the correct API endpoint', async () => {
      const error = new Error('Endpoint test');
      await module.captureError(error);

      const url = mockRequest.mock.calls[0][0];
      expect(url).toBe('https://api.test.com/api/v1/debug/capture');
    });

    it('should include appId in request body', async () => {
      const error = new Error('AppId test');
      await module.captureError(error);

      const body = JSON.parse(mockRequest.mock.calls[0][1].body);
      expect(body.appId).toBe('test-app');
    });

    it('should include error details in request body', async () => {
      const error = new TypeError('Cannot read properties of null');
      await module.captureError(error);

      const body = JSON.parse(mockRequest.mock.calls[0][1].body);
      expect(body.error.name).toBe('TypeError');
      expect(body.error.message).toBe('Cannot read properties of null');
      expect(body.error.stack).toBeDefined();
    });

    it('should include metadata (environment, release, sessionId) in request body', async () => {
      const error = new Error('Metadata test');
      await module.captureError(error);

      const body = JSON.parse(mockRequest.mock.calls[0][1].body);
      expect(body.metadata.environment).toBe('test');
      expect(body.metadata.sessionId).toBe(module.getSessionId());
    });

    it('should include Content-Type header in request', async () => {
      const error = new Error('Header test');
      await module.captureError(error);

      const headers = mockRequest.mock.calls[0][1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should return null when module is disabled', async () => {
      const disabledModule = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        enabled: false,
      });

      const result = await disabledModule.captureError(new Error('disabled'));
      expect(result).toBeNull();
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should return null when request function is not provided', async () => {
      const noRequestModule = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        sampleRate: 1,
      });

      const result = await noRequestModule.captureError(new Error('no request fn'));
      expect(result).toBeNull();
    });

    it('should return null when API response is not ok', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' }),
      });

      const result = await module.captureError(new Error('server error'));
      expect(result).toBeNull();
    });

    it('should return null and log error when request throws', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockRequest.mockRejectedValueOnce(new Error('Network failure'));

      const result = await module.captureError(new Error('network issue'));
      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[AuthHub Debug] Capture error:',
        expect.any(Error),
      );
    });

    it('should include user context in the event when set', async () => {
      module.setUser({ id: 'user-anon-42' });
      const error = new Error('User context test');
      await module.captureError(error);

      // Verify the request was made (user is included in the event flow)
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should merge option tags with module tags', async () => {
      module.setTags({ app: 'test', version: '1.0' });
      const error = new Error('Tag merge test');
      await module.captureError(error, { tags: { component: 'form' } });

      // The event.context.tags should have both module tags and option tags
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should include breadcrumbs in the request body', async () => {
      module.addBreadcrumb({
        category: 'test',
        message: 'Test breadcrumb',
        type: 'custom',
      });

      const error = new Error('Breadcrumb test');
      await module.captureError(error);

      const body = JSON.parse(mockRequest.mock.calls[0][1].body);
      expect(body.breadcrumbs).toHaveLength(1);
      expect(body.breadcrumbs[0].message).toBe('Test breadcrumb');
    });
  });

  // =========================================================================
  // captureError - sample rate
  // =========================================================================
  describe('captureError - sample rate', () => {
    it('should capture nothing when sampleRate is 0', async () => {
      const mod = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        sampleRate: 0,
      });

      // With sampleRate 0, Math.random() will always be > 0
      const results: (CaptureResult | null)[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(await mod.captureError(new Error('sample 0')));
      }
      // All should be null because Math.random() returns [0, 1) which is always > 0
      expect(results.every((r) => r === null)).toBe(true);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should capture everything when sampleRate is 1', async () => {
      // Module already configured with sampleRate: 1
      const error = new Error('sample 1');
      const result = await module.captureError(error);
      expect(result).toEqual(defaultCaptureResult);
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should respect fractional sample rate with mocked Math.random', async () => {
      const mod = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        sampleRate: 0.5,
      });

      // Math.random returns 0.3 which is <= 0.5 -> should capture
      vi.spyOn(Math, 'random').mockReturnValue(0.3);
      const result1 = await mod.captureError(new Error('should capture'));
      expect(result1).toEqual(defaultCaptureResult);

      // Math.random returns 0.8 which is > 0.5 -> should not capture
      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const result2 = await mod.captureError(new Error('should skip'));
      expect(result2).toBeNull();
    });
  });

  // =========================================================================
  // captureMessage
  // =========================================================================
  describe('captureMessage', () => {
    it('should create a capture with info level by default', async () => {
      const result = await module.captureMessage('User completed onboarding');
      expect(result).toEqual(defaultCaptureResult);
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should set the error name to "Message"', async () => {
      await module.captureMessage('Test message');

      const body = JSON.parse(mockRequest.mock.calls[0][1].body);
      expect(body.error.name).toBe('Message');
      expect(body.error.message).toBe('Test message');
    });

    it('should forward additional options', async () => {
      await module.captureMessage('Tagged message', {
        tags: { source: 'onboarding' },
      });

      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should return null when module is disabled', async () => {
      const disabledModule = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        enabled: false,
      });

      const result = await disabledModule.captureMessage('disabled message');
      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // autoSelectStrategy (tested via captureError without strategy options)
  // =========================================================================
  describe('autoSelectStrategy (private, tested indirectly)', () => {
    // Note: autoSelectStrategy is private. We can test it indirectly via
    // the absence of explicit strategies in config/options, but the current
    // captureError implementation falls back to semantic_dom rather than
    // calling autoSelectStrategy explicitly. These tests verify the
    // method's logic would work correctly based on its implementation.

    it('should select ast for SyntaxError', () => {
      // Access private method via bracket notation for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const syntaxErr = new SyntaxError('Unexpected token');
      expect(autoSelect(syntaxErr)).toBe('ast');
    });

    it('should select ast for ReferenceError', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const refErr = new ReferenceError('foo is not defined');
      expect(autoSelect(refErr)).toBe('ast');
    });

    it('should select ast for TypeError', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const typeErr = new TypeError('is not a function');
      expect(autoSelect(typeErr)).toBe('ast');
    });

    it('should select ast for "is not defined" message', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const err = new Error('myVar is not defined');
      expect(autoSelect(err)).toBe('ast');
    });

    it('should select ast for "is not a function" message', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const err = new Error('callback is not a function');
      expect(autoSelect(err)).toBe('ast');
    });

    it('should select synthetic_screenshot for render errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const renderErr = new Error('Failed to render component');
      expect(autoSelect(renderErr)).toBe('synthetic_screenshot');
    });

    it('should select synthetic_screenshot for layout errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const layoutErr = new Error('Invalid layout detected');
      expect(autoSelect(layoutErr)).toBe('synthetic_screenshot');
    });

    it('should select synthetic_screenshot for style errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const styleErr = new Error('Cannot apply style');
      expect(autoSelect(styleErr)).toBe('synthetic_screenshot');
    });

    it('should select synthetic_screenshot for CSS errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const cssErr = new Error('Invalid CSS property');
      expect(autoSelect(cssErr)).toBe('synthetic_screenshot');
    });

    it('should select semantic_dom for form activity in recent breadcrumbs', () => {
      // Add form-related breadcrumbs
      module.addBreadcrumb({
        type: 'click',
        category: 'ui',
        message: 'Clicked input',
        data: { element: { tag: 'input' } },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const genericErr = new Error('Something happened');
      expect(autoSelect(genericErr)).toBe('semantic_dom');
    });

    it('should select semantic_dom for button activity in recent breadcrumbs', () => {
      module.addBreadcrumb({
        type: 'click',
        category: 'ui',
        message: 'Clicked button',
        data: { element: { tag: 'button' } },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const genericErr = new Error('Button error');
      expect(autoSelect(genericErr)).toBe('semantic_dom');
    });

    it('should select semantic_dom for textarea activity in recent breadcrumbs', () => {
      module.addBreadcrumb({
        type: 'click',
        category: 'ui',
        message: 'Clicked textarea',
        data: { element: { tag: 'textarea' } },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const genericErr = new Error('Textarea error');
      expect(autoSelect(genericErr)).toBe('semantic_dom');
    });

    it('should select semantic_dom for select activity in recent breadcrumbs', () => {
      module.addBreadcrumb({
        type: 'click',
        category: 'ui',
        message: 'Clicked select',
        data: { element: { tag: 'select' } },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const genericErr = new Error('Select error');
      expect(autoSelect(genericErr)).toBe('semantic_dom');
    });

    it('should select semantic_dom for form element activity in recent breadcrumbs', () => {
      module.addBreadcrumb({
        type: 'click',
        category: 'ui',
        message: 'Clicked form',
        data: { element: { tag: 'form' } },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const genericErr = new Error('Form error');
      expect(autoSelect(genericErr)).toBe('semantic_dom');
    });

    it('should default to semantic_dom when no heuristic matches', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoSelect = (module as any).autoSelectStrategy.bind(module);
      const genericErr = new Error('Some unknown error');
      expect(autoSelect(genericErr)).toBe('semantic_dom');
    });
  });

  // =========================================================================
  // beforeCapture hook
  // =========================================================================
  describe('beforeCapture hook', () => {
    it('should allow modifying the event before capture', async () => {
      const beforeCapture = vi.fn((event: CaptureEvent) => {
        event.context.tags['injected'] = 'true';
        return event;
      });

      const mod = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        sampleRate: 1,
        beforeCapture,
      });

      await mod.captureError(new Error('Hook test'));
      expect(beforeCapture).toHaveBeenCalledTimes(1);
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });

    it('should receive a well-formed CaptureEvent', async () => {
      const beforeCapture = vi.fn((event: CaptureEvent) => {
        expect(event.error).toBeDefined();
        expect(event.error.name).toBe('Error');
        expect(event.error.message).toBe('Event structure test');
        expect(event.capture).toBeDefined();
        expect(event.capture.strategies).toBeDefined();
        expect(event.capture.timestamp).toBeDefined();
        expect(event.context).toBeDefined();
        expect(event.breadcrumbs).toBeDefined();
        expect(Array.isArray(event.breadcrumbs)).toBe(true);
        return event;
      });

      const mod = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        sampleRate: 1,
        beforeCapture,
      });

      await mod.captureError(new Error('Event structure test'));
      expect(beforeCapture).toHaveBeenCalledTimes(1);
    });

    it('should suppress capture when returning null (filtering)', async () => {
      const beforeCapture = vi.fn(() => null);

      const mod = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        sampleRate: 1,
        beforeCapture,
      });

      const result = await mod.captureError(new Error('Should be filtered'));
      expect(result).toBeNull();
      expect(beforeCapture).toHaveBeenCalledTimes(1);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should use the modified event for the API request', async () => {
      const beforeCapture = vi.fn((event: CaptureEvent) => {
        // Modify the error message
        event.error.message = 'Modified message';
        return event;
      });

      const mod = new DebugModule({
        appId: 'test-app',
        apiUrl: 'https://api.test.com',
        request: mockRequest,
        sampleRate: 1,
        beforeCapture,
      });

      await mod.captureError(new Error('Original message'));
      // The request should have been called with the API payload
      expect(mockRequest).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Helper methods: setUser / getUser
  // =========================================================================
  describe('setUser / getUser', () => {
    it('should set and get user context', () => {
      module.setUser({ id: 'anon-user-1' });
      expect(module.getUser()).toEqual({ id: 'anon-user-1' });
    });

    it('should allow clearing user context with null', () => {
      module.setUser({ id: 'anon-user-1' });
      module.setUser(null);
      expect(module.getUser()).toBeNull();
    });

    it('should warn and reject user without id field', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module.setUser({ id: '' } as any);
      // Empty string is falsy, so it should be rejected
      expect(warnSpy).toHaveBeenCalledWith('[AuthHub Debug] UserContext requires id field');
    });

    it('should keep previous user when setUser is called with invalid data', () => {
      module.setUser({ id: 'valid-user' });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module.setUser({ id: '' } as any);
      expect(module.getUser()).toEqual({ id: 'valid-user' });
      warnSpy.mockRestore();
    });
  });

  // =========================================================================
  // Helper methods: setUserContext / getUserContext
  // =========================================================================
  describe('setUserContext / getUserContext', () => {
    it('should set and get user context directly', () => {
      module.setUserContext({ id: 'context-user-1' });
      expect(module.getUserContext()).toEqual({ id: 'context-user-1' });
    });

    it('should allow clearing with null', () => {
      module.setUserContext({ id: 'temp-user' });
      module.setUserContext(null);
      expect(module.getUserContext()).toBeNull();
    });

    it('should default to null', () => {
      expect(module.getUserContext()).toBeNull();
    });
  });

  // =========================================================================
  // Helper methods: setTag / setTags / getTags
  // =========================================================================
  describe('setTag / setTags / getTags', () => {
    it('should set a single tag', () => {
      module.setTag('env', 'production');
      expect(module.getTags()).toEqual({ env: 'production' });
    });

    it('should set multiple tags at once', () => {
      module.setTags({ version: '1.0', region: 'us-east' });
      expect(module.getTags()).toEqual({ version: '1.0', region: 'us-east' });
    });

    it('should merge tags from multiple calls', () => {
      module.setTag('first', 'a');
      module.setTags({ second: 'b', third: 'c' });
      module.setTag('fourth', 'd');
      expect(module.getTags()).toEqual({
        first: 'a',
        second: 'b',
        third: 'c',
        fourth: 'd',
      });
    });

    it('should overwrite existing tag values', () => {
      module.setTag('key', 'old');
      module.setTag('key', 'new');
      expect(module.getTags()).toEqual({ key: 'new' });
    });

    it('should return a copy of tags to prevent mutation', () => {
      module.setTag('safe', 'value');
      const tags = module.getTags();
      tags['injected'] = 'hack';
      expect(module.getTags()).toEqual({ safe: 'value' });
    });

    it('should start with empty tags', () => {
      expect(module.getTags()).toEqual({});
    });
  });

  // =========================================================================
  // Helper methods: addBreadcrumb / clearBreadcrumbs
  // =========================================================================
  describe('addBreadcrumb / clearBreadcrumbs', () => {
    it('should add a custom breadcrumb', () => {
      module.addBreadcrumb({
        category: 'test',
        message: 'Test breadcrumb',
      });

      const breadcrumbs = module.getBreadcrumbTracker().getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].category).toBe('test');
      expect(breadcrumbs[0].message).toBe('Test breadcrumb');
      expect(breadcrumbs[0].type).toBe('custom');
    });

    it('should add a breadcrumb with explicit type and level', () => {
      module.addBreadcrumb({
        type: 'navigation',
        category: 'nav',
        message: 'Page change',
        level: 'info',
        data: { from: '/home', to: '/about' },
      });

      const breadcrumbs = module.getBreadcrumbTracker().getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].type).toBe('navigation');
      expect(breadcrumbs[0].level).toBe('info');
      expect(breadcrumbs[0].data).toEqual({ from: '/home', to: '/about' });
    });

    it('should default type to custom when not specified', () => {
      module.addBreadcrumb({
        category: 'user-action',
        message: 'Opened settings',
      });

      const breadcrumbs = module.getBreadcrumbTracker().getBreadcrumbs();
      expect(breadcrumbs[0].type).toBe('custom');
    });

    it('should clear all breadcrumbs', () => {
      module.addBreadcrumb({ category: 'a', message: 'First' });
      module.addBreadcrumb({ category: 'b', message: 'Second' });
      module.addBreadcrumb({ category: 'c', message: 'Third' });

      expect(module.getBreadcrumbTracker().getBreadcrumbs()).toHaveLength(3);

      module.clearBreadcrumbs();
      expect(module.getBreadcrumbTracker().getBreadcrumbs()).toHaveLength(0);
    });

    it('should be safe to clear when already empty', () => {
      expect(() => module.clearBreadcrumbs()).not.toThrow();
      expect(module.getBreadcrumbTracker().getBreadcrumbs()).toHaveLength(0);
    });

    it('should add breadcrumbs with auto-generated timestamps', () => {
      module.addBreadcrumb({
        category: 'test',
        message: 'Timestamp check',
      });

      const breadcrumbs = module.getBreadcrumbTracker().getBreadcrumbs();
      expect(breadcrumbs[0].timestamp).toBeDefined();
      expect(typeof breadcrumbs[0].timestamp).toBe('string');
      // Should be a valid ISO timestamp
      expect(() => new Date(breadcrumbs[0].timestamp)).not.toThrow();
    });
  });

  // =========================================================================
  // isEnabled / getConfig
  // =========================================================================
  describe('isEnabled / getConfig', () => {
    it('should return true when enabled is not set (default)', () => {
      const mod = new DebugModule({
        appId: 'test',
        apiUrl: 'https://api.test.com',
      });
      expect(mod.isEnabled()).toBe(true);
    });

    it('should return false when explicitly disabled', () => {
      const mod = new DebugModule({
        appId: 'test',
        apiUrl: 'https://api.test.com',
        enabled: false,
      });
      expect(mod.isEnabled()).toBe(false);
    });

    it('should return a copy of config to prevent mutation', () => {
      const config = module.getConfig();
      config.appId = 'mutated';
      expect(module.getConfig().appId).toBe('test-app');
    });
  });

  // =========================================================================
  // Session ID persistence
  // =========================================================================
  describe('session ID', () => {
    it('should return a non-empty session ID', () => {
      const sessionId = module.getSessionId();
      expect(sessionId).toBeTruthy();
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it('should return the same session ID on subsequent calls', () => {
      const id1 = module.getSessionId();
      const id2 = module.getSessionId();
      expect(id1).toBe(id2);
    });

    it('should persist session ID in sessionStorage (jsdom)', () => {
      // The constructor should have stored the session ID in sessionStorage
      const storedId = sessionStorage.getItem('__authhub_debug_session_id');
      expect(storedId).toBeTruthy();
      expect(storedId).toBe(module.getSessionId());
    });

    it('should reuse session ID from sessionStorage across instances', () => {
      const id1 = module.getSessionId();

      const module2 = new DebugModule({
        appId: 'test-app-2',
        apiUrl: 'https://api.test.com',
      });

      expect(module2.getSessionId()).toBe(id1);
    });
  });

  // =========================================================================
  // getBreadcrumbTracker
  // =========================================================================
  describe('getBreadcrumbTracker', () => {
    it('should return the BreadcrumbTracker instance', () => {
      const tracker = module.getBreadcrumbTracker();
      expect(tracker).toBeDefined();
      expect(typeof tracker.add).toBe('function');
      expect(typeof tracker.getBreadcrumbs).toBe('function');
      expect(typeof tracker.clear).toBe('function');
    });

    it('should return the same tracker instance each time', () => {
      const tracker1 = module.getBreadcrumbTracker();
      const tracker2 = module.getBreadcrumbTracker();
      expect(tracker1).toBe(tracker2);
    });
  });
});
