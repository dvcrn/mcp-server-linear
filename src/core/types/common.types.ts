/**
 * Common Types
 * 
 * Shared type definitions used across the application.
 */

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Connection<T> {
  nodes: T[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface Node {
  id: string;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface SortOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface PaginationInput {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface FilterInput {
  [key: string]: unknown;
}

export interface SortInput {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface BaseError {
  message: string;
  code?: string;
  name?: string;
}

export interface ValidationError extends BaseError {
  field: string;
  value?: unknown;
}

export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: BaseError;
}

export interface BatchResult<T> {
  success: boolean;
  results: Array<OperationResult<T>>;
  errors?: BaseError[];
}

export interface Result<T = void> {
  success: boolean;
  data?: T;
  error?: BaseError;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
  delayAfterExceeded?: number;
}

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
  retryableErrors?: string[];
}

export interface TimeoutConfig {
  enabled: boolean;
  timeoutMs: number;
  retryOnTimeout?: boolean;
}

export interface CacheConfig {
  enabled: boolean;
  maxAge: number;
  staleWhileRevalidate?: number;
  maxEntries?: number;
}

export interface LogConfig {
  level: string;
  format: string;
  destination: string;
  metadata?: Record<string, unknown>;
}

export interface NetworkConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: TimeoutConfig;
  rateLimit?: RateLimitConfig;
  retry?: RetryConfig;
  cache?: CacheConfig;
}

export interface ServiceConfig {
  network?: NetworkConfig;
  log?: LogConfig;
  [key: string]: unknown;
}
