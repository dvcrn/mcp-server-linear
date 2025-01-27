import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { LinearAuth } from '../auth';

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockClear();
});

describe('LinearAuth', () => {
  let auth: LinearAuth;

  beforeEach(() => {
    auth = new LinearAuth();
  });

  describe('initialize', () => {

    it('should initialize with valid Personal Access Token', async () => {
      await auth.initialize({
        type: 'pat',
        token: 'lin_oauth_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      });

      expect(auth.isAuthenticated()).toBe(true);
      expect(auth.needsTokenRefresh()).toBe(false);
    });

    it('should throw error when token is missing', async () => {
      await expect(auth.initialize({
        type: 'pat'
      } as any)).rejects.toThrow('Personal access token is required');
    });
  });

  describe('PAT Authentication', () => {
    beforeEach(async () => {
      await auth.initialize({
        type: 'pat',
        token: 'lin_oauth_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      });
    });

    it('should be authenticated with valid token', () => {
      expect(auth.isAuthenticated()).toBe(true);
    });

    it('should never need token refresh', () => {
      expect(auth.needsTokenRefresh()).toBe(false);
    });

    it('should throw error when trying to refresh token', async () => {
      await expect(auth.refreshToken()).rejects.toThrow();
    });

    it('should throw error when trying to get authorization URL', () => {
      expect(() => {
        auth.getAuthorizationUrl();
      }).toThrow();
    });

    it('should throw error when trying to handle callback', async () => {
      await expect(auth.handleCallback('test-code')).rejects.toThrow();
    });
  });
});
