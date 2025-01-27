# Linear MCP

A Model Context Protocol (MCP) implementation for the Linear API. Provides a type-safe, modular interface for interacting with Linear's GraphQL API.

## Features

- 🔒 **Type-safe**: Full TypeScript support with comprehensive type definitions
- 🏗️ **Domain-driven**: Organized around business domains (issues, projects, teams)
- 🔄 **OAuth support**: Built-in OAuth 2.0 and PAT authentication
- 📦 **Modular**: Clean separation of concerns with a layered architecture
- 🛠️ **Developer-friendly**: Fluent interfaces and comprehensive documentation

## Current Status

- ✅ Authentication (PAT and OAuth)
  - Personal Access Token (PAT) authentication
  - OAuth 2.0 flow with token refresh
  - Token management and validation
- ✅ Team Operations
  - List teams with pagination
  - Get team by ID or key
  - Create and update teams
  - Team states and labels
- ✅ Issue Operations
  - CRUD operations
  - Parent/child relationships
  - Bulk operations
  - State management
  - Labels and assignments
- ✅ Integration Tests
  - Authentication flows
  - Team operations
  - Issue operations
- 🚧 Project Operations (in progress)
  - Project creation and management
  - Team assignment
  - Progress tracking
- 🚧 User Operations (in progress)
  - User management
  - Preferences
  - Teams and roles

## Quick Start

### Installation

```bash
npm install @modelcontextprotocol/linear-mcp
```

### Basic Usage

```typescript
import { LinearMCP } from '@modelcontextprotocol/linear-mcp';

// Initialize with PAT
const linear = new LinearMCP({
  auth: {
    type: 'pat',
    token: 'your-pat-token'
  }
});

// Get an issue
const issue = await linear.issues.getIssue('issue-id');

// Create a project
const project = await linear.projects.createProject({
  name: 'New Project',
  teamIds: ['team-id']
});

// Update a team
const team = await linear.teams.updateTeam('team-id', {
  name: 'Updated Team Name'
});
```

### OAuth Authentication

```typescript
const linear = new LinearMCP({
  auth: {
    type: 'oauth',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'your-redirect-uri'
  }
});

// Get auth URL
const authUrl = linear.auth.getAuthorizationUrl();

// Exchange code for tokens
const tokens = await linear.auth.authenticate({
  type: 'oauth',
  code: 'auth-code'
});
```

## Architecture

The project follows a domain-driven, layered architecture:

```
src/
├── core/               # Core types and interfaces
├── features/          # Feature modules by domain
├── infrastructure/    # Infrastructure concerns
└── utils/            # Shared utilities
```

For more details, see [architecture.md](./architecture.md).

## Documentation

- [API Reference](./docs/api.md)
- [Authentication](./docs/auth.md)
- [Error Handling](./docs/errors.md)
- [Contributing](./CONTRIBUTING.md)

## Features by Domain

### Issues

- CRUD operations
- Relationships (parent/child)
- Comments
- Labels
- State management

### Projects

- Project management
- Team assignment
- Progress tracking
- Issue organization

### Teams

- Team management
- Member management
- Settings
- States and labels

### Users

- User management
- Preferences
- Authentication
- Teams and roles

## Error Handling

```typescript
try {
  const issue = await linear.issues.getIssue('invalid-id');
} catch (error) {
  if (error instanceof LinearError) {
    console.error(error.message);
    console.error(error.code);
    console.error(error.data);
  }
}
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

### Testing

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep "issue"

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Linear API Team
- Model Context Protocol Team
- All contributors

## Support

- [GitHub Issues](https://github.com/your-org/linear-mcp/issues)
- [Documentation](./docs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linear-mcp)
