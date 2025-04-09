import { BaseHandler } from "../../../core/handlers/base.handler.js";
import { BaseToolResponse } from "../../../core/interfaces/tool-handler.interface.js";
import { LinearAuth } from "../../../auth.js";
import { LinearGraphQLClient } from "../../../graphql/client.js";
import {
  IssueHandlerMethods,
  CreateIssueInput,
  CreateIssuesInput,
  BulkUpdateIssuesInput,
  SearchIssuesInput,
  SearchIssuesByIdentifierInput,
  DeleteIssueInput,
  CreateIssueResponse,
  CreateIssuesResponse,
  UpdateIssueResponse,
  SearchIssuesResponse,
  DeleteIssueResponse,
  Issue,
  IssueBatchResponse,
  GetIssueInput,
  EditIssueInput,
} from "../types/issue.types.js";
import { DocumentNode } from "graphql";

/**
 * Handler for issue-related operations.
 * Manages creating, updating, searching, and deleting issues.
 */
export class IssueHandler extends BaseHandler implements IssueHandlerMethods {
  constructor(auth: LinearAuth, graphqlClient?: LinearGraphQLClient) {
    super(auth, graphqlClient);
  }

  /**
   * Creates a single issue.
   */
  async handleCreateIssue(args: CreateIssueInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["title", "description", "teamId"]);

      const result = (await client.createIssue(args)) as CreateIssueResponse;

      if (!result.issueCreate.success || !result.issueCreate.issue) {
        throw new Error("Failed to create issue");
      }

      const issue = result.issueCreate.issue;

      const parentInfo = issue.parent
        ? `Parent: ${issue.parent.identifier} (${issue.parent.title})\n`
        : "";
      const childrenInfo = issue.children?.nodes?.length
        ? `Children:\n${issue.children.nodes
            .map((child) => `- ${child.identifier}: ${child.title}`)
            .join("\n")}\n`
        : "";

