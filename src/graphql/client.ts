import { LinearClient } from "@linear/sdk";
import { DocumentNode } from "graphql";
import {
  CreateIssueInput,
  CreateIssueResponse,
  CreateIssuesResponse,
  UpdateIssueInput,
  UpdateIssueResponse,
  SearchIssuesInput,
  SearchIssuesResponse,
  DeleteIssueResponse,
  Issue,
  IssueBatchResponse,
} from "../features/issues/types/issue.types.js";
import {
  ProjectInput,
  ProjectResponse,
  SearchProjectsResponse,
  ProjectFilter,
} from "../features/projects/types/project.types.js";
import {
  TeamResponse,
  LabelInput,
  LabelResponse,
} from "../features/teams/types/team.types.js";
import { UserResponse } from "../features/users/types/user.types.js";

export class LinearGraphQLClient {
  private linearClient: LinearClient;

  constructor(linearClient: LinearClient) {
    this.linearClient = linearClient;
  }

  async execute<T, V extends Record<string, unknown> = Record<string, unknown>>(
    document: DocumentNode,
    variables?: V
  ): Promise<T> {
    const graphQLClient = this.linearClient.client;
    try {
      const response = await graphQLClient.rawRequest(
        document.loc?.source.body || "",
        variables
      );
      return response.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`GraphQL operation failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Create single issue
  async createIssue(input: CreateIssueInput): Promise<CreateIssueResponse> {
    const { CREATE_ISSUE_MUTATION } = await import("./mutations.js");
    return this.execute<CreateIssueResponse>(CREATE_ISSUE_MUTATION, { input });
  }

  // Create multiple issues
  async createIssues(
    issues: CreateIssueInput[]
  ): Promise<CreateIssuesResponse> {
    const { CREATE_ISSUES_MUTATION } = await import("./mutations.js");
    return this.execute<CreateIssuesResponse>(CREATE_ISSUES_MUTATION, {
      input: issues,
    });
  }

  // Create a project
  async createProject(input: ProjectInput): Promise<ProjectResponse> {
    const { CREATE_PROJECT } = await import("./mutations.js");
    return this.execute<ProjectResponse>(CREATE_PROJECT, { input });
  }

  // Create batch of issues
  async createBatchIssues(
    issues: CreateIssueInput[]
  ): Promise<IssueBatchResponse> {
    const { CREATE_BATCH_ISSUES } = await import("./mutations.js");
    return this.execute<IssueBatchResponse>(CREATE_BATCH_ISSUES, {
      input: { issues },
    });
  }

  // Helper method to create a project with associated issues
  async createProjectWithIssues(
    projectInput: ProjectInput,
    issues: CreateIssueInput[]
  ): Promise<ProjectResponse> {
    // Create project first
    const projectResult = await this.createProject(projectInput);

    if (!projectResult.projectCreate.success) {
      throw new Error("Failed to create project");
    }

    // Then create issues with project ID
    const issuesWithProject = issues.map((issue) => ({
      ...issue,
      projectId: projectResult.projectCreate.project.id,
    }));

    const issuesResult = await this.createBatchIssues(issuesWithProject);

    if (!issuesResult.issueBatchCreate.success) {
      throw new Error("Failed to create issues");
    }

    return {
      projectCreate: projectResult.projectCreate,
      issueBatchCreate: issuesResult.issueBatchCreate,
    };
  }

  // Update a single issue
  async updateIssue(
    id: string,
    input: UpdateIssueInput
  ): Promise<UpdateIssueResponse> {
    const { UPDATE_ISSUE_MUTATION } = await import("./mutations.js");
    return this.execute<UpdateIssueResponse>(UPDATE_ISSUE_MUTATION, {
      id,
      input,
    });
  }

  // Bulk update issues
  async updateIssues(
    ids: string[],
    input: UpdateIssueInput
  ): Promise<UpdateIssueResponse> {
    // Handle bulk updates one at a time since the API only supports single updates
    const updates = await Promise.all(
      ids.map((id) => this.updateIssue(id, input))
    );

    return updates[0]; // Return the first response as they should all be similar
  }

  // Create multiple labels
  async createIssueLabels(labels: LabelInput[]): Promise<LabelResponse> {
    const { CREATE_ISSUE_LABELS } = await import("./mutations.js");
    return this.execute<LabelResponse>(CREATE_ISSUE_LABELS, { labels });
  }

  // Search issues with pagination
  async searchIssues(
    filter: SearchIssuesInput["filter"],
    first: number = 50,
    after?: string,
    orderBy: string = "updatedAt"
  ): Promise<SearchIssuesResponse> {
    // Use GET_ISSUES_BY_IDENTIFIER for identifier searches
    if (filter?.identifier?.in) {
      const { GET_ISSUES_BY_IDENTIFIER } = await import("./queries.js");
      // Extract numbers from identifiers (e.g., "78" from "MIC-78") and convert to Float
      const numbers = filter.identifier.in.map((id) =>
        parseFloat(id.split("-")[1])
      );
      return this.execute<SearchIssuesResponse>(GET_ISSUES_BY_IDENTIFIER, {
        numbers,
      });
    }

    // Use regular search query for other filters
    const { SEARCH_ISSUES_QUERY } = await import("./queries.js");
    return this.execute<SearchIssuesResponse>(SEARCH_ISSUES_QUERY, {
      filter,
      first,
      after,
      orderBy,
    });
  }

  // Get teams with their states and labels
  async getTeams(): Promise<TeamResponse> {
    const { GET_TEAMS_QUERY } = await import("./queries.js");
    return this.execute<TeamResponse>(GET_TEAMS_QUERY);
  }

  // Get current user info
  async getCurrentUser(): Promise<UserResponse> {
    const { GET_USER_QUERY } = await import("./queries.js");
    return this.execute<UserResponse>(GET_USER_QUERY);
  }

  // Get project info
  async getProject(id: string): Promise<ProjectResponse> {
    const { GET_PROJECT_QUERY } = await import("./queries.js");
    return this.execute<ProjectResponse>(GET_PROJECT_QUERY, { id });
  }

  // Search projects
  async searchProjects(
    filter?: ProjectFilter
  ): Promise<SearchProjectsResponse> {
    const { SEARCH_PROJECTS_QUERY } = await import("./queries.js");
    return this.execute<SearchProjectsResponse>(SEARCH_PROJECTS_QUERY, {
      filter,
    });
  }

  // Delete a single issue
  async deleteIssue(id: string): Promise<DeleteIssueResponse> {
    const { DELETE_ISSUES_MUTATION } = await import("./mutations.js");
    return this.execute<DeleteIssueResponse>(DELETE_ISSUES_MUTATION, {
      ids: [id],
    });
  }

  // Delete multiple issues
  async deleteIssues(ids: string[]): Promise<DeleteIssueResponse> {
    const { DELETE_ISSUES_MUTATION } = await import("./mutations.js");
    return this.execute<DeleteIssueResponse>(DELETE_ISSUES_MUTATION, { ids });
  }
}
