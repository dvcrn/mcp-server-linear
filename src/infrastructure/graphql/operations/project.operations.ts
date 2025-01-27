/**
 * Project Operations
 * 
 * GraphQL operations for managing Linear projects.
 * Uses common fragments for consistent field selection.
 */

import { QueryBuilder } from '../query-builder.js';
import { projectFields, userFields, teamFields, issueFields } from '../fragments/index.js';
import { GraphQLOperation } from '../../../core/types/graphql.types.js';
import {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  Connection,
} from '../../../core/types/linear.types.js';

export class ProjectOperations {
  /**
   * Get a project by ID
   */
  static getProject(id: string): GraphQLOperation<{ project: Project }> {
    return QueryBuilder.query('GetProject')
      .addVariable('id', 'String!', true)
      .setVariableValue('id', id)
      .addFragment(projectFields.name, projectFields.on, projectFields.fields)
      .addFragment(userFields.name, userFields.on, userFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .select({
        project: {
          __args: {
            id: '$id',
          },
          __fragment: 'ProjectFields',
        },
      })
      .buildOperation();
  }

  /**
   * Get projects with pagination
   */
  static getProjects(options?: { first?: number; after?: string }): GraphQLOperation<{ projects: Connection<Project> }> {
    const query = QueryBuilder.query('GetProjects')
      .addVariable('first', 'Int')
      .addVariable('after', 'String')
      .addFragment(projectFields.name, projectFields.on, projectFields.fields)
      .addFragment(userFields.name, userFields.on, userFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .select({
        projects: {
          __args: {
            first: '$first',
            after: '$after',
          },
          nodes: {
            __fragment: 'ProjectFields',
          },
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: true,
            startCursor: true,
            endCursor: true,
          },
        },
      });

    if (options?.first) {
      query.setVariableValue('first', options.first);
    }
    if (options?.after) {
      query.setVariableValue('after', options.after);
    }

    return query.buildOperation();
  }

  /**
   * Create a new project
   */
  static createProject(input: ProjectCreateInput): GraphQLOperation<{ projectCreate: { project: Project; success: boolean } }> {
    return QueryBuilder.mutation('CreateProject')
      .addVariable('input', 'ProjectCreateInput!', true)
      .setVariableValue('input', input)
      .addFragment(projectFields.name, projectFields.on, projectFields.fields)
      .addFragment(userFields.name, userFields.on, userFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .select({
        projectCreate: {
          __args: {
            input: '$input',
          },
          project: {
            __fragment: 'ProjectFields',
          },
          success: true,
        },
      })
      .buildOperation();
  }

  /**
   * Update a project
   */
  static updateProject(id: string, input: ProjectUpdateInput): GraphQLOperation<{ projectUpdate: { project: Project; success: boolean } }> {
    return QueryBuilder.mutation('UpdateProject')
      .addVariable('id', 'String!', true)
      .addVariable('input', 'ProjectUpdateInput!', true)
      .setVariableValue('id', id)
      .setVariableValue('input', input)
      .addFragment(projectFields.name, projectFields.on, projectFields.fields)
      .addFragment(userFields.name, userFields.on, userFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .select({
        projectUpdate: {
          __args: {
            id: '$id',
            input: '$input',
          },
          project: {
            __fragment: 'ProjectFields',
          },
          success: true,
        },
      })
      .buildOperation();
  }
}
