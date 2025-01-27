/**
 * OAuth Authentication Service
 * 
 * Implements OAuth 2.0 authentication flow for Linear API access.
 * Handles authorization, token exchange, and token refresh.
 * 
 * Responsibilities:
 * - OAuth authorization flow
 * - Token exchange
 * - Token refresh
 * - Token storage
 */

import { LinearClient } from '@linear/sdk';
import { IAuthService, IHttpClient, ILogger } from '../../core/interfaces';
import { AuthConfig, AuthResult, TokenData } from '../../core/types/auth.types';
import { Result } from '../../core/types/common.types';
import { AuthenticationError } from '../../core/errors';

export class OAuthService implements IAuthService {
  private static readonly AUTH_URL = 'https://linear.app/oauth/authorize';
  private static readonly TOKEN_URL = 'https://api.linear.app/oauth/token';
  private static readonly SCOPE = 'read,write,issues:create,offline_access';

  private config?: AuthConfig;
  private tokenData?: TokenData;
  private linearClient?: LinearClient;

  constructor(
    private readonly httpClient: IHttpClient,
    private readonly logger: ILogger
  ) {}

  public async initialize(config: AuthConfig): Promise<void> {
    if (config.type !== 'oauth') {
      throw new AuthenticationError('Invalid config type for OAuth service');
    }

    if (!config.clientId || !config.clientSecret || !config.redirectUri) {
      throw new AuthenticationError(
        'Missing required OAuth configuration: clientId, clientSecret, redirectUri'
      );
    }

    this.config = config;
  }

  public async authenticate(): Promise<AuthResult> {
    try {
      if (!this.config || this.config.type !== 'oauth') {
        throw new AuthenticationError('OAuth not initialized');
      }

      const params = new URLSearchParams({
        client_id: this.config.clientId!,
        redirect_uri: this.config.redirectUri!,
        response_type: 'code',
        scope: OAuthService.SCOPE,
        actor: 'application',
        state: this.generateState(),
        access_type: 'offline',
      });

      const authUrl = `${OAuthService.AUTH_URL}?${params.toString()}`;

      return {
        success: true,
        authUrl,
      };
    } catch (error) {
      this.logger.error('OAuth authentication failed:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async handleCallback(code: string): Promise<Result<TokenData>> {
    try {
      if (!this.config || this.config.type !== 'oauth') {
        throw new AuthenticationError('OAuth not initialized');
      }

      const response = await this.httpClient.post<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>(OAuthService.TOKEN_URL, {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });

      const tokenData: TokenData = {
        type: 'oauth',
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: Date.now() + response.expires_in * 1000,
      };

      this.tokenData = tokenData;
      this.linearClient = new LinearClient({
        accessToken: tokenData.accessToken,
      });

      return {
        success: true,
        data: tokenData,
      };
    } catch (error) {
      this.logger.error('OAuth token exchange failed:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Token exchange failed'),
      };
    }
  }

  public async refreshToken(): Promise<Result<TokenData>> {
    try {
      if (!this.config || !this.tokenData?.refreshToken) {
        throw new AuthenticationError('No refresh token available');
      }

      const response = await this.httpClient.post<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>(OAuthService.TOKEN_URL, {
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.tokenData.refreshToken,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });

      const tokenData: TokenData = {
        type: 'oauth',
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        expiresAt: Date.now() + response.expires_in * 1000,
      };

      this.tokenData = tokenData;
      this.linearClient = new LinearClient({
        accessToken: tokenData.accessToken,
      });

      return {
        success: true,
        data: tokenData,
      };
    } catch (error) {
      this.logger.error('Token refresh failed:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Token refresh failed'),
      };
    }
  }

  public async revokeToken(): Promise<Result<void>> {
    try {
      // Linear doesn't provide a token revocation endpoint
      // Just clear the local token data
      this.tokenData = undefined;
      this.linearClient = undefined;

      return { success: true };
    } catch (error) {
      this.logger.error('Token revocation failed:', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Token revocation failed'),
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

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
