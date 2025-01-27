/**
 * Issue Operations
 * 
 * GraphQL operations for managing Linear issues.
 * Uses common fragments for consistent field selection.
 */

import { QueryBuilder } from '../query-builder.js';
import { issueFields, teamFields } from '../fragments/index.js';
import { GraphQLOperation } from '../../../core/types/graphql.types.js';
import {
  Issue,
  IssueCreateInput,
  IssueUpdateInput,
  Connection,
} from '../../../core/types/linear.types.js';

export class IssueOperations {
  /**
   * Get an issue by ID
   */
  static getIssue(id: string): GraphQLOperation<{ issue: Issue }> {
    return QueryBuilder.query('GetIssue')
      .addVariable('id', 'String!', true)
      .setVariableValue('id', id)
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        issue: {
          __args: {
            id: '$id',
          },
          __fragment: 'IssueFields',
        },
      })
      .buildOperation();
  }

  /**
   * Get issues with pagination
   */
  static getIssues(options?: { first?: number; after?: string }): GraphQLOperation<{ issues: Connection<Issue> }> {
    const query = QueryBuilder.query('GetIssues')
      .addVariable('first', 'Int')
      .addVariable('after', 'String')
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        issues: {
          __args: {
            first: '$first',
            after: '$after',
          },
          nodes: {
            __fragment: 'IssueFields',
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
   * Create a new issue
   */
  static createIssue(input: IssueCreateInput): GraphQLOperation<{ issueCreate: { issue: Issue; success: boolean } }> {
    return QueryBuilder.mutation('CreateIssue')
      .addVariable('input', 'IssueCreateInput!', true)
      .setVariableValue('input', input)
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        issueCreate: {
          __args: {
            input: '$input',
          },
          issue: {
            __fragment: 'IssueFields',
          },
          success: true,
        },
      })
      .buildOperation();
  }

  /**
   * Update an issue
   */
  static updateIssue(id: string, input: IssueUpdateInput): GraphQLOperation<{ issueUpdate: { issue: Issue; success: boolean } }> {
    return QueryBuilder.mutation('UpdateIssue')
      .addVariable('id', 'String!', true)
      .addVariable('input', 'IssueUpdateInput!', true)
      .setVariableValue('id', id)
      .setVariableValue('input', input)
      .addFragment(issueFields.name, issueFields.on, issueFields.fields)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        issueUpdate: {
          __args: {
            id: '$id',
            input: '$input',
          },
          issue: {
            __fragment: 'IssueFields',
          },
          success: true,
        },
      })
      .buildOperation();
  }
}
