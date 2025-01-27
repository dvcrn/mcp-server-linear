# Linear MCP Architecture

This document outlines the architecture of the Linear MCP (Model Context Protocol) implementation.

## Overview

The Linear MCP provides a type-safe, modular interface to the Linear API. It abstracts away the complexity of GraphQL operations while providing a clean, domain-driven API surface.

## Current Status

- ✅ Authentication (PAT and OAuth)
- ✅ Team operations (list, get, create, update)
- ✅ Issue operations (CRUD, parent/child relationships, bulk operations)
- ✅ Integration tests for core functionality
- 🚧 Project operations (in progress)
- 🚧 User operations (in progress)

## Core Concepts

### Domain-Driven Design

The codebase is organized around business domains:
- Authentication
- Issues
- Projects
- Teams
- Users

Each domain has its own set of:
- Types
- Services
- Operations
- Tests

### Layered Architecture

The codebase follows a layered architecture pattern:

```
src/
├── core/               # Core types and interfaces
│   ├── types/         # Shared type definitions
│   └── interfaces/    # Core interfaces
│
├── features/          # Feature modules by domain
│   ├── auth/         # Authentication services
│   ├── issues/
│   ├── projects/
│   ├── teams/
│   └── users/
│
├── infrastructure/    # Infrastructure concerns
│   ├── graphql/      # GraphQL implementation
│   └── http/         # HTTP client
│
└── utils/            # Shared utilities
    ├── logger.ts     # Logging system
    └── config.ts     # Configuration management
```

## Key Components

### Authentication Layer

The authentication system is designed for flexibility and security:

```typescript
// Main authentication service that delegates to specific implementations
class AuthService {
  private readonly patService: PATService;
  private readonly oauthService: OAuthService;
  private readonly tokenManager: TokenManager;

  async initialize(config: AuthConfig): Promise<void> {
    switch (config.type) {
      case 'pat':
        await this.patService.initialize();
        break;
      case 'oauth':
        await this.oauthService.initialize();
        break;
    }
  }
}

// Personal Access Token (PAT) authentication
class PATService {
  async initialize(): Promise<void>;
  async getAccessToken(): Promise<string>;
  isAuthenticated(): boolean;
}

// OAuth authentication
class OAuthService {
  async initialize(): Promise<void>;
  async getAccessToken(): Promise<string>;
  async refreshToken(): Promise<void>;
  getAuthorizationUrl(state?: string): string;
}

// Token management
class TokenManager {
  hasValidToken(): boolean;
  needsRefresh(): boolean;
  setTokenData(data: TokenData): void;
}
```

### GraphQL Layer

The GraphQL layer provides robust operation handling and error management:

```typescript
class GraphQLClient {
  // Execute a single operation
  async execute<T>(operation: Operation): Promise<T> {
    // Handles errors, retries, and logging
  }

  // Execute multiple operations in batch
  async executeBatch(operations: Operation[]): Promise<BatchResult> {
    // Handles batch operations with error aggregation
  }
}
```

#### Query Builder

The QueryBuilder provides a fluent interface for constructing GraphQL operations:

```typescript
const query = QueryBuilder.query('GetIssue')
  .addVariable('id', 'String!', true)
  .setVariableValue('id', issueId)
  .select({
    issue: {
      id: true,
      title: true
    }
  })
  .buildOperation();
```

### Logging System

A flexible logging system with multiple output formats and destinations:

```typescript
interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  destination: 'console' | 'file';
}

class Logger {
  error(message: string, error?: Error): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}
```

### Error Handling

Errors are handled consistently through the LinearError type:

```typescript
interface LinearError {
  message: string;
  name: string;
  stack?: string;
  code?: string;
  data?: unknown;
}
```

## Best Practices

1. **Type Safety**
   - Use TypeScript's type system extensively
   - Define interfaces for all data structures
   - Avoid type assertions except in tests

2. **Error Handling**
   - Use custom error types
   - Include relevant context in errors
   - Log errors with appropriate detail

3. **Testing**
   - Write unit tests for all services
   - Use integration tests for API interactions
   - Mock external dependencies
   - Test error cases and edge conditions

4. **Documentation**
   - Document public APIs
   - Include examples in comments
   - Keep this architecture document updated

## Future Improvements

1. **Caching**
   - Implement response caching
   - Add cache invalidation
   - Support offline operations

2. **Rate Limiting**
   - Add rate limiting middleware
   - Implement retry strategies
   - Queue operations when needed

3. **Observability**
   - Add telemetry
   - Improve error tracking
   - Add performance monitoring

4. **Developer Experience**
   - Generate API documentation
   - Add more code examples
   - Create development tools

## Contributing

When contributing to this codebase:

1. Follow the existing architecture
2. Maintain type safety
3. Add tests for new features
4. Update documentation
5. Keep files under 200 lines
6. Use meaningful commit messages

## File Organization

Keep related code together:

```
features/auth/
├── services/           # Authentication services
│   ├── auth.service.ts
│   ├── pat.service.ts
│   ├── oauth.service.ts
│   └── token.manager.ts
├── types/             # Domain types
│   └── auth.types.ts
└── __tests__/         # Tests
    ├── auth.test.ts
    └── auth.integration.test.ts
```

## Dependency Management

- Keep dependencies minimal
- Use peer dependencies where appropriate
- Lock dependency versions
- Document breaking changes
