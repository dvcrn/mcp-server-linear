/**
 * Linear Auth
 * 
 * Main authentication module for Linear API.
 * Provides a unified interface for both PAT and OAuth authentication.
 */

import { Logger } from './utils/logger.js';
import { ConfigService } from './utils/config.service.js';
import { AuthService, AuthConfig } from './features/auth/services/auth.service.js';
import { GraphQLClient } from './infrastructure/graphql/graphql.client.js';
import { TokenData } from './features/auth/services/token.manager.js';

export class LinearAuth {
  private readonly authService: AuthService;

  private readonly logger: Logger;
  private readonly configService: ConfigService;

  constructor(
    logger: Logger = new Logger(),
    configService: ConfigService = new ConfigService()
  ) {
    this.logger = logger;
    this.configService = configService;
    this.authService = new AuthService({
      type: 'pat',
      token: '',
    }, this.logger, this.configService);
  }

  /**
   * Initialize authentication with config
   */
  async initialize(config: AuthConfig): Promise<void> {
    await this.authService.initialize(config);
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Check if token needs refresh
   */
  needsTokenRefresh(): boolean {
    return this.authService.needsTokenRefresh();
  }

  /**
   * Get GraphQL client
   */
  async getClient(): Promise<GraphQLClient> {
    return this.authService.getClient();
  }

  /**
   * Set token data for testing
   */
  setTokenData(data: TokenData): void {
    this.authService.setTokenData(data);
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string> {
    return this.authService.getAccessToken();
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(): Promise<void> {
    await this.authService.refreshToken();
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    return this.authService.getAuthorizationUrl(state);
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state?: string): Promise<void> {
    await this.authService.handleCallback(code, state);
  }
}

// Re-export types
export { AuthConfig } from './features/auth/services/auth.service.js';
