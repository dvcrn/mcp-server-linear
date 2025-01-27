/**
 * Personal Access Token (PAT) Authentication Service
 * 
 * Implements authentication using Linear's Personal Access Tokens.
 * Provides a simpler alternative to OAuth for automated/scripted access.
 * 
 * Responsibilities:
 * - PAT validation
 * - Linear client initialization
 * - Token management
 */

import { LinearClient } from '@linear/sdk';
import { IAuthService, ILogger } from '../../core/interfaces';
import { AuthConfig, AuthResult, TokenData } from '../../core/types/auth.types';
import { Result } from '../../core/types/common.types';
import { AuthenticationError } from '../../core/errors';

export class PersonalAccessTokenService implements IAuthService {
  private config?: AuthConfig;
  private tokenData?: TokenData;
  private linearClient?: LinearClient;

  constructor(private readonly logger: ILogger) {}

  public async initialize(config: AuthConfig): Promise<void> {
    if (config.type !== 'pat') {
      throw new AuthenticationError('Invalid config type for PAT service');
    }

    if (!config.accessToken) {
      throw new AuthenticationError('Missing access token for PAT authentication');
    }

    this.config = config;
    await this.setupClient(config.accessToken);
  }

  public async authenticate(): Promise<AuthResult> {
    try {
      if (!this.config || this.config.type !== 'pat') {
        throw new AuthenticationError('PAT not initialized');
      }

      // Verify the token by making a test API call
      const client = this.getClient();
      await client.viewer;

      return {
        success: true,
        tokenData: this.tokenData
      };
    } catch (error) {
      this.logger.error('PAT authentication failed:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public async refreshToken(): Promise<Result<TokenData>> {
    // PATs don't need to be refreshed
    if (!this.tokenData) {
      return {
        success: false,
        error: new AuthenticationError('No token data available')
      };
    }

    return {
      success: true,
      data: this.tokenData
    };
  }

  public async revokeToken(): Promise<Result<void>> {
    try {
      // Linear doesn't provide a PAT revocation endpoint
      // Just clear the local token data
      this.tokenData = undefined;
      this.linearClient = undefined;

      return { success: true };
    } catch (error) {
      this.logger.error('Token revocation failed:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Token revocation failed')
      };
    }
  }

  public isAuthenticated(): boolean {
    return !!this.linearClient && !!this.tokenData;
  }

  public getTokenData(): TokenData | undefined {
    return this.tokenData;
  }

  public getClient(): LinearClient {
    if (!this.linearClient) {
      throw new AuthenticationError('Linear client not initialized');
    }
    return this.linearClient;
  }

  private async setupClient(accessToken: string): Promise<void> {
    try {
      if (!this.config || this.config.type !== 'pat') {
        throw new AuthenticationError('PAT not initialized');
      }

      this.tokenData = {
        type: 'pat',
        accessToken: accessToken,
        refreshToken: '',
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      };

      this.linearClient = new LinearClient({
        accessToken
      });

      // Verify the token works by making a test API call
      await this.linearClient.viewer;
    } catch (error) {
      this.logger.error('Failed to initialize Linear client:', error as Error);
      throw new AuthenticationError(
        'Invalid access token or Linear API unavailable'
      );
    }
  }
}
