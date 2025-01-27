/**
 * Token Manager
 * 
 * Manages authentication tokens for Linear API.
 * Handles token storage, retrieval, and refresh.
 */

import { Logger } from '../../../utils/logger';

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export class TokenManager {
  private tokenData?: TokenData;

  constructor(private readonly logger: Logger) {}

  /**
   * Set token data
   */
  setTokenData(data: TokenData): void {
    this.tokenData = {
      ...data,
      expiresAt: data.expiresAt || this.calculateExpiryTime(),
    };
  }

  /**
   * Get access token
   */
  getAccessToken(): string | undefined {
    if (!this.tokenData || this.isTokenExpired()) {
      if (this.tokenData) {
        this.logger.warn('Access token has expired');
      }
      return undefined;
    }
    return this.tokenData.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | undefined {
    return this.tokenData?.refreshToken;
  }

  /**
   * Clear stored tokens
   */
  clearTokens(): void {
    this.tokenData = undefined;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (!this.tokenData?.expiresAt) {
      return true;
    }

    // Consider token expired 5 minutes before actual expiry
    const bufferTime = 5 * 60 * 1000;
    return Date.now() >= this.tokenData.expiresAt - bufferTime;
  }

  /**
   * Calculate token expiry time
   * Default to 1 hour from now if not provided
   */
  /**
   * Check if token is valid
   */
  hasValidToken(): boolean {
    return !!this.tokenData?.accessToken && !this.isTokenExpired();
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(): boolean {
    return !!this.tokenData?.refreshToken && this.isTokenExpired();
  }

  private calculateExpiryTime(expiresIn?: number): number {
    return Date.now() + (expiresIn || 60 * 60) * 1000; // Default to 1 hour
  }
}
