import { jest } from '@jest/globals';
import type { LinearClient } from '@linear/sdk';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export type MockGraphQLResponse<T = any> = {
  data: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
};

// Create a partial mock of the Linear client
const mockLinearClient = {
  client: {
    rawRequest: jest.fn().mockImplementation(async () => ({ data: {} })),
    url: '',
    options: {},
    request: jest.fn(),
    setHeaders: jest.fn(),
    setHeader: jest.fn(),
  },
  _request: jest.fn(),
  _requestRaw: jest.fn(),
  _requestBatched: jest.fn(),
  _requestBatchedRaw: jest.fn(),
  _requestWithAuth: jest.fn(),
  _requestWithAuthRaw: jest.fn(),
  _requestWithAuthBatched: jest.fn(),
  _requestWithAuthBatchedRaw: jest.fn(),
  _requestWithoutAuth: jest.fn(),
  _requestWithoutAuthRaw: jest.fn(),
  _requestWithoutAuthBatched: jest.fn(),
  _requestWithoutAuthBatchedRaw: jest.fn(),
  _requestWithoutAuthBatchedRawWithHeaders: jest.fn(),
  _requestWithoutAuthBatchedWithHeaders: jest.fn(),
  _requestWithoutAuthRawWithHeaders: jest.fn(),
  _requestWithoutAuthWithHeaders: jest.fn(),
  _requestWithAuthBatchedRawWithHeaders: jest.fn(),
  _requestWithAuthBatchedWithHeaders: jest.fn(),
  _requestWithAuthRawWithHeaders: jest.fn(),
  _requestWithAuthWithHeaders: jest.fn(),
} as const;

// Mock the Linear SDK
jest.mock('@linear/sdk', () => ({
  LinearClient: jest.fn(() => mockLinearClient)
}));

// Export mock for use in tests
export const getMockLinearClient = () => ({
  ...mockLinearClient,
  client: {
    ...mockLinearClient.client,
    rawRequest: jest.fn().mockImplementation(async () => ({ data: {} }))
  }
});
