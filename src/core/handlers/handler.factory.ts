import { LinearAuth } from "../../auth.js";
import { LinearGraphQLClient } from "../../graphql/client.js";
import { AuthHandler } from "../../features/auth/handlers/auth.handler.js";
import { IssueHandler } from "../../features/issues/handlers/issue.handler.js";
import { ProjectHandler } from "../../features/projects/handlers/project.handler.js";
import { TeamHandler } from "../../features/teams/handlers/team.handler.js";
import { UserHandler } from "../../features/users/handlers/user.handler.js";
import { CommentHandler } from "../../features/comments/handlers/comment.handler.js";

/**
 * Factory for creating and managing feature-specific handlers.
 * Ensures consistent initialization and dependency injection across handlers.
 */
const getToolName = (baseName: string): string => {
  const prefix = process.env.TOOL_PREFIX;
  return prefix ? `${prefix}_${baseName}` : baseName;
};

export class HandlerFactory {
  private authHandler: AuthHandler;
  private issueHandler: IssueHandler;
  private projectHandler: ProjectHandler;
  private teamHandler: TeamHandler;
  private userHandler: UserHandler;
  private commentHandler: CommentHandler;

  constructor(auth: LinearAuth, graphqlClient?: LinearGraphQLClient) {
    // Initialize all handlers with shared dependencies
    this.authHandler = new AuthHandler(auth, graphqlClient);
    this.issueHandler = new IssueHandler(auth, graphqlClient);
    this.projectHandler = new ProjectHandler(auth, graphqlClient);
    this.teamHandler = new TeamHandler(auth, graphqlClient);
    this.userHandler = new UserHandler(auth, graphqlClient);
    this.commentHandler = new CommentHandler(auth, graphqlClient);
  }

  /**
   * Gets the appropriate handler for a given tool name.
   */
  getHandlerForTool(toolName: string): {
    handler:
      | AuthHandler
      | IssueHandler
      | ProjectHandler
      | TeamHandler
      | UserHandler
      | CommentHandler;
    method: string;
  } {
    // Map tool names to their handlers and methods
    const handlerMap: Record<
      string,
      { handler: any; method: string; description?: string }
    > = {
      // Auth tools
      [getToolName("linear_auth")]: {
        handler: this.authHandler,
        method: "handleAuth",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_auth_callback")]: {
        handler: this.authHandler,
        method: "handleAuthCallback",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },

      // Issue tools
      [getToolName("linear_create_issue")]: {
        handler: this.issueHandler,
        method: "handleCreateIssue",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_create_issues")]: {
        handler: this.issueHandler,
        method: "handleCreateIssues",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_bulk_update_issues")]: {
        handler: this.issueHandler,
        method: "handleBulkUpdateIssues",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_search_issues")]: {
        handler: this.issueHandler,
        method: "handleSearchIssues",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_search_issues_by_identifier")]: {
        handler: this.issueHandler,
        method: "handleSearchIssuesByIdentifier",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_get_issue")]: {
        handler: this.issueHandler,
        method: "handleGetIssue",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_delete_issue")]: {
        handler: this.issueHandler,
        method: "handleDeleteIssue",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_delete_issues")]: {
        handler: this.issueHandler,
        method: "handleDeleteIssues",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },

      // Project tools
      [getToolName("linear_create_project_with_issues")]: {
        handler: this.projectHandler,
        method: "handleCreateProjectWithIssues",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_get_project")]: {
        handler: this.projectHandler,
        method: "handleGetProject",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_list_projects")]: {
        handler: this.projectHandler,
        method: "handleListProjects",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },

      // Project Milestone tools
      [getToolName("linear_get_project_milestones")]: {
        handler: this.projectHandler,
        method: "handleGetProjectMilestones",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_create_project_milestone")]: {
        handler: this.projectHandler,
        method: "handleCreateProjectMilestone",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_update_project_milestone")]: {
        handler: this.projectHandler,
        method: "handleUpdateProjectMilestone",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_delete_project_milestone")]: {
        handler: this.projectHandler,
        method: "handleDeleteProjectMilestone",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },

      // Team tools
      [getToolName("linear_get_teams")]: {
        handler: this.teamHandler,
        method: "handleGetTeams",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },

      // User tools
      [getToolName("linear_get_user")]: {
        handler: this.userHandler,
        method: "handleGetUser",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },

      // Comment tools
      [getToolName("linear_create_comment")]: {
        handler: this.commentHandler,
        method: "handleCommentCreate",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_update_comment")]: {
        handler: this.commentHandler,
        method: "handleCommentUpdate",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_delete_comment")]: {
        handler: this.commentHandler,
        method: "handleCommentDelete",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_resolve_comment")]: {
        handler: this.commentHandler,
        method: "handleCommentResolve",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_unresolve_comment")]: {
        handler: this.commentHandler,
        method: "handleCommentUnresolve",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
      [getToolName("linear_create_customer_need_from_attachment")]: {
        handler: this.commentHandler,
        method: "handleCustomerNeedCreateFromAttachment",
        description: process.env.TOOL_PREFIX
          ? `Tool for ${process.env.TOOL_PREFIX} Linear account`
          : undefined,
      },
    };

    const handlerInfo = handlerMap[toolName];
    if (!handlerInfo) {
      throw new Error(`No handler found for tool: ${toolName}`);
    }

    return handlerInfo;
  }
}
