/**
 * Authentication Interfaces
 * 
 * Defines the core contracts for authentication strategies and services.
 */

import { AuthCredentials, AuthResult, RefreshToken, AccessToken } from '../types/auth.types';

export interface AuthStrategy {
  authenticate(credentials: AuthCredentials): Promise<AuthResult>;
  refreshToken(token: RefreshToken): Promise<AuthResult>;
  revokeToken(token: AccessToken): Promise<void>;
}

export interface TokenManager {
  validateToken(token: string): Promise<boolean>;
  decodeToken(token: string): Promise<Record<string, unknown>>;
  isTokenExpired(token: string): boolean;
}

export interface AuthenticationProvider {
  getStrategy(type: 'oauth' | 'pat'): AuthStrategy;
  getCurrentToken(): Promise<string | null>;
  clearToken(): Promise<void>;
}
