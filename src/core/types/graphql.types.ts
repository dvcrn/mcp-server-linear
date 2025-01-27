/**
 * GraphQL Types
 * 
 * Common types for GraphQL operations.
 */

import { Logger } from '../../utils/logger';
import { DocumentNode } from 'graphql';
import { LoggerConfig, LogLevel, LogFormat, LogDestination, LogMetadata } from './logger.types';

export {
  LoggerConfig,
  LogLevel,
  LogFormat,
  LogDestination,
  LogMetadata
};

export interface GraphQLOperation<T = unknown> {
  document: DocumentNode;
  variables?: Record<string, unknown>;
  operationName: string;
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface GraphQLBatchOptions {
  continueOnError?: boolean;
  maxConcurrency?: number;
}

export interface BatchOperationResult<T = unknown> {
  success: boolean;
  results: Array<GraphQLResponse<T>>;
  errors?: string[];
}


export interface FieldSelection {
  [key: string]: boolean | FieldSelection | { __fragment: string };
}

export interface GraphQLClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  logger?: Logger;
}

export interface GraphQLVariables {
  [key: string]: unknown;
}

export interface PaginationOptions {
  first?: number;
  after?: string;
  last?: number;
  before?: string;
}

export interface GraphQLSubscriptionConfig {
  query: string;
  variables?: GraphQLVariables;
  operationName?: string;
}

export interface GraphQLContext {
  [key: string]: unknown;
}

export interface GraphQLUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
}

export type GraphQLScalarValue = string | number | boolean | null;
export type GraphQLValue = GraphQLScalarValue | GraphQLScalarValue[] | { [key: string]: GraphQLValue };

export interface GraphQLField {
  name: string;
  type: string;
  description?: string;
  args?: Array<{
    name: string;
    type: string;
    description?: string;
    defaultValue?: GraphQLValue;
  }>;
}

export interface GraphQLFragment {
  name: string;
  type: string;
  fields: GraphQLField[];
}