      return this.createJsonResponse({
        issueCreate: {
          success: true,
          issue: {
            identifier: issue.identifier,
            title: issue.title,
            url: issue.url,
            project: issue.project,
            parent: issue.parent,
            children: issue.children,
          },
        },
      });
    } catch (error) {
      this.handleError(error, "create issue");
    }
  }

  /**
   * Creates multiple issues in bulk.
   */
  async handleCreateIssues(args: CreateIssuesInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["issues"]);

      if (!Array.isArray(args.issues)) {
        throw new Error("Issues parameter must be an array");
      }

      const result = (await client.createIssues(
        args.issues
      )) as IssueBatchResponse;

      if (!result.issueBatchCreate.success) {
        throw new Error("Failed to create issues");
      }

      const createdIssues = result.issueBatchCreate.issues;

      return this.createResponse(
        `Successfully created ${createdIssues.length} issues:\n` +
          createdIssues
            .map(
              (issue: Issue) =>
                `- ${issue.identifier}: ${issue.title}\n  URL: ${issue.url}`
            )
            .join("\n")
      );
    } catch (error) {
      this.handleError(error, "create issues");
    }
  }

  /**
   * Updates multiple issues in bulk.
   */
  async handleBulkUpdateIssues(
    args: BulkUpdateIssuesInput
  ): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["issueIds", "update"]);

      if (!Array.isArray(args.issueIds)) {
        throw new Error("IssueIds parameter must be an array");
      }

      const result = (await client.updateIssues(
        args.issueIds,
        args.update
      )) as UpdateIssueResponse;

      if (!result.issueUpdate.success) {
        throw new Error("Failed to update issues");
      }

      // Since the response only contains a single issue, we count the number of IDs that were updated
      const updatedCount = args.issueIds.length;

      return this.createResponse(`Successfully updated ${updatedCount} issues`);
    } catch (error) {
      this.handleError(error, "update issues");
    }
  }

  /**
   * Searches for issues with filtering and pagination.
   */
  async handleSearchIssues(args: SearchIssuesInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();

      const filter: Record<string, unknown> = {};

      // Handle identifier-based searches first
      if (args.filter?.identifier) {
        filter.identifier = { in: [args.filter.identifier] };
      }
      // If there's a query but no identifier filter, use it for searching
      else if (args.query) {
        // Pass the raw query to use Linear's native search capabilities
        filter.search = args.query;
      }

      if (args.filter?.project?.id?.eq) {
        filter.project = { id: { eq: args.filter.project.id.eq } };
      }
      if (args.teamIds) {
        filter.team = { id: { in: args.teamIds } };
      }
      if (args.assigneeIds) {
        filter.assignee = { id: { in: args.assigneeIds } };
      }
      if (args.states) {
        filter.state = { name: { in: args.states } };
      }
      if (typeof args.priority === "number") {
        filter.priority = { eq: args.priority };
      }

      const result = (await client.searchIssues(
        filter,
        args.first || 50,
        args.after,
        args.orderBy || "updatedAt"
      )) as SearchIssuesResponse;

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, "search issues");
    }
  }

  /**
   * Search for issues by their identifiers (e.g., ["MIC-78", "MIC-79"])
   */
  async handleSearchIssuesByIdentifier(
    args: SearchIssuesByIdentifierInput
  ): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["identifiers"]);

      if (!Array.isArray(args.identifiers)) {
        throw new Error("Identifiers parameter must be an array");
      }

      const result = (await client.searchIssues(
        { identifier: { in: args.identifiers } },
        100,
        undefined,
        "updatedAt"
      )) as SearchIssuesResponse;

      return this.createJsonResponse(result);
    } catch (error) {
      this.handleError(error, "search issues by identifier");
    }
  }

  /**
   * Get a single issue by identifier, including all comments
   */
  async handleGetIssue(args: GetIssueInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["identifier"]);

      // Use the same query as search by identifier but with a single identifier
      const result = (await client.searchIssues(
        { identifier: { in: [args.identifier] } },
        1,
        undefined,
        "updatedAt"
      )) as SearchIssuesResponse;

      if (!result.issues.nodes || result.issues.nodes.length === 0) {
        throw new Error(`Issue ${args.identifier} not found`);
      }

      return this.createJsonResponse({
        issue: result.issues.nodes[0],
      });
    } catch (error) {
      this.handleError(error, "get issue");
    }
  }

  /**
   * Deletes a single issue.
   */
  async handleDeleteIssue(args: DeleteIssueInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["id"]);

      const result = (await client.deleteIssue(args.id)) as DeleteIssueResponse;

      if (!result.issueDelete.success) {
        throw new Error("Failed to delete issue");
      }

      return this.createResponse(`Successfully deleted issue ${args.id}`);
    } catch (error) {
      this.handleError(error, "delete issue");
    }
  }

  /**
   * Edits a single issue.
   */
  async handleEditIssue(args: EditIssueInput): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["issueId"]);

      // Construct the input object for the GraphQL mutation
      // Only include fields that are actually provided in the args
      const updateInput: Record<string, any> = {};
      const optionalFields: (keyof EditIssueInput)[] = [
        "title",
        "description",
        "stateId",
        "priority",
        "assigneeId",
        "labelIds",
        "projectId",
        "projectMilestoneId",
        "estimate",
        "dueDate",
        "parentId",
        "sortOrder",
      ];

      optionalFields.forEach((field) => {
        // Check for undefined or null, allowing empty strings and 0
        if (args[field] !== undefined && args[field] !== null) {
          updateInput[field] = args[field];
        }
      });

      // Check if any update fields were provided besides issueId
      if (Object.keys(updateInput).length === 0) {
        throw new Error(
          "No fields provided to update for issue " + args.issueId
        );
      }

      // Call the GraphQL client method (to be implemented in Step 5)
      // Assuming it returns an object like { issueUpdate: { success: boolean, issue: Issue } }
      const result = await client.updateIssue(args.issueId, updateInput);

      if (!result?.issueUpdate?.success || !result?.issueUpdate?.issue) {
        throw new Error(
          `Failed to update issue ${
            args.issueId
          }. API response: ${JSON.stringify(result)}`
        );
      }

      const updatedIssue = result.issueUpdate.issue;

      // Return a success response with basic issue details
      return this.createJsonResponse({
        issueUpdate: {
          success: true,
          issue: {
            id: updatedIssue.id,
            identifier: updatedIssue.identifier,
            title: updatedIssue.title,
            url: updatedIssue.url,
            updatedAt: updatedIssue.updatedAt, // Include updatedAt for confirmation
          },
        },
      });
    } catch (error) {
      this.handleError(error, "edit issue");
    }
  }
}
