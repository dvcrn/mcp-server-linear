/**
 * Project Service
 * 
 * Provides high-level operations for managing Linear projects.
 * Abstracts away GraphQL complexity and provides a clean API.
 */

import { GraphQLClient } from '../../../infrastructure/graphql/graphql.client.js';
import { Operations } from '../../../infrastructure/graphql/operations/index.js';
import { Logger } from '../../../utils/logger.js';
import {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  Connection,
  Issue,
  Team,
  LinearError,
  LinearErrorResponse,
} from '../../../core/types/linear.types.js';

export class ProjectService {
  constructor(
    private readonly client: GraphQLClient,
    private readonly logger: Logger
  ) {}

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<Project> {
    try {
      const operation = Operations.projects.getProject(id);
      const response = await this.client.execute<{ project: Project }>(operation);

      if (!response.data?.project) {
        throw new Error(`Project ${id} not found`);
      }

      return response.data.project;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get project', linearError);
      throw linearError;
    }
  }

  /**
   * Get project issues
   */
  async getProjectIssues(id: string): Promise<Connection<Issue>> {
    try {
      const project = await this.getProject(id);
      if (!project.issues) {
        return { nodes: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 };
      }
      return project.issues;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get project issues', linearError);
      throw linearError;
    }
  }

  /**
   * Create a new project
   */
  async createProject(input: ProjectCreateInput): Promise<Project> {
    try {
      const operation = Operations.projects.createProject(input);
      const response = await this.client.execute<{ projectCreate: { project: Project; success: boolean } }>(operation);

      if (!response.data?.projectCreate?.success) {
        throw new Error('Failed to create project');
      }

      return response.data.projectCreate.project;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to create project', linearError);
      throw linearError;
    }
  }

  /**
   * Update a project
   */
  async updateProject(id: string, input: ProjectUpdateInput): Promise<Project> {
    try {
      const operation = Operations.projects.updateProject(id, input);
      const response = await this.client.execute<{ projectUpdate: { project: Project; success: boolean } }>(operation);

      if (!response.data?.projectUpdate?.success) {
        throw new Error(`Failed to update project ${id}`);
      }

      return response.data.projectUpdate.project;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to update project', linearError);
      throw linearError;
    }
  }

  /**
   * Get project teams
   */
  async getProjectTeams(id: string): Promise<Connection<Team>> {
    try {
      const project = await this.getProject(id);
      if (!project.teams) {
        return { nodes: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 };
      }
      return project.teams;
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to get project teams', linearError);
      throw linearError;
    }
  }

  /**
   * Add teams to project
   */
  async addTeamsToProject(id: string, teamIds: string[]): Promise<Project> {
    try {
      const project = await this.getProject(id);
      const currentTeamIds = project.teams?.nodes.map(team => team.id) || [];
      const uniqueTeamIds = [...new Set([...currentTeamIds, ...teamIds])];

      return this.updateProject(id, {
        teamIds: uniqueTeamIds,
      });
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to add teams to project', linearError);
      throw linearError;
    }
  }

  /**
   * Update project progress
   */
  async updateProjectProgress(id: string, progress: number): Promise<Project> {
    try {
      if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
      }

      return this.updateProject(id, {
        progress,
      });
    } catch (error) {
      const linearError = this.toLinearError(error);
      this.logger.error('Failed to update project progress', linearError);
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
