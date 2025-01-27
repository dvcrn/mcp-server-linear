/**
 * Test Utilities
 * 
 * Provides simplified mocking utilities for tests with basic type safety.
 * Focuses on essential interfaces and runtime behavior.
 */

import { jest } from '@jest/globals';
import type { LinearClient } from '@linear/sdk';
import { GraphQLResponse } from '../core/types/graphql.types';

// Re-export the core GraphQLResponse type
export type { GraphQLResponse as MockResponse };

// Define a more specific mock type that matches Jest's internal types
export type JestMockWithImplementation<TReturn = any> = {
  new (...args: any[]): TReturn;
  (...args: any[]): TReturn;
  mockImplementation(fn: (...args: any[]) => TReturn): JestMockWithImplementation<TReturn>;
  mockImplementationOnce(fn: (...args: any[]) => TReturn): JestMockWithImplementation<TReturn>;
  mockReturnValue(value: TReturn): JestMockWithImplementation<TReturn>;
  mockReturnValueOnce(value: TReturn): JestMockWithImplementation<TReturn>;
  mockResolvedValue<T = TReturn>(value: Awaited<T>): JestMockWithImplementation<Promise<T>>;
  mockResolvedValueOnce<T = TReturn>(value: Awaited<T>): JestMockWithImplementation<Promise<T>>;
  mockRejectedValue(value: unknown): JestMockWithImplementation<TReturn>;
  mockRejectedValueOnce(value: unknown): JestMockWithImplementation<TReturn>;
  mockClear(): void;
  mockReset(): void;
  mockRestore(): void;
  getMockName(): string;
  mock: {
    calls: any[][];
    instances: any[];
    invocationCallOrder: number[];
    results: { type: string; value: any }[];
  };
};

export interface MockGraphQLClient {
  rawRequest: JestMockWithImplementation<Promise<GraphQLResponse<any>>>;
  request: JestMockWithImplementation;
  setHeaders: JestMockWithImplementation;
  setHeader: JestMockWithImplementation;
}

export type MockLinearClient = {
  client: MockGraphQLClient;
  _request?: JestMockWithImplementation;
  _requestRaw?: JestMockWithImplementation;
  _requestBatched?: JestMockWithImplementation;
  _requestBatchedRaw?: JestMockWithImplementation;
  _requestWithAuth?: JestMockWithImplementation;
  _requestWithAuthRaw?: JestMockWithImplementation;
  _requestWithAuthBatched?: JestMockWithImplementation;
  _requestWithAuthBatchedRaw?: JestMockWithImplementation;
  _requestWithoutAuth?: JestMockWithImplementation;
  _requestWithoutAuthRaw?: JestMockWithImplementation;
  _requestWithoutAuthBatched?: JestMockWithImplementation;
  _requestWithoutAuthBatchedRaw?: JestMockWithImplementation;
  _requestWithoutAuthBatchedRawWithHeaders?: JestMockWithImplementation;
  _requestWithoutAuthBatchedWithHeaders?: JestMockWithImplementation;
  _requestWithoutAuthRawWithHeaders?: JestMockWithImplementation;
  _requestWithoutAuthWithHeaders?: JestMockWithImplementation;
  _requestWithAuthBatchedRawWithHeaders?: JestMockWithImplementation;
  _requestWithAuthBatchedWithHeaders?: JestMockWithImplementation;
  _requestWithAuthRawWithHeaders?: JestMockWithImplementation;
  _requestWithAuthWithHeaders?: JestMockWithImplementation;
};

/**
 * Creates a mock Linear client with basic functionality
 * @returns A mocked Linear client for testing
 */
export function createMockLinearClient(): MockLinearClient {
  return {
    client: {
      rawRequest: jest.fn().mockImplementation(async () => ({ data: {} })) as JestMockWithImplementation<Promise<GraphQLResponse<any>>>,
      request: jest.fn() as JestMockWithImplementation,
      setHeaders: jest.fn() as JestMockWithImplementation,
      setHeader: jest.fn() as JestMockWithImplementation,
    },
    _request: jest.fn() as JestMockWithImplementation,
    _requestRaw: jest.fn() as JestMockWithImplementation,
    _requestBatched: jest.fn() as JestMockWithImplementation,
    _requestBatchedRaw: jest.fn() as JestMockWithImplementation,
    _requestWithAuth: jest.fn() as JestMockWithImplementation,
    _requestWithAuthRaw: jest.fn() as JestMockWithImplementation,
    _requestWithAuthBatched: jest.fn() as JestMockWithImplementation,
    _requestWithAuthBatchedRaw: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuth: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuthRaw: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuthBatched: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuthBatchedRaw: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuthBatchedRawWithHeaders: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuthBatchedWithHeaders: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuthRawWithHeaders: jest.fn() as JestMockWithImplementation,
    _requestWithoutAuthWithHeaders: jest.fn() as JestMockWithImplementation,
    _requestWithAuthBatchedRawWithHeaders: jest.fn() as JestMockWithImplementation,
    _requestWithAuthBatchedWithHeaders: jest.fn() as JestMockWithImplementation,
    _requestWithAuthRawWithHeaders: jest.fn() as JestMockWithImplementation,
    _requestWithAuthWithHeaders: jest.fn() as JestMockWithImplementation,
  };
}

/**
 * Creates a mock GraphQL response
 * @param data The response data
 * @param errors Optional error information
 * @returns A mocked GraphQL response
 */
export function createMockResponse<T>(data: T, errors?: Array<{ message: string; path?: string[] }>): GraphQLResponse<T> {
  return { data, errors };
}

/**
 * Type assertion helper for mock functions
 * @param mock The mock function to type
 * @returns The same mock function with proper typing
 */
export function asMockFunction<T = any>(mock: unknown): JestMockWithImplementation<T> {
  return mock as JestMockWithImplementation<T>;
}
