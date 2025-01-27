/**
 * GraphQL Client Tests
 * 
 * Tests the GraphQL client functionality.
 */

import { GraphQLClient } from '../infrastructure/graphql/graphql.client';
import { QueryBuilder } from '../infrastructure/graphql/query-builder';
import { Logger } from '../utils/logger';
import { LogLevel } from '../core/types/logger.types';

describe('GraphQLClient', () => {
  let client: GraphQLClient;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = new Logger(
      { level: LogLevel.ERROR },
      'json',
      'console'
    );

    client = new GraphQLClient({
      auth: {
        type: 'pat',
        token: 'test-token',
      },
      logger: mockLogger,
    });
  });

  describe('execute', () => {
    it('should execute a GraphQL query', async () => {
      const operation = QueryBuilder.query('TestQuery')
        .select({
          viewer: {
            id: true,
            name: true,
          },
        })
        .buildOperation();

      const mockResponse = {
        data: {
          viewer: {
            id: '123',
            name: 'Test User',
          },
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.execute(operation);
      expect(result).toEqual(mockResponse);
    });

    it('should handle GraphQL errors', async () => {
      const operation = QueryBuilder.query('TestQuery')
        .select({
          viewer: {
            id: true,
          },
        })
        .buildOperation();

      const mockError = {
        errors: [
          {
            message: 'Test error',
            locations: [{ line: 1, column: 1 }],
            path: ['viewer'],
          },
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockError),
      });

      await expect(client.execute(operation)).rejects.toThrow('GraphQL Error: Test error');
    });

    it('should handle network errors', async () => {
      const operation = QueryBuilder.query('TestQuery')
        .select({
          viewer: {
            id: true,
          },
        })
        .buildOperation();

      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;
      
      await expect(client.execute(operation)).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.linear.app/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          })
        })
      );
    }, 10000); // Increase timeout to 10 seconds

  });

  describe('executeBatch', () => {
    it('should execute a query with variables', async () => {
      const operation = QueryBuilder.query('GetIssue')
        .addVariable('id', 'String!', true)
        .setVariableValue('id', '123')
        .select({
          issue: {
            id: true,
            title: true
          }
        })
        .buildOperation();

      const mockResponse = {
        data: {
          issue: {
            id: '123',
            title: 'Test Issue'
          }
        }
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await client.execute(operation);
      expect(result).toEqual(mockResponse);
    });

    it('should execute multiple operations', async () => {
      const operations = [
        QueryBuilder.query('Query1')
          .select({ field1: true })
          .buildOperation(),
        QueryBuilder.query('Query2')
          .select({ field2: true })
          .buildOperation(),
      ];

      const mockResponses = [
        { data: { field1: 'value1' } },
        { data: { field2: 'value2' } },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponses),
      });

      const result = await client.executeBatch(operations);
      expect(result.success).toBe(true);
      expect(result.results).toEqual(mockResponses);
    });

    it('should handle batch errors', async () => {
      const operations = [
        QueryBuilder.query('Query1')
          .select({ field1: true })
          .buildOperation(),
      ];

      global.fetch = jest.fn().mockRejectedValue(new Error('Batch error'));

      const result = await client.executeBatch(operations);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Batch error');
    }, 10000); // Increase timeout to 10 seconds
  });
});
