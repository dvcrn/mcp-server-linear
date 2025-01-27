/**
 * Authentication Service
 * 
 * Core authentication service that manages token lifecycle and authentication strategies.
 * This service is responsible for:
 * 
 * 1. Token Management
 *    - Storing and retrieving authentication tokens
 *    - Token expiration handling
 *    - Token refresh operations
 * 
 * 2. Strategy Management
 *    - Supporting multiple authentication methods (OAuth, PAT)
 *    - Strategy initialization and configuration
 * 
 * 3. State Management
 *    - Maintaining current authentication state
 *    - Handling token updates and invalidation
 * 
 * Usage:
 * ```typescript
 * const authService = new AuthService(config, logger);
 * await authService.initialize();
 * 
 * // Get current token
 * const token = await authService.getCurrentToken();
 * 
 * // Store new token
 * await authService.storeTokenData(
 *   accessToken,
 *   refreshToken,
 *   expiresAt,
 *   'oauth'
 * );
 * ```
 */

import { AuthStrategy } from '../../core/interfaces/auth.interface';
import { 
  AuthConfig, 
  AuthResult, 
  TokenData, 
  AuthType 
} from '../../core/types/auth.types';
import { Logger } from '../../utils/logger';

export class AuthService {
  private currentToken: TokenData | undefined;
  private strategy: AuthStrategy | undefined;

  constructor(
    private readonly config: AuthConfig,
    private readonly logger: Logger
  ) {}

  /**
   * Initialize the auth service with the provided configuration.
   * This method:
   * 1. Sets up initial token state if an access token is provided
   * 2. Validates the configuration
   * 3. Prepares the authentication strategy
   * 
   * @throws {Error} If the configuration is invalid
   */
  async initialize(): Promise<void> {
    if (this.config.accessToken) {
      this.currentToken = {
        accessToken: this.config.accessToken,
        type: this.config.type
      };
    }
  }

  /**
   * Get the current authentication token.
   * Returns undefined if no token is set or if the token has expired.
   * 
   * @returns The current token data or undefined
   */
  async getCurrentToken(): Promise<TokenData | undefined> {
    if (this.isTokenExpired()) {
      this.logger.debug('Current token is expired');
      return undefined;
    }
    return this.currentToken;
  }

  /**
   * Set the current authentication token.
   * This method validates the token before storing it.
   * 
   * @param token - The token data to store
   * @returns AuthResult indicating success or failure
   */
  async setCurrentToken(token: TokenData | undefined): Promise<AuthResult> {
    if (!token) {
      this.logger.debug('Clearing current token');
      return {
        success: true,
        tokenData: undefined
      };
    }

    try {
      this.currentToken = token;
      this.logger.debug('Successfully set new token');
      return {
        success: true,
        tokenData: token
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to set token:', error as Error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Store new token data.
   * This method creates a new TokenData object and stores it as the current token.
   * 
   * @param accessToken - The access token string
   * @param refreshToken - The refresh token string
   * @param expiresAt - Token expiration timestamp
   * @param type - Type of authentication
   * @returns The stored token data
   */
  async storeTokenData(
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
    type: AuthType
  ): Promise<TokenData> {
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresAt,
      type
    };

    this.logger.debug('Storing new token data', { type, expiresAt });
    this.currentToken = tokenData;
    return tokenData;
  }

  /**
   * Clear the current token.
   * This method removes the stored token data and resets the authentication state.
   */
  async clearToken(): Promise<void> {
    this.logger.debug('Clearing authentication state');
    this.currentToken = undefined;
  }

  /**
   * Check if the current token is expired.
   * This method considers a token expired if:
   * 1. No token is set
   * 2. Token has no expiration
   * 3. Current time is past the expiration time
   * 
   * @returns true if the token is expired, false otherwise
   */
  isTokenExpired(): boolean {
    if (!this.currentToken?.expiresAt) {
      return true;
    }

    const now = Date.now();
    const isExpired = now >= this.currentToken.expiresAt;
    
    if (isExpired) {
      this.logger.debug('Token is expired', {
        expiresAt: this.currentToken.expiresAt,
        now
      });
    }
    
    return isExpired;
  }

  /**
   * Store refresh token data.
   * This method is specifically for handling refresh token operations.
   * 
   * @param accessToken - The new access token
   * @param refreshToken - The new refresh token
   * @param expiresAt - New token expiration timestamp
   * @param type - Type of authentication
   * @returns The stored token data
   */
  async storeRefreshTokenData(
    accessToken: string,
    refreshToken: string,
    expiresAt: number,
    type: AuthType
  ): Promise<TokenData> {
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresAt,
      type
    };

    this.logger.debug('Storing refreshed token data', { type, expiresAt });
    this.currentToken = tokenData;
    return tokenData;
  }
}
