/**
 * AuthHub Error Classes Tests
 */

import { describe, it, expect } from 'vitest';
import {
  AuthHubError,
  AuthError,
  RateLimitError,
  ValidationError,
  NetworkError,
  ServerError,
  NotFoundError,
  parseApiError,
} from './index';

describe('Error Classes', () => {
  describe('AuthHubError', () => {
    it('should create error with correct properties', () => {
      const error = new AuthHubError('Test error', 'TEST_CODE', 500, { extra: 'data' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ extra: 'data' });
      expect(error.name).toBe('AuthHubError');
    });

    it('should be instanceof Error', () => {
      const error = new AuthHubError('Test', 'TEST', 500);
      expect(error).toBeInstanceOf(Error);
    });

    it('should provide hint based on code', () => {
      const authError = new AuthHubError('Auth failed', 'AUTH_ERROR', 401);
      expect(authError.hint).toContain('API key');

      const rateError = new AuthHubError('Rate limited', 'RATE_LIMIT', 429);
      expect(rateError.hint).toContain('rate limited');

      const validationError = new AuthHubError('Invalid', 'VALIDATION_ERROR', 400);
      expect(validationError.hint).toContain('parameters');

      const networkError = new AuthHubError('Network', 'NETWORK_ERROR');
      expect(networkError.hint).toContain('network');

      const unknownError = new AuthHubError('Unknown', 'UNKNOWN');
      expect(unknownError.hint).toContain('unexpected');
    });
  });

  describe('AuthError', () => {
    it('should create with default message', () => {
      const error = new AuthError();
      expect(error.message).toBe('Authentication failed');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthError');
    });

    it('should create with custom message', () => {
      const error = new AuthError('Invalid API key');
      expect(error.message).toBe('Invalid API key');
    });

    it('should be instanceof AuthHubError', () => {
      const error = new AuthError();
      expect(error).toBeInstanceOf(AuthHubError);
    });
  });

  describe('RateLimitError', () => {
    it('should create with default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });

    it('should include retryAfter', () => {
      const error = new RateLimitError('Too many requests', 60);
      expect(error.retryAfter).toBe(60);
    });

    it('should handle undefined retryAfter', () => {
      const error = new RateLimitError('Too many requests');
      expect(error.retryAfter).toBeUndefined();
    });
  });

  describe('ValidationError', () => {
    it('should create with default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should include field errors', () => {
      const error = new ValidationError('Invalid input', {
        email: 'Invalid format',
        password: 'Too short',
      });
      expect(error.fields).toEqual({
        email: 'Invalid format',
        password: 'Too short',
      });
    });
  });

  describe('NetworkError', () => {
    it('should create with default message', () => {
      const error = new NetworkError();
      expect(error.message).toBe('Network request failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBeUndefined();
      expect(error.name).toBe('NetworkError');
    });

    it('should default to transient', () => {
      const error = new NetworkError();
      expect(error.isTransient).toBe(true);
    });

    it('should allow non-transient errors', () => {
      const error = new NetworkError('DNS resolution failed', false);
      expect(error.isTransient).toBe(false);
    });
  });

  describe('ServerError', () => {
    it('should create with default message and status', () => {
      const error = new ServerError();
      expect(error.message).toBe('Internal server error');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ServerError');
    });

    it('should allow custom status code', () => {
      const error = new ServerError('Service unavailable', 503);
      expect(error.statusCode).toBe(503);
    });
  });

  describe('NotFoundError', () => {
    it('should create with default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should include resource type', () => {
      const error = new NotFoundError('User not found', 'user');
      expect(error.resource).toBe('user');
    });
  });

  describe('parseApiError', () => {
    it('should parse 400 as ValidationError', () => {
      const error = parseApiError(400, { error: { message: 'Invalid input' } });
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid input');
    });

    it('should parse 401 as AuthError', () => {
      const error = parseApiError(401, { error: { message: 'Invalid token' } });
      expect(error).toBeInstanceOf(AuthError);
      expect(error.message).toBe('Invalid token');
    });

    it('should parse 403 as AuthError with prefix', () => {
      const error = parseApiError(403, { error: { message: 'Forbidden' } });
      expect(error).toBeInstanceOf(AuthError);
      expect(error.message).toContain('Access denied');
    });

    it('should parse 404 as NotFoundError', () => {
      const error = parseApiError(404, { error: { message: 'Not found' } });
      expect(error).toBeInstanceOf(NotFoundError);
    });

    it('should parse 429 as RateLimitError', () => {
      const headers = new Headers({ 'Retry-After': '30' });
      const error = parseApiError(429, { error: { message: 'Rate limited' } }, headers);
      expect(error).toBeInstanceOf(RateLimitError);
      expect((error as RateLimitError).retryAfter).toBe(30);
    });

    it('should parse 500+ as ServerError', () => {
      const error = parseApiError(503, { error: { message: 'Service down' } });
      expect(error).toBeInstanceOf(ServerError);
      expect(error.statusCode).toBe(503);
    });

    it('should handle missing error object', () => {
      const error = parseApiError(500, {});
      expect(error.message).toContain('status 500');
    });

    it('should handle unknown status codes', () => {
      const error = parseApiError(418, { error: { message: "I'm a teapot" } });
      expect(error).toBeInstanceOf(AuthHubError);
      expect(error.statusCode).toBe(418);
    });
  });
});
