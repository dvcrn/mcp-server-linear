/**
 * Authentication Types
 * 
 * Core type definitions for authentication-related functionality.
 */

export type AuthType = 'oauth' | 'pat';

export interface AuthCredentials {
  type: AuthType;
  value: string;
}

export interface OAuthCredentials extends AuthCredentials {
  type: 'oauth';
  code: string;
  redirectUri?: string;
}

export interface PATCredentials extends AuthCredentials {
  type: 'pat';
  token: string;
}

export interface AuthResult {
  success: boolean;
  accessToken?: string;  // Optional for intermediate states (like OAuth redirect)
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string[];
  error?: string;
  tokenData?: TokenData;
  authUrl?: string;
}

export interface TokenMetadata {
  userId: string;
  scope: string[];
  expiresAt: number;
  issuedAt: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  type: AuthType;
}

export type AccessToken = string & { __brand: 'AccessToken' };
export type RefreshToken = string & { __brand: 'RefreshToken' };

export interface TokenPair {
  accessToken: AccessToken;
  refreshToken: RefreshToken;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface TokenError {
  error: string;
  error_description?: string;
  error_uri?: string;
}

export interface AuthConfig {
  type: AuthType;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
  accessToken?: string;
}

export interface TokenManagerConfig {
  accessTokenTTL: number;
  refreshTokenTTL: number;
  clockTolerance: number;
}

// Re-export for backward compatibility
export type { AuthConfig as TokenConfig };

// Additional utility types
export interface AuthServiceConfig extends AuthConfig {
  tokenEndpoint?: string;
  authorizationEndpoint?: string;
  apiBaseUrl?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  error?: string;
  metadata?: TokenMetadata;
}

export interface TokenStorageData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  type: AuthType;
}
