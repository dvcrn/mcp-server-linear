/**
 * GraphQL Operations
 * 
 * Exports all GraphQL operations for Linear API.
 * Provides a unified interface for accessing operations by domain.
 * 
 * Features:
 * - Domain-specific operation modules
 * - Type-safe operation builders
 * - Consistent field selection through fragments
 * - Pagination support
 */

// Operation modules
export * from './issue.operations.js';
export * from './project.operations.js';
export * from './team.operations.js';
export * from './user.operations.js';

// Operation implementations
import { IssueOperations } from './issue.operations.js';
import { ProjectOperations } from './project.operations.js';
import { TeamOperations } from './team.operations.js';
import { UserOperations } from './user.operations.js';

/**
 * Unified operations interface
 * Provides a clean API for accessing all GraphQL operations
 */
export const Operations = {
  /**
   * Issue-related operations
   * - CRUD operations for issues
   * - Issue relationships
   * - Issue search and filtering
   */
  issues: IssueOperations,

  /**
   * Project-related operations
   * - Project management
   * - Project teams
   * - Project progress tracking
   */
  projects: ProjectOperations,

  /**
   * Team-related operations
   * - Team management
   * - Team members
   * - Team settings
   */
  teams: TeamOperations,

  /**
   * User-related operations
   * - User management
   * - User authentication
   * - User preferences
   */
  users: UserOperations,
} as const;

// Type helpers
export type OperationsAPI = typeof Operations;
export type IssueOperationsAPI = typeof Operations.issues;
export type ProjectOperationsAPI = typeof Operations.projects;
export type TeamOperationsAPI = typeof Operations.teams;
export type UserOperationsAPI = typeof Operations.users;

// Re-export types
export type {
  GraphQLOperation,
  GraphQLResponse,
  GraphQLVariables,
} from '../../../core/types/graphql.types.js';

export type {
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
} from '../../../core/types/linear.types.js';
