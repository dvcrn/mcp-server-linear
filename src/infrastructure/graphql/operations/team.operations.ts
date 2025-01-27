/**
 * Team Operations
 * 
 * GraphQL operations for managing Linear teams.
 * Uses common fragments for consistent field selection.
 */

import { QueryBuilder } from '../query-builder.js';
import { teamFields, userFields, workflowStateFields, labelFields } from '../fragments/index.js';
import { GraphQLOperation } from '../../../core/types/graphql.types.js';
import {
  Team,
  TeamCreateInput,
  TeamUpdateInput,
  Connection,
} from '../../../core/types/linear.types.js';

export class TeamOperations {
  /**
   * Get a team by ID
   */
  static getTeam(id: string): GraphQLOperation<{ team: Team }> {
    return QueryBuilder.query('GetTeam')
      .addVariable('id', 'String!', true)
      .setVariableValue('id', id)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        team: {
          __args: {
            id: '$id',
          },
          __fragment: 'TeamFields',
        },
      })
      .buildOperation();
  }

  /**
   * Get teams with pagination
   */
  static getTeams(options?: { first?: number; after?: string }): GraphQLOperation<{ teams: Connection<Team> }> {
    const query = QueryBuilder.query('GetTeams')
      .addVariable('first', 'Int')
      .addVariable('after', 'String')
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        teams: {
          __args: {
            first: '$first',
            after: '$after',
          },
          nodes: {
            __fragment: 'TeamFields',
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
   * Create a new team
   */
  static createTeam(input: TeamCreateInput): GraphQLOperation<{ teamCreate: { team: Team; success: boolean } }> {
    return QueryBuilder.mutation('CreateTeam')
      .addVariable('input', 'TeamCreateInput!', true)
      .setVariableValue('input', input)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        teamCreate: {
          __args: {
            input: '$input',
          },
          team: {
            __fragment: 'TeamFields',
          },
          success: true,
        },
      })
      .buildOperation();
  }

  /**
   * Update a team
   */
  static updateTeam(id: string, input: TeamUpdateInput): GraphQLOperation<{ teamUpdate: { team: Team; success: boolean } }> {
    return QueryBuilder.mutation('UpdateTeam')
      .addVariable('id', 'String!', true)
      .addVariable('input', 'TeamUpdateInput!', true)
      .setVariableValue('id', id)
      .setVariableValue('input', input)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        teamUpdate: {
          __args: {
            id: '$id',
            input: '$input',
          },
          team: {
            __fragment: 'TeamFields',
          },
          success: true,
        },
      })
      .buildOperation();
  }

  /**
   * Get team by key
   */
  static getTeamByKey(key: string): GraphQLOperation<{ team: Team }> {
    return QueryBuilder.query('GetTeamByKey')
      .addVariable('key', 'String!', true)
      .setVariableValue('key', key)
      .addFragment(teamFields.name, teamFields.on, teamFields.fields)
      .select({
        team: {
          __args: {
            key: '$key',
          },
          __fragment: 'TeamFields',
        },
      })
      .buildOperation();
  }
}
