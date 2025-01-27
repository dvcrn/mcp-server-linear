/**
 * User Operations
 * 
 * GraphQL operations for managing Linear users.
 * Uses common fragments for consistent field selection.
 */

import { QueryBuilder } from '../query-builder.js';
import { userFields } from '../fragments/index.js';
import { GraphQLOperation } from '../../../core/types/graphql.types.js';
import {
  User,
  Connection,
} from '../../../core/types/linear.types.js';

export class UserOperations {
  /**
   * Get a user by ID
   */
  static getUser(id: string): GraphQLOperation<{ user: User }> {
    return QueryBuilder.query('GetUser')
      .addVariable('id', 'String!', true)
      .setVariableValue('id', id)
      .addFragment(userFields.name, userFields.on, userFields.fields)
      .select({
        user: {
          __args: {
            id: '$id',
          },
          __fragment: 'UserFields',
        },
      })
      .buildOperation();
  }

  /**
   * Get users with pagination
   */
  static getUsers(options?: { first?: number; after?: string }): GraphQLOperation<{ users: Connection<User> }> {
    const query = QueryBuilder.query('GetUsers')
      .addVariable('first', 'Int')
      .addVariable('after', 'String')
      .addFragment(userFields.name, userFields.on, userFields.fields)
      .select({
        users: {
          __args: {
            first: '$first',
            after: '$after',
          },
          nodes: {
            __fragment: 'UserFields',
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

  // don't need this feature. focus on getting the service stood up.

  /**
   * Get current user (viewer)
   */
  static getViewer(): GraphQLOperation<{ viewer: User }> {
    return QueryBuilder.query('GetViewer')
      .addFragment(userFields.name, userFields.on, userFields.fields)
      .select({
        viewer: {
          __fragment: 'UserFields',
        },
      })
      .buildOperation();
  }
}
