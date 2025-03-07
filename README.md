# Linear MCP Server

An MCP server for interacting with Linear's API. This server provides a set of tools for managing Linear issues, projects, and teams through Cline.

## Setup Guide

### 1. Get Linear API Token

1. Go to Linear: Settings > API > OAuth application > "Cline MCP"
2. Under "Developer Token", click "Create & copy token"
3. Select "Application" and copy the generated token

### 2. Configure Cline MCP

1. Open your Cline MCP settings file:
   - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

2. Add the Linear MCP server configuration:
   ```json
   {
     "mcpServers": {
       "linear": {
         "command": "npx",
         "args": ["linear-mcp"],
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

**Note**: Replace `your_linear_api_token_here` with the API token you generated in step 1.

## Available Actions

The server currently supports the following operations:

### Issue Management
- ✅ Create issues with full field support (title, description, team, project, etc.)
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
- ✅ Associate issues with projects

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
- 🚧 Cycle/milestone management

### Project Management
- 🚧 Project template support
- 🚧 Advanced project operations

### Authentication
- 🚧 OAuth flow with automatic token refresh

### Performance & Security
- 🚧 Rate limiting
- 🚧 Detailed logging
- 🚧 Load testing and optimization

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
