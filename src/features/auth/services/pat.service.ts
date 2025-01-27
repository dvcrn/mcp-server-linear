/**
 * Personal Access Token Service
 * 
 * Handles authentication using Linear Personal Access Tokens.
 */

import { Logger } from '../../../utils/logger';
import { AuthConfig } from './auth.service';

export class PATService {
  private accessToken?: string;

  constructor(
    private readonly config: AuthConfig,
    private readonly logger: Logger
  ) {}

  /**
   * Initialize PAT authentication
   */
  async initialize(): Promise<void> {
    if (!this.config.token) {
      throw new Error('Personal access token is required');
    }

    if (!this.validateToken(this.config.token)) {
      throw new Error('Invalid token format');
    }

    this.accessToken = this.config.token;
    this.logger.info('PAT authentication initialized');
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Personal access token not initialized');
    }

    // Ensure token has Bearer prefix
    return this.accessToken.startsWith('Bearer ')
      ? this.accessToken
      : `Bearer ${this.accessToken}`;
  }

  /**
   * Clear stored token
   */
  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && this.validateToken(this.accessToken);
  }

  clearToken(): void {
    this.accessToken = undefined;
  }

  /**
   * Validate token format
   */
  private validateToken(token: string): boolean {
    // Linear PATs start with lin_oauth_ and are followed by 64 hex characters
    const tokenWithoutPrefix = token.replace('Bearer ', '');
    return /^lin_oauth_[a-f0-9]{64}$/.test(tokenWithoutPrefix);
  }
}
