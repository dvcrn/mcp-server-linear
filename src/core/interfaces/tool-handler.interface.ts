/**
 * Interface for handling MCP tool requests.
 * Each handler corresponds to a specific Linear API operation.
 */
export interface ToolHandler {
  // Authentication
  handleAuth(args: any): Promise<BaseToolResponse>;
  handleAuthCallback(args: any): Promise<BaseToolResponse>;

  // Issue Operations
  handleCreateIssue(args: any): Promise<BaseToolResponse>;
  handleCreateIssues(args: any): Promise<BaseToolResponse>;
  handleBulkUpdateIssues(args: any): Promise<BaseToolResponse>;
  handleSearchIssues(args: any): Promise<BaseToolResponse>;
  handleSearchIssuesByIdentifier(args: any): Promise<BaseToolResponse>;
  handleGetIssue(args: any): Promise<BaseToolResponse>;
  handleDeleteIssue(args: any): Promise<BaseToolResponse>;
  handleDeleteIssues(args: any): Promise<BaseToolResponse>;
  handleEditIssue(args: any): Promise<BaseToolResponse>;

  // Project Operations
  handleCreateProjectWithIssues(args: any): Promise<BaseToolResponse>;
  handleGetProject(args: any): Promise<BaseToolResponse>;
  handleListProjects(args: any): Promise<BaseToolResponse>;

  // Team Operations
  handleGetTeams(args: any): Promise<BaseToolResponse>;

  // User Operations
  handleGetUser(args: any): Promise<BaseToolResponse>;

  // Comment Operations
  handleCommentCreate(args: any): Promise<BaseToolResponse>;
  handleCommentUpdate(args: any): Promise<BaseToolResponse>;
  handleCommentDelete(args: any): Promise<BaseToolResponse>;
  handleCommentResolve(args: any): Promise<BaseToolResponse>;
  handleCommentUnresolve(args: any): Promise<BaseToolResponse>;
  handleCustomerNeedCreateFromAttachment(args: any): Promise<BaseToolResponse>;
}

/**
 * Base response type for all tool handlers
 */
export interface BaseToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * Error response for tool handlers
 */
export interface ErrorToolResponse extends BaseToolResponse {
  isError: true;
}
