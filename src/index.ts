/**
 * Linear MCP Entry Point
 * 
 * Exports the main LinearMCP class and related types.
 */

import { GraphQLClient } from './infrastructure/graphql/graphql.client.js';
import { Logger } from './utils/logger.js';
import { ConfigService } from './utils/config.service.js';
import { IssueService } from './features/issues/services/issue.service.js';
import { ProjectService } from './features/projects/services/project.service.js';
import { TeamService } from './features/teams/services/team.service.js';
import { UserService } from './features/users/services/user.service.js';
import { AuthService } from './features/auth/services/auth.service.js';

export interface LinearMCPConfig {
  auth: {
    type: 'pat' | 'oauth';
    token?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
  };
  logger?: Logger;
  config?: ConfigService;
}

export class LinearMCP {
  private readonly logger: Logger;
  private readonly configService: ConfigService;
  private client?: GraphQLClient;
  private issues?: IssueService;
  private projects?: ProjectService;
  private teams?: TeamService;
  private users?: UserService;
  public readonly auth: AuthService;

  constructor(config: LinearMCPConfig) {
    this.logger = config.logger || new Logger();
    this.configService = config.config || new ConfigService();
    this.auth = new AuthService(config.auth, this.logger, this.configService);
  }

  async initialize(): Promise<void> {
    await this.auth.initialize();
  }

  async getClient(): Promise<GraphQLClient> {
    if (!this.client) {
      this.client = await this.auth.getClient();
      if (!this.client) {
        throw new Error('Failed to initialize GraphQL client');
      }
    }
    return this.client;
  }

  async getIssues(): Promise<IssueService> {
    if (!this.issues) {
      const client = await this.getClient();
      this.issues = new IssueService(client, this.logger);
    }
    return this.issues;
  }

  async getProjects(): Promise<ProjectService> {
    if (!this.projects) {
      const client = await this.getClient();
      this.projects = new ProjectService(client, this.logger);
    }
    return this.projects;
  }

  async getTeams(): Promise<TeamService> {
    if (!this.teams) {
      const client = await this.getClient();
      this.teams = new TeamService(client, this.logger);
    }
    return this.teams;
  }

  async getUsers(): Promise<UserService> {
    if (!this.users) {
      const client = await this.getClient();
      this.users = new UserService(client, this.logger);
    }
    return this.users;
  }
}

// Re-export types from core
export {
  Issue,
  Project,
  Team,
  User,
  IssueCreateInput,
  IssueUpdateInput,
  ProjectCreateInput,
  ProjectUpdateInput,
  TeamCreateInput,
  TeamUpdateInput,
  Connection,
  PageInfo,
  LinearError,
  LinearErrorResponse,
} from './core/types/linear.types.js';

// Re-export GraphQL types selectively to avoid conflicts
export {
  GraphQLOperation,
  GraphQLResponse,
  GraphQLVariables,
  PaginationOptions,
  BatchOperationResult,
  LoggerConfig,
  LogLevel,
  LogFormat,
  LogDestination,
  LogMetadata,
  GraphQLClientConfig,
  GraphQLBatchOptions,
  GraphQLSubscriptionConfig,
  GraphQLContext,
  GraphQLUpload,
  GraphQLScalarValue,
  GraphQLValue,
  GraphQLField,
  GraphQLFragment,
} from './core/types/graphql.types.js';

// Re-export services
export { IssueService } from './features/issues/services/issue.service.js';
export { ProjectService } from './features/projects/services/project.service.js';
export { TeamService } from './features/teams/services/team.service.js';
export { UserService } from './features/users/services/user.service.js';
export { AuthService } from './features/auth/services/auth.service.js';

// Re-export utilities
export { Logger } from './utils/logger.js';
export { ConfigService } from './utils/config.service.js';
