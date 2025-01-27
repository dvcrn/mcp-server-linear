/**
 * Issue Service
 * 
 * Provides high-level operations for managing Linear issues.
 * Abstracts away GraphQL complexity and provides a clean API.
 */

import { GraphQLClient } from '../../../infrastructure/graphql/graphql.client.js';
import { Operations } from '../../../infrastructure/graphql/operations/index.js';
import { Logger } from '../../../utils/logger.js';
import {
  Issue,
  IssueCreateInput,
  IssueUpdateInput,
  Connection,
  LinearError,
  LinearErrorResponse,
} from '../../../core/types/linear.types.js';
import { GraphQLResponse } from '../../../core/types/graphql.types.js';

export class IssueService {
  constructor(
    private readonly client: GraphQLClient,
    private readonly logger: Logger
  ) {}

  /**
   * Get an issue by ID
   */
  async getIssue(id: string): Promise<Issue> {
    try {
      const operation = Operations.issues.getIssue(id);
      const response = await this.client.execute<{ issue: Issue }>(operation);

      if (!response.data?.issue) {
        throw new Error(`Issue ${id} not found`);
      }

      return response.data.issue;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get issue', linearError);
      throw linearError;
    }
  }

  /**
   * Get issues with pagination
   */
  async getIssues(options?: { first?: number; after?: string }): Promise<Connection<Issue>> {
    try {
      const operation = Operations.issues.getIssues(options);
      const response = await this.client.execute<{ issues: Connection<Issue> }>(operation);

      if (!response.data?.issues) {
        throw new Error('Failed to fetch issues');
      }

      return response.data.issues;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get issues', linearError);
      throw linearError;
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(input: IssueCreateInput): Promise<Issue> {
    try {
      const operation = Operations.issues.createIssue(input);
      const response = await this.client.execute<{ issueCreate: { issue: Issue; success: boolean } }>(operation);

      if (!response.data?.issueCreate?.success) {
        throw new Error('Failed to create issue');
      }

      return response.data.issueCreate.issue;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to create issue', linearError);
      throw linearError;
    }
  }

  /**
   * Update an issue
   */
  async updateIssue(id: string, input: IssueUpdateInput): Promise<Issue> {
    try {
      const operation = Operations.issues.updateIssue(id, input);
      const response = await this.client.execute<{ issueUpdate: { issue: Issue; success: boolean } }>(operation);

      if (!response.data?.issueUpdate?.success) {
        throw new Error(`Failed to update issue ${id}`);
      }

      return response.data.issueUpdate.issue;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to update issue', linearError);
      throw linearError;
    }
  }

  /**
   * Create a child issue
   */
  async createChildIssue(parentId: string, input: Omit<IssueCreateInput, 'teamId'>): Promise<Issue> {
    try {
      const parent = await this.getIssue(parentId);
      const childInput: IssueCreateInput = {
        ...input,
        teamId: parent.team.id,
        parentId,
      };

      return await this.createIssue(childInput);
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to create child issue', linearError);
      throw linearError;
    }
  }

  /**
   * Bulk create issues
   */
  async bulkCreateIssues(inputs: IssueCreateInput[]): Promise<Issue[]> {
    try {
      const createdIssues = await Promise.all(
        inputs.map(input => this.createIssue(input))
      );
      return createdIssues;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to bulk create issues', linearError);
      throw linearError;
    }
  }

  /**
   * Bulk update issues
   */
  async bulkUpdateIssues(updates: { id: string; input: IssueUpdateInput }[]): Promise<Issue[]> {
    try {
      const updatedIssues = await Promise.all(
        updates.map(update => this.updateIssue(update.id, update.input))
      );
      return updatedIssues;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to bulk update issues', linearError);
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
