/**
 * Tests for OAuth SDK Methods
 * Task: TASK-461
 * Feature: OAuth SDK Methods and Dashboard Integration
 */

import {
  getGoogleAuthUrl,
  getGitHubAuthUrl,
  parseOAuthCallbackResult,
  OAuthProvider,
} from '../oauth';
import type { OAuthCallbackResult } from '../oauth';

describe('OAuth SDK Methods', () => {
  const baseUrl = 'https://authhub.example.com';
  const appId = 'app_test123';

  describe('getGoogleAuthUrl', () => {
    it('should generate Google OAuth URL with correct base URL and endpoint', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGoogleAuthUrl(baseUrl, appId, redirectUri);

      expect(url).toContain(`${baseUrl}/api/v1/auth/oauth/google`);
    });

    it('should include redirect_uri parameter', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGoogleAuthUrl(baseUrl, appId, redirectUri);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('redirect_uri')).toBe(redirectUri);
    });

    it('should include app_id parameter', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGoogleAuthUrl(baseUrl, appId, redirectUri);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('app_id')).toBe(appId);
    });

    it('should include optional state parameter when provided', () => {
      const redirectUri = 'https://myapp.com/callback';
      const state = 'random_state_value';
      const url = getGoogleAuthUrl(baseUrl, appId, redirectUri, { state });
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('state')).toBe(state);
    });

    it('should not include state parameter when not provided', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGoogleAuthUrl(baseUrl, appId, redirectUri);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.has('state')).toBe(false);
    });

    it('should encode special characters in redirect_uri', () => {
      const redirectUri = 'https://myapp.com/callback?foo=bar&baz=qux';
      const url = getGoogleAuthUrl(baseUrl, appId, redirectUri);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('redirect_uri')).toBe(redirectUri);
    });

    it('should handle baseUrl with trailing slash', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGoogleAuthUrl(`${baseUrl}/`, appId, redirectUri);

      expect(url).toContain(`${baseUrl}/api/v1/auth/oauth/google`);
      expect(url).not.toContain('//api');
    });
  });

  describe('getGitHubAuthUrl', () => {
    it('should generate GitHub OAuth URL with correct base URL and endpoint', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGitHubAuthUrl(baseUrl, appId, redirectUri);

      expect(url).toContain(`${baseUrl}/api/v1/auth/oauth/github`);
    });

    it('should include redirect_uri parameter', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGitHubAuthUrl(baseUrl, appId, redirectUri);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('redirect_uri')).toBe(redirectUri);
    });

    it('should include app_id parameter', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGitHubAuthUrl(baseUrl, appId, redirectUri);
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('app_id')).toBe(appId);
    });

    it('should include optional state parameter when provided', () => {
      const redirectUri = 'https://myapp.com/callback';
      const state = 'random_state_value';
      const url = getGitHubAuthUrl(baseUrl, appId, redirectUri, { state });
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('state')).toBe(state);
    });

    it('should handle baseUrl with trailing slash', () => {
      const redirectUri = 'https://myapp.com/callback';
      const url = getGitHubAuthUrl(`${baseUrl}/`, appId, redirectUri);

      expect(url).toContain(`${baseUrl}/api/v1/auth/oauth/github`);
      expect(url).not.toContain('//api');
    });
  });

  describe('parseOAuthCallbackResult', () => {
    it('should extract access_token from URL hash fragment', () => {
      const url = 'https://myapp.com/callback#access_token=abc123&token_type=Bearer&expires_in=3600';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.accessToken).toBe('abc123');
    });

    it('should extract refresh_token from URL hash fragment', () => {
      const url = 'https://myapp.com/callback#access_token=abc123&refresh_token=def456&token_type=Bearer';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.refreshToken).toBe('def456');
    });

    it('should extract token_type from URL hash fragment', () => {
      const url = 'https://myapp.com/callback#access_token=abc123&token_type=Bearer';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.tokenType).toBe('Bearer');
    });

    it('should extract expires_in from URL hash fragment', () => {
      const url = 'https://myapp.com/callback#access_token=abc123&token_type=Bearer&expires_in=3600';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.expiresIn).toBe(3600);
    });

    it('should extract state from URL hash fragment', () => {
      const url = 'https://myapp.com/callback#access_token=abc123&state=xyz789';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.state).toBe('xyz789');
    });

    it('should extract error from URL hash fragment', () => {
      const url = 'https://myapp.com/callback#error=access_denied&error_description=User%20denied%20access';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.error).toBe('access_denied');
      expect(result?.errorDescription).toBe('User denied access');
    });

    it('should return null for URL without hash fragment', () => {
      const url = 'https://myapp.com/callback';
      const result = parseOAuthCallbackResult(url);

      expect(result).toBeNull();
    });

    it('should return null for URL with empty hash fragment', () => {
      const url = 'https://myapp.com/callback#';
      const result = parseOAuthCallbackResult(url);

      expect(result).toBeNull();
    });

    it('should also check query parameters for code flow', () => {
      const url = 'https://myapp.com/callback?code=auth_code_123&state=xyz789';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.code).toBe('auth_code_123');
      expect(result?.state).toBe('xyz789');
    });

    it('should handle error in query parameters', () => {
      const url = 'https://myapp.com/callback?error=access_denied&error_description=User%20cancelled';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.error).toBe('access_denied');
      expect(result?.errorDescription).toBe('User cancelled');
    });

    it('should prefer hash fragment over query parameters for implicit flow', () => {
      const url = 'https://myapp.com/callback?code=query_code#access_token=hash_token';
      const result = parseOAuthCallbackResult(url);

      expect(result).not.toBeNull();
      expect(result?.accessToken).toBe('hash_token');
    });
  });

  describe('OAuthProvider enum', () => {
    it('should define Google provider', () => {
      expect(OAuthProvider.Google).toBe('google');
    });

    it('should define GitHub provider', () => {
      expect(OAuthProvider.GitHub).toBe('github');
    });
  });

  describe('Type safety', () => {
    it('should return properly typed OAuthCallbackResult', () => {
      const url = 'https://myapp.com/callback#access_token=abc123&token_type=Bearer&expires_in=3600';
      const result = parseOAuthCallbackResult(url);

      if (result) {
        // TypeScript compilation check - these should all be valid property accesses
        const token: string | undefined = result.accessToken;
        const refresh: string | undefined = result.refreshToken;
        const type: string | undefined = result.tokenType;
        const expires: number | undefined = result.expiresIn;
        const err: string | undefined = result.error;
        const errDesc: string | undefined = result.errorDescription;
        const state: string | undefined = result.state;
        const code: string | undefined = result.code;

        expect(token).toBe('abc123');
      }
    });
  });
});
