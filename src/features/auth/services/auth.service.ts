/**
 * Auth Service
 * 
 * Provides authentication functionality for Linear API.
 * Supports both Personal Access Token (PAT) and OAuth authentication.
 */

import { Logger } from '../../../utils/logger.js';
import { ConfigService } from '../../../utils/config.service.js';
import { TokenManager } from './token.manager.js';
import { OAuthService } from './oauth.service.js';
import { PATService } from './pat.service.js';
import { LinearError } from '../../../core/types/linear.types.js';
import { GraphQLClient } from '../../../infrastructure/graphql/graphql.client.js';

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthConfig {
  type: 'pat' | 'oauth';
  token?: string;
  accessToken?: string;  // For backward compatibility
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export class AuthService {
  public readonly tokenManager: TokenManager;
  private client?: GraphQLClient;
  private readonly oauthService: OAuthService;
  private readonly patService: PATService;

  constructor(
    private readonly config: AuthConfig,
    private readonly logger: Logger,
    private readonly configService: ConfigService
  ) {
    // Handle backward compatibility for accessToken
    if (config.accessToken && !config.token) {
      config.token = config.accessToken;
    }
    this.tokenManager = new TokenManager(logger);
    this.oauthService = new OAuthService(config, logger, configService);
    this.patService = new PATService(config, logger);

    // Initialize token manager with PAT if available
    if (config.type === 'pat' && config.token) {
      this.tokenManager.setTokenData({
        accessToken: config.token,
      });
    }
  }

  /**
   * Initialize authentication
   */
  async initialize(config?: AuthConfig): Promise<void> {
    if (config) {
      // Handle backward compatibility for accessToken
      if (config.accessToken && !config.token) {
        config.token = config.accessToken;
      }
      Object.assign(this.config, config);

      // Initialize token manager with PAT if available
      if (config.type === 'pat' && config.token) {
        this.tokenManager.setTokenData({
          accessToken: config.token,
        });
      }
    }

    try {
      switch (this.config.type) {
        case 'pat':
          await this.patService.initialize();
          break;
        case 'oauth':
          await this.oauthService.initialize();
          break;
        default:
          throw new Error(`Unsupported auth type: ${this.config.type}`);
      }
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to initialize auth', linearError);
      throw linearError;
    }
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string> {
    try {
      switch (this.config.type) {
        case 'pat':
          return await this.patService.getAccessToken();
        case 'oauth':
          return await this.oauthService.getAccessToken();
        default:
          throw new Error(`Unsupported auth type: ${this.config.type}`);
      }
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get access token', linearError);
      throw linearError;
    }
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(): Promise<void> {
    if (this.config.type !== 'oauth') {
      throw new Error('Token refresh is only supported for OAuth authentication');
    }

    try {
      await this.oauthService.refreshToken();
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to refresh token', linearError);
      throw linearError;
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    if (this.config.type !== 'oauth') {
      throw new Error('Authorization URL is only available for OAuth authentication');
    }

    return this.oauthService.getAuthorizationUrl(state);
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state?: string): Promise<void> {
    if (this.config.type !== 'oauth') {
      throw new Error('Callback handling is only available for OAuth authentication');
    }

    try {
      await this.oauthService.handleCallback(code, state);
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to handle OAuth callback', linearError);
      throw linearError;
    }
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    switch (this.config.type) {
      case 'pat':
        return this.patService.isAuthenticated();
      case 'oauth':
        return this.tokenManager.hasValidToken();
      default:
        return false;
    }
  }

  /**
   * Check if token needs refresh
   */
  needsTokenRefresh(): boolean {
    switch (this.config.type) {
      case 'pat':
        return false; // PAT tokens never need refresh
      case 'oauth':
        return this.tokenManager.needsRefresh();
      default:
        return false;
    }
  }

  /**
   * Get GraphQL client
   */
  async getClient(): Promise<GraphQLClient> {
    if (!this.client) {
      let token: string;
      if (this.config.type === 'pat') {
        token = await this.patService.getAccessToken();
      } else {
        token = await this.oauthService.getAccessToken();
      }

      if (!token) {
        throw new Error('No valid token available');
      }

      // Remove Bearer prefix if present
      const cleanToken = token.replace('Bearer ', '');

      this.client = new GraphQLClient({
        auth: {
          type: this.config.type,
          token: cleanToken,
        },
        logger: this.logger,
        config: this.configService,
      });
    }
    return this.client;
  }

  /**
   * Set token data for testing
   */
  setTokenData(data: TokenData): void {
    this.tokenManager.setTokenData(data);
  }

  /**
   * Convert unknown error to LinearError
   */
  private toLinearError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    return new Error(String(error));
  }
}
