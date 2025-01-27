/**
 * OAuth Service
 * 
 * Handles OAuth 2.0 authentication flow for Linear API.
 */

import { Logger } from '../../../utils/logger';
import { ConfigService } from '../../../utils/config.service';
import { HttpClient } from '../../../infrastructure/http/http.client';
import { TokenManager } from './token.manager';
import { AuthConfig } from './auth.service';

interface OAuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class OAuthService {
  private readonly tokenManager: TokenManager;
  private readonly httpClient: HttpClient;

  constructor(
    private readonly config: AuthConfig,
    logger: Logger,
    private readonly configService: ConfigService
  ) {
    this.tokenManager = new TokenManager(logger);
    this.httpClient = new HttpClient({
      baseURL: 'https://api.linear.app',
      logger,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Initialize OAuth authentication
   */
  async initialize(): Promise<void> {
    const token = this.tokenManager.getAccessToken();
    if (!token && this.tokenManager.getRefreshToken()) {
      await this.refreshToken();
    }
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string> {
    const token = this.tokenManager.getAccessToken();
    if (!token) {
      if (this.tokenManager.getRefreshToken()) {
        await this.refreshToken();
        const newToken = this.tokenManager.getAccessToken();
        if (!newToken) {
          throw new Error('Failed to refresh access token');
        }
        return newToken;
      }
      throw new Error('No access token available');
    }
    return token;
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    if (!this.config.clientId || !this.config.redirectUri) {
      throw new Error('Client ID and redirect URI are required for OAuth');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read write',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://linear.app/oauth/authorize?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state?: string): Promise<void> {
    if (!this.config.clientId || !this.config.clientSecret || !this.config.redirectUri) {
      throw new Error('Client ID, client secret, and redirect URI are required for OAuth');
    }

    const formData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code,
    });

    const response = await this.httpClient.post<OAuthTokenResponse>(
      '/oauth/token',
      formData.toString()
    );

    this.tokenManager.setTokenData({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
    });
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(): Promise<void> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('Client ID and client secret are required for token refresh');
    }

    const refreshToken = this.tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const formData = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
    });

    const response = await this.httpClient.post<OAuthTokenResponse>(
      '/oauth/token',
      formData.toString()
    );

    this.tokenManager.setTokenData({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + response.data.expires_in * 1000,
    });
  }
}
