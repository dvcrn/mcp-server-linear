/**
 * Team Service
 * 
 * Provides high-level operations for managing Linear teams.
 * Abstracts away GraphQL complexity and provides a clean API.
 */

import { GraphQLClient } from '../../../infrastructure/graphql/graphql.client.js';
import { Operations } from '../../../infrastructure/graphql/operations/index.js';
import { Logger } from '../../../utils/logger.js';
import {
  Team,
  TeamCreateInput,
  TeamUpdateInput,
  Connection,
  LinearError,
  LinearErrorResponse,
} from '../../../core/types/linear.types.js';

export class TeamService {
  constructor(
    private readonly client: GraphQLClient,
    private readonly logger: Logger
  ) {}

  /**
   * Get a team by ID
   */
  async getTeam(id: string): Promise<Team> {
    try {
      const operation = Operations.teams.getTeam(id);
      const response = await this.client.execute<{ team: Team }>(operation);

      if (!response.data?.team) {
        throw new Error(`Team ${id} not found`);
      }

      return response.data.team;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get team', linearError);
      throw linearError;
    }
  }

  /**
   * Get teams with pagination
   */
  async getTeams(options?: { first?: number; after?: string }): Promise<Connection<Team>> {
    try {
      const operation = Operations.teams.getTeams(options);
      const response = await this.client.execute<{ teams: Connection<Team> }>(operation);

      if (!response.data?.teams) {
        throw new Error('Failed to fetch teams');
      }

      return response.data.teams;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get teams', linearError);
      throw linearError;
    }
  }

  /**
   * Create a new team
   */
  async createTeam(input: TeamCreateInput): Promise<Team> {
    try {
      const operation = Operations.teams.createTeam(input);
      const response = await this.client.execute<{ teamCreate: { team: Team; success: boolean } }>(operation);

      if (!response.data?.teamCreate?.success) {
        throw new Error('Failed to create team');
      }

      return response.data.teamCreate.team;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to create team', linearError);
      throw linearError;
    }
  }

  /**
   * Update a team
   */
  async updateTeam(id: string, input: TeamUpdateInput): Promise<Team> {
    try {
      const operation = Operations.teams.updateTeam(id, input);
      const response = await this.client.execute<{ teamUpdate: { team: Team; success: boolean } }>(operation);

      if (!response.data?.teamUpdate?.success) {
        throw new Error(`Failed to update team ${id}`);
      }

      return response.data.teamUpdate.team;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to update team', linearError);
      throw linearError;
    }
  }

  /**
   * Get team by key
   */
  async getTeamByKey(key: string): Promise<Team> {
    try {
      const operation = Operations.teams.getTeamByKey(key);
      const response = await this.client.execute<{ team: Team }>(operation);

      if (!response.data?.team) {
        throw new Error(`Team with key ${key} not found`);
      }

      return response.data.team;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get team by key', linearError);
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
