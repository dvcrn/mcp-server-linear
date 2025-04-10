# Linear MCP Server

An MCP server for interacting with Linear's API. This server provides a set of tools for managing Linear issues, projects, and teams through Cline.

## Setup Guide

### 1. Get Linear API Token

You can use either a **Developer Token** or a **Personal API Key**.

**Option 1: Developer Token**
1. Go to Linear: Workspace Settings > API > OAuth application > Create or select an application (e.g., "Cline MCP").
2. Under "Developer Token", click "Create & copy token".
3. Select "Application" as the actor and copy the generated token.

**Option 2: Personal API Key**
1. Go to Linear: Your Personal Settings > API > Personal API Keys.
2. Click "Create key", give it a label (e.g., "Cline MCP"), and copy the generated key.

### 2. Configure Cline MCP

1. Open your Cline MCP settings file:
   - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%/Code/User/GlobalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add the Linear MCP server configuration:
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["mcp-server-linear"],
         "env": {
           "LINEAR_ACCESS_TOKEN": "your_linear_api_token_here"
         },
         "disabled": false,
         "autoApprove": []
       }
     }
   }
   ```

That's it! The server will be automatically downloaded and run through npx when needed.

If you use Cline/Roo, you can also simply tell it `install the MCP from https://github.com/dvcrn/mcp-server-linear` and it'll do the rest.


## Available Actions

The server currently supports the following operations:

### Issue Management
- ✅ Create issues with full field support (title, description, team, project, parent/child relationships, etc.)
- ✅ Update existing issues (priority, description, etc.)
- ✅ Delete issues (single or bulk deletion)
- ✅ Search issues with filtering and by identifier
- ✅ Associate issues with projects
- ✅ Create parent/child issue relationships
- ✅ Comment management (create, update, delete comments)
- ✅ Comment resolution handling (resolve/unresolve comments)
- ✅ Create customer needs from attachments

### Project Management
- ✅ Create projects with associated issues
- ✅ Get project information
- ✅ List all projects with optional filtering
- ✅ Associate issues with projects
- ✅ Project milestone management (create, update, delete)
- ✅ List and filter project milestones

### Team Management
- ✅ Get team information (with states and workflow details)
- ✅ Access team states and labels

### Authentication
- ✅ Personal Access Token (PAT) authentication
- ✅ Secure token storage

### Batch Operations
- ✅ Bulk issue creation
- ✅ Bulk issue deletion

### Bulk Updates (In Testing)
- 🚧 Bulk issue updates (parallel processing implemented, needs testing)

## Features in Development

The following features are currently being worked on:

### Issue Management
- 🚧 Complex search filters
- 🚧 Pagination support for large result sets

### Metadata Operations
- 🚧 Label management (create/update/assign)

### Project Management
- ✅ Project milestone management
- 🚧 Project template support
- 🚧 Advanced project operations

### Authentication
- 🚧 OAuth flow with automatic token refresh

### Performance & Security
- 🚧 Rate limiting
- 🚧 Detailed logging
- 🚧 Load testing and optimization

## Parent/Child Issue Relationships

The server supports creating and managing hierarchical relationships between issues:

### Creating Sub-issues
You can create sub-issues by specifying a parent issue's UUID when creating a new issue:

```json
{
  "title": "Sub-task Implementation",
  "description": "Implement this specific part of the parent task",
  "teamId": "team_uuid",
  "parentId": "parent_issue_uuid"
}
```

Note: The parentId must be the UUID of the parent issue, not the issue identifier (e.g., use the UUID, not "ENG-123").

## Using Multiple Linear Workspaces

You can connect to multiple Linear workspaces by adding the Linear MCP server multiple times with different `TOOL_PREFIX` values. This allows you to work with separate Linear workspaces within the same Cline environment.

### Configuration Example

```json
{
  "mcpServers": {
    "company1-linear": {
      "command": "npx",
      "args": ["mcp-server-linear"],
      "env": {
        "LINEAR_ACCESS_TOKEN": "your_company1_linear_token_here",
        "TOOL_PREFIX": "company1"
      },
      "disabled": false,
      "autoApprove": []
    },
    "company2-linear": {
      "command": "npx",
      "args": ["mcp-server-linear"],
      "env": {
        "LINEAR_ACCESS_TOKEN": "your_company2_linear_token_here",
        "TOOL_PREFIX": "company2"
      },
      "disabled": false,
      "autoApprove": []
    },
    "company3-linear": {
      "command": "npx",
      "args": ["mcp-server-linear"],
      "env": {
        "LINEAR_ACCESS_TOKEN": "your_company3_linear_token_here",
        "TOOL_PREFIX": "company3"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### How It Works

When you set a `TOOL_PREFIX` value:

1. All tool names are prefixed with it (e.g., `company1_linear_create_issue`)
2. Tool descriptions include the prefix (e.g., "For 'company1' Linear workspace: Create a new issue")

This makes it clear which workspace each tool is operating on and prevents conflicts between different Linear instances.

## Contributing

If you want to contribute to the development of this MCP server, follow these steps:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Add your Linear API token to `.env`:
   ```
   LINEAR_ACCESS_TOKEN=your_personal_access_token
   ```

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build and run the server locally
npm run build
npm start

# Or use development mode with auto-reload
npm run dev
```

### Integration Testing

Integration tests verify that authentication and API calls work correctly:

1. Set up authentication in `.env` (PAT recommended for testing)
2. Run integration tests:
   ```bash
   npm run test:integration
   ```

For OAuth testing:
1. Configure OAuth credentials in `.env`:
   ```
   LINEAR_CLIENT_ID=your_oauth_client_id
   LINEAR_CLIENT_SECRET=your_oauth_client_secret
   LINEAR_REDIRECT_URI=http://localhost:3000/callback
   ```
2. Remove `.skip` from OAuth tests in `src/__tests__/auth.integration.test.ts`
3. Run integration tests
