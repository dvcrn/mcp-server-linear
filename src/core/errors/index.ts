/**
 * Core Errors Module
 * 
 * This module defines the base error types and error handling utilities
 * used throughout the application. It provides a consistent way to handle
 * and report errors across different features and layers.
 */

export class LinearError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LinearError';
    Object.setPrototypeOf(this, LinearError.prototype);
  }
}

export class AuthenticationError extends LinearError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class GraphQLError extends LinearError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'GRAPHQL_ERROR', details);
    this.name = 'GraphQLError';
    Object.setPrototypeOf(this, GraphQLError.prototype);
  }
}

export class ValidationError extends LinearError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class RateLimitError extends LinearError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', details);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class NetworkError extends LinearError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export function isLinearError(error: unknown): error is LinearError {
  return error instanceof LinearError;
}

export function createError(
  message: string,
  code: string,
  details?: Record<string, unknown>
): LinearError {
  switch (code) {
    case 'AUTH_ERROR':
      return new AuthenticationError(message, details);
    case 'GRAPHQL_ERROR':
      return new GraphQLError(message, details);
    case 'VALIDATION_ERROR':
      return new ValidationError(message, details);
    case 'RATE_LIMIT_ERROR':
      return new RateLimitError(message, details);
    case 'NETWORK_ERROR':
      return new NetworkError(message, details);
    default:
      return new LinearError(message, code, details);
  }
}
