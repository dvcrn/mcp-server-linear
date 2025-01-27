/**
 * GraphQL Query Builder
 * 
 * Provides a fluent interface for building GraphQL queries and mutations.
 * Supports fragments, variables, and field selection.
 */

import { DocumentNode, parse } from 'graphql';

export type FieldSelection = {
  [key: string]: boolean | FieldSelection | { __fragment: string } | { __args: Record<string, string>; [key: string]: any };
};

interface Fragment {
  name: string;
  on: string;
  fields: string;
}

interface Variable {
  name: string;
  type: string;
  required: boolean;
  value?: unknown;
}

export class QueryBuilder {
  private operationName: string;
  private operationType: 'query' | 'mutation';
  private selections: FieldSelection = {};
  private fragments: Fragment[] = [];
  private variables: Variable[] = [];

  private constructor(operationType: 'query' | 'mutation', operationName: string) {
    this.operationType = operationType;
    this.operationName = operationName;
  }

  static query(name: string): QueryBuilder {
    return new QueryBuilder('query', name);
  }

  static mutation(name: string): QueryBuilder {
    return new QueryBuilder('mutation', name);
  }

  addVariable(name: string, type: string, required = false): QueryBuilder {
    this.variables.push({ name, type, required });
    return this;
  }

  setVariableValue(name: string, value: unknown): QueryBuilder {
    const variable = this.variables.find(v => v.name === name);
    if (variable) {
      variable.value = value;
    }
    return this;
  }

  addFragment(name: string, on: string, fields: string): QueryBuilder {
    this.fragments.push({ name, on, fields });
    return this;
  }

  select(fields: FieldSelection): QueryBuilder {
    this.selections = { ...this.selections, ...fields };
    return this;
  }

  buildOperation(): { document: DocumentNode; variables?: Record<string, unknown>; operationName: string } {
    const query = this.buildQuery();
    const variables = this.buildVariables();

    return {
      document: parse(query),
      variables: Object.keys(variables).length > 0 ? variables : undefined,
      operationName: this.operationName,
    };
  }

  private buildQuery(): string {
    const variableDefinitions = this.buildVariableDefinitions();
    const fragmentDefinitions = this.buildFragmentDefinitions();
    const selections = this.buildSelections(this.selections);

    const query = `${this.operationType} ${this.operationName}`;
    const withVars = variableDefinitions ? `${query}(${variableDefinitions})` : query;
    
    const finalQuery = `
      ${withVars} {
        ${selections}
      }
      ${fragmentDefinitions}
    `;

    // Debug logging
    console.log('Generated variable definitions:', variableDefinitions);
    console.log('Generated query:', finalQuery);

    return finalQuery;
  }

  private buildVariableDefinitions(): string {
    if (this.variables.length === 0) {
      return '';
    }

    return this.variables
      .map(v => {
        // Don't add ! if the type already ends with !
        const type = v.required && !v.type.endsWith('!') ? `${v.type}!` : v.type;
        return `$${v.name}: ${type}`;
      })
      .join(', ');
  }

  private buildVariables(): Record<string, unknown> {
    return this.variables.reduce((acc, v) => {
      if (v.value !== undefined) {
        acc[v.name] = v.value;
      }
      return acc;
    }, {} as Record<string, unknown>);
  }

  private buildFragmentDefinitions(): string {
    return this.fragments
      .map(
        f => `
        fragment ${f.name} on ${f.on} {
          ${f.fields}
        }
      `
      )
      .join('\n');
  }

  private buildSelections(selections: FieldSelection, indent = ''): string {
    return Object.entries(selections)
      .map(([key, value]) => {
        if (value === true) {
          return `${indent}${key}`;
        }

        if (typeof value === 'object') {
          const args = ('__args' in value) ? 
            `(${Object.entries(value.__args)
              .map(([argName, argValue]) => `${argName}: ${argValue}`)
              .join(', ')})` : 
            '';

          if ('__fragment' in value) {
            return `${indent}${key}${args} { ...${value.__fragment} }`;
          }

          const nestedSelections = this.buildSelections(
            Object.entries(value)
              .filter(([k]) => k !== '__args')
              .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
            `${indent}  `
          );

          return `${indent}${key}${args} {\n${nestedSelections}\n${indent}}`;
        }

        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
}
