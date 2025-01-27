/**
 * Core Interfaces Module
 * 
 * This module defines the core interfaces that establish contracts
 * between different parts of the application. These interfaces ensure
 * consistent implementation patterns and enable dependency injection.
 */

import { AuthConfig, AuthResult, TokenData } from '../types/auth.types';
import { GraphQLOperation, GraphQLResponse, BatchOperationResult } from '../types/graphql.types';
import { Result, RateLimitConfig, RetryConfig } from '../types/common.types';

export interface IAuthService {
  initialize(config: AuthConfig): Promise<void>;
  authenticate(): Promise<AuthResult>;
  refreshToken(): Promise<Result<TokenData>>;
  revokeToken(): Promise<Result<void>>;
  isAuthenticated(): boolean;
  getTokenData(): TokenData | undefined;
}

export interface IGraphQLService {
  execute<T = unknown>(
    operation: GraphQLOperation<T>
  ): Promise<GraphQLResponse<T>>;

  executeBatch<T = unknown>(
    operations: GraphQLOperation<T>[]
  ): Promise<BatchOperationResult<T>>;

  setRateLimit(config: RateLimitConfig): void;
  setRetryConfig(config: RetryConfig): void;
}

export interface IHttpClient {
  get<T>(url: string, options?: RequestInit): Promise<T>;
  post<T>(url: string, data: unknown, options?: RequestInit): Promise<T>;
  put<T>(url: string, data: unknown, options?: RequestInit): Promise<T>;
  delete<T>(url: string, options?: RequestInit): Promise<T>;
}

export interface ICacheService {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: Error, ...args: unknown[]): void;
}

export interface IConfigService<T = unknown> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K]): void;
  has<K extends keyof T>(key: K): boolean;
  delete<K extends keyof T>(key: K): void;
}
