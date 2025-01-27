/**
 * User Service
 * 
 * Provides high-level operations for managing Linear users.
 * Abstracts away GraphQL complexity and provides a clean API.
 */

import { GraphQLClient } from '../../../infrastructure/graphql/graphql.client.js';
import { Operations } from '../../../infrastructure/graphql/operations/index.js';
import { Logger } from '../../../utils/logger.js';
import {
  User,
  Connection,
  LinearError,
  LinearErrorResponse,
} from '../../../core/types/linear.types.js';

export class UserService {
  constructor(
    private readonly client: GraphQLClient,
    private readonly logger: Logger
  ) {}

  /**
   * Get a user by ID
   */
  async getUser(id: string): Promise<User> {
    try {
      const operation = Operations.users.getUser(id);
      const response = await this.client.execute<{ user: User }>(operation);

      if (!response.data?.user) {
        throw new Error(`User ${id} not found`);
      }

      return response.data.user;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get user', linearError);
      throw linearError;
    }
  }

  /**
   * Get users with pagination
   */
  async getUsers(options?: { first?: number; after?: string }): Promise<Connection<User>> {
    try {
      const operation = Operations.users.getUsers(options);
      const response = await this.client.execute<{ users: Connection<User> }>(operation);

      if (!response.data?.users) {
        throw new Error('Failed to fetch users');
      }

      return response.data.users;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get users', linearError);
      throw linearError;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const operation = Operations.users.getViewer();
      const response = await this.client.execute<{ viewer: User }>(operation);

      if (!response.data?.viewer) {
        throw new Error('Failed to get current user');
      }

      return response.data.viewer;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get current user', linearError);
      throw linearError;
    }
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
        code: 'UNKNOWN_ERROR',
        data: { originalError: error },
      });
    }

    if (typeof error === 'object' && error !== null) {
      const errorResponse = error as LinearErrorResponse;
      if (errorResponse.error) {
        baseError.message = errorResponse.error.message;
        baseError.name = errorResponse.error.code || 'LINEAR_API_ERROR';
        return Object.assign(baseError, {
          code: errorResponse.error.code,
          data: errorResponse.error.data,
        });
      }
    }

    baseError.message = String(error);
    baseError.name = 'UNKNOWN_ERROR';
    return Object.assign(baseError, {
      code: 'UNKNOWN_ERROR',
      data: { originalError: error },
    });
  }
}
