/**
 * Tests for Debug Module Types
 * @task TASK-582
 * @feature FTR-124
 */

import { describe, it, expect } from 'vitest';
import type {
  CaptureStrategyName,
  DebugModuleConfig,
  CaptureOptions,
  CaptureResult,
  UserContext,
  CaptureEvent,
  RequestFn,
} from '../types.js';
import type { Breadcrumb } from '../types.js';

describe('Debug Module Types', () => {
  describe('CaptureStrategyName', () => {
    it('should include all 4 capture strategies', () => {
      // Type-level validation: all 4 strategies are valid
      const strategies: CaptureStrategyName[] = [
        'semantic-dom',
        'synthetic-screenshot',
        'aom-tree',
        'ast-capture',
      ];
      expect(strategies).toHaveLength(4);
    });

    it('should accept each strategy name individually', () => {
      const semanticDom: CaptureStrategyName = 'semantic-dom';
      const syntheticScreenshot: CaptureStrategyName = 'synthetic-screenshot';
      const aomTree: CaptureStrategyName = 'aom-tree';
      const astCapture: CaptureStrategyName = 'ast-capture';

      expect(semanticDom).toBe('semantic-dom');
      expect(syntheticScreenshot).toBe('synthetic-screenshot');
      expect(aomTree).toBe('aom-tree');
      expect(astCapture).toBe('ast-capture');
    });
  });

  describe('DebugModuleConfig', () => {
    it('should exist and have required fields', () => {
      const config: DebugModuleConfig = {
        appId: 'test-app-id',
        apiUrl: 'https://api.example.com',
      };
      expect(config.appId).toBe('test-app-id');
      expect(config.apiUrl).toBe('https://api.example.com');
    });

    it('should accept optional configuration fields', () => {
      const config: DebugModuleConfig = {
        appId: 'test-app-id',
        apiUrl: 'https://api.example.com',
        strategies: ['semantic-dom', 'aom-tree'],
        maxBreadcrumbs: 100,
        sampleRate: 0.5,
        enabled: true,
        environment: 'production',
        release: '1.0.0',
        beforeCapture: (event) => event,
        request: async () => ({ ok: true, json: async () => ({}) } as Response),
      };

      expect(config.strategies).toEqual(['semantic-dom', 'aom-tree']);
      expect(config.maxBreadcrumbs).toBe(100);
      expect(config.sampleRate).toBe(0.5);
      expect(config.enabled).toBe(true);
      expect(config.environment).toBe('production');
      expect(config.release).toBe('1.0.0');
      expect(config.beforeCapture).toBeDefined();
      expect(config.request).toBeDefined();
    });

    it('should have all fields be optional except appId and apiUrl', () => {
      const minimalConfig: DebugModuleConfig = {
        appId: 'app-123',
        apiUrl: 'https://debug.api.com',
      };

      expect(minimalConfig.strategies).toBeUndefined();
      expect(minimalConfig.maxBreadcrumbs).toBeUndefined();
      expect(minimalConfig.sampleRate).toBeUndefined();
      expect(minimalConfig.enabled).toBeUndefined();
    });
  });

  describe('CaptureOptions', () => {
    it('should exist as an interface', () => {
      const options: CaptureOptions = {};
      expect(options).toBeDefined();
    });

    it('should accept per-capture settings', () => {
      const options: CaptureOptions = {
        strategies: ['synthetic-screenshot'],
        tags: { component: 'LoginForm', action: 'submit' },
        extra: { userId: 'anon-123' },
        level: 'error',
        fingerprint: ['login', 'submit-error'],
      };

      expect(options.strategies).toEqual(['synthetic-screenshot']);
      expect(options.tags).toHaveProperty('component', 'LoginForm');
      expect(options.extra).toHaveProperty('userId', 'anon-123');
      expect(options.level).toBe('error');
      expect(options.fingerprint).toEqual(['login', 'submit-error']);
    });

    it('should allow all fields to be optional', () => {
      const emptyOptions: CaptureOptions = {};
      expect(emptyOptions.strategies).toBeUndefined();
      expect(emptyOptions.tags).toBeUndefined();
      expect(emptyOptions.extra).toBeUndefined();
    });
  });

  describe('CaptureResult', () => {
    it('should have id, errorHash, isNewError, and occurrenceCount', () => {
      const result: CaptureResult = {
        id: 'capture-uuid-12345',
        errorHash: 'sha256-abc123',
        isNewError: true,
        occurrenceCount: 1,
      };

      expect(result.id).toBe('capture-uuid-12345');
      expect(result.errorHash).toBe('sha256-abc123');
      expect(result.isNewError).toBe(true);
      expect(result.occurrenceCount).toBe(1);
    });

    it('should represent a known error with occurrence count', () => {
      const result: CaptureResult = {
        id: 'capture-uuid-67890',
        errorHash: 'sha256-def456',
        isNewError: false,
        occurrenceCount: 42,
      };

      expect(result.isNewError).toBe(false);
      expect(result.occurrenceCount).toBe(42);
    });
  });

  describe('UserContext', () => {
    it('should have id field only (no PII)', () => {
      const userContext: UserContext = {
        id: 'anonymous-user-uuid-12345',
      };

      expect(userContext.id).toBe('anonymous-user-uuid-12345');
    });

    it('should only contain anonymous identifier', () => {
      // Type-level check: UserContext should only have id
      const user: UserContext = {
        id: 'anon-id-789',
      };

      // Verify the object keys only include 'id'
      const keys = Object.keys(user);
      expect(keys).toEqual(['id']);
    });
  });

  describe('CaptureEvent', () => {
    it('should have error, capture, context, and breadcrumbs fields', () => {
      const mockBreadcrumbs: Breadcrumb[] = [
        {
          type: 'click',
          category: 'ui',
          message: 'Button clicked',
          timestamp: new Date().toISOString(),
        },
      ];

      const event: CaptureEvent = {
        error: {
          name: 'TypeError',
          message: 'Cannot read property of undefined',
          stack: 'TypeError: Cannot read property...\n    at foo (file.js:10:5)',
        },
        capture: {
          strategies: ['semantic-dom'],
          timestamp: new Date().toISOString(),
          data: {},
        },
        context: {
          user: { id: 'anon-123' },
          tags: { environment: 'production' },
        },
        breadcrumbs: mockBreadcrumbs,
      };

      expect(event.error).toBeDefined();
      expect(event.error.name).toBe('TypeError');
      expect(event.error.message).toBe('Cannot read property of undefined');
      expect(event.capture).toBeDefined();
      expect(event.context).toBeDefined();
      expect(event.breadcrumbs).toHaveLength(1);
    });

    it('should include error serialization properties', () => {
      const event: CaptureEvent = {
        error: {
          name: 'ReferenceError',
          message: 'foo is not defined',
          stack: 'ReferenceError: foo is not defined',
          cause: 'unknown variable',
        },
        capture: {
          strategies: ['aom-tree'],
          timestamp: new Date().toISOString(),
          data: {},
        },
        context: {
          tags: {},
        },
        breadcrumbs: [],
      };

      expect(event.error.name).toBe('ReferenceError');
      expect(event.error.cause).toBe('unknown variable');
    });

    it('should allow optional user context', () => {
      const event: CaptureEvent = {
        error: {
          name: 'Error',
          message: 'Test error',
        },
        capture: {
          strategies: [],
          timestamp: new Date().toISOString(),
          data: {},
        },
        context: {
          tags: {},
        },
        breadcrumbs: [],
      };

      expect(event.context.user).toBeUndefined();
    });
  });

  describe('RequestFn', () => {
    it('should be a function type', () => {
      // RequestFn should be a function that takes url and options and returns Promise<Response>
      const mockRequestFn: RequestFn = async (url, options) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      };

      expect(typeof mockRequestFn).toBe('function');
    });

    it('should accept URL and RequestInit parameters', async () => {
      const mockRequestFn: RequestFn = async (url, options) => {
        expect(url).toBe('https://api.example.com/capture');
        expect(options?.method).toBe('POST');
        expect(options?.body).toBeDefined();

        return new Response(JSON.stringify({ id: 'capture-123' }), {
          status: 200,
        });
      };

      const response = await mockRequestFn('https://api.example.com/capture', {
        method: 'POST',
        body: JSON.stringify({ error: 'test' }),
      });

      expect(response.status).toBe(200);
    });

    it('should return a Promise that resolves to Response', async () => {
      const mockRequestFn: RequestFn = async () => {
        return new Response('OK');
      };

      const result = mockRequestFn('https://api.example.com', {});

      // Verify it returns a Promise
      expect(result).toBeInstanceOf(Promise);

      // Verify the resolved value is a Response
      const response = await result;
      expect(response).toBeInstanceOf(Response);
    });
  });
});
