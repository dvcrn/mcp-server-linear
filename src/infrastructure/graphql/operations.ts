/**
 * GraphQL Operations
 * 
 * Provides a unified interface for all GraphQL operations.
 * Includes common query fragments and operation builders.
 */

import { QueryBuilder } from './query-builder';
import { GraphQLOperation } from '../../core/types/graphql.types';
import {
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
} from '../../core/types/linear.types';

// Re-export operations
export * from './operations/issue.operations';
export * from './operations/project.operations';
export * from './operations/team.operations';
export * from './operations/user.operations';

// Operation implementations
import { IssueOperations } from './operations/issue.operations';
import { ProjectOperations } from './operations/project.operations';
import { TeamOperations } from './operations/team.operations';
import { UserOperations } from './operations/user.operations';

/**
 * Unified operations interface
 */
export const Operations = {
  issues: IssueOperations,
  projects: ProjectOperations,
  teams: TeamOperations,
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
};
