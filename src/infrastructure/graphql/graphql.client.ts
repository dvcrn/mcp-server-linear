/**
 * GraphQL Client
 * 
 * Provides a wrapper around the Linear GraphQL client with additional functionality:
 * - Error handling
 * - Logging
 * - Rate limiting
 * - Retries
 */

import { Logger } from '../../utils/logger.js';
import { ConfigService } from '../../utils/config.service.js';
import { print } from 'graphql';
import {
  GraphQLOperation,
  GraphQLResponse,
  GraphQLVariables,
  BatchOperationResult,
} from '../../core/types/graphql.types.js';
import { LinearError } from '../../core/types/linear.types.js';

interface GraphQLClientConfig {
  auth: {
    type: 'pat' | 'oauth';
    token: string;
  };
  logger: Logger;
  config: ConfigService;
}

export class GraphQLClient {
  private readonly logger: Logger;
  private readonly config: ConfigService;
  private rateLimitWindow: number = 0;
  private rateLimitRequests: number = 0;

  constructor(config: GraphQLClientConfig) {
    this.logger = config.logger;
    this.config = config.config;
  }

  /**
   * Execute a GraphQL operation
   */
  async execute<T>(
    operation: GraphQLOperation<T>
  ): Promise<GraphQLResponse<T>> {
    try {
      await this.checkRateLimit();

      const { document, variables } = operation;
      const query = print(document);

      this.logger.debug('Executing GraphQL operation', {
        query,
        variables,
      });

      const response = await this.executeWithRetry<T>(query, variables);

      this.updateRateLimit();
      return response;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('GraphQL operation failed', linearError);
      throw linearError;
    }
  }

  /**
   * Execute multiple GraphQL operations in parallel
   */
  async executeBatch<T>(
    operations: GraphQLOperation<T>[]
  ): Promise<BatchOperationResult<T>[]> {
    try {
      const results = await Promise.all(
        operations.map(operation => this.execute(operation))
      );

      const batchResults: BatchOperationResult<T>[] = results.map((result, index) => ({
        success: !result.errors,
        results: [result],
        errors: result.errors?.map(e => e.message)
      }));

      return batchResults;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Batch GraphQL operation failed', linearError);
      throw linearError;
    }
  }

  /**
   * Execute a GraphQL operation with retries
   */
  private async executeWithRetry<T>(
    query: string,
    variables?: GraphQLVariables,
    attempt: number = 1
  ): Promise<GraphQLResponse<T>> {
    try {
      const httpConfig = this.config.getHttpConfig();
      const maxRetries = httpConfig.maxRetries || 3;

      if (attempt > maxRetries) {
        throw new Error(`Max retries (${maxRetries}) exceeded`);
      }

      // Execute query...
      // This is a placeholder - actual implementation would use Linear's GraphQL client
      return {} as GraphQLResponse<T>;
    } catch (error) {
      if (this.shouldRetry(error) && attempt < (this.config.getHttpConfig().maxRetries || 3)) {
        const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return this.executeWithRetry(query, variables, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Check if we should retry the operation
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Retry on network errors and 5xx responses
      return (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('500') ||
        error.message.includes('503')
      );
    }
    return false;
  }

  /**
   * Check rate limit before making a request
   */
  private async checkRateLimit(): Promise<void> {
    const httpConfig = this.config.getHttpConfig();
    const rateLimit = httpConfig.rateLimit;

    if (!rateLimit) {
      return;
    }

    const now = Date.now();
    if (now - this.rateLimitWindow > rateLimit.windowMs) {
      this.rateLimitWindow = now;
      this.rateLimitRequests = 0;
    }

    if (this.rateLimitRequests >= rateLimit.maxRequests) {
      const waitTime = rateLimit.windowMs - (now - this.rateLimitWindow);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimitWindow = Date.now();
      this.rateLimitRequests = 0;
    }
  }

  /**
   * Update rate limit counters after a request
   */
  private updateRateLimit(): void {
    const httpConfig = this.config.getHttpConfig();
    const rateLimit = httpConfig.rateLimit;

    if (!rateLimit) {
      return;
    }

    this.rateLimitRequests++;
  }

  /**
   * Convert unknown error to LinearError
   */
  private toLinearError(error: unknown): LinearError {
    const baseError = new Error();

    if (error instanceof Error) {
      baseError.message = error.message;
      baseError.name = error.name;
      baseError.stack = error.stack;
      return Object.assign(baseError, {
        code: 'GRAPHQL_ERROR',
        data: { originalError: error },
      });
    }

    baseError.message = String(error);
    baseError.name = 'UNKNOWN_ERROR';
    return Object.assign(baseError, {
      code: 'UNKNOWN_ERROR',
      data: { originalError: error },
    });
  }
}
