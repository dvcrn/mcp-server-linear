import { LinearClient } from '@linear/sdk';
import { DocumentNode } from 'graphql';
import { Operations } from './operations';
import { IssueCreateInput, IssueUpdateInput, ProjectCreateInput, ProjectUpdateInput, WorkflowState } from '../../core/types/linear.types';

export class LinearGraphQLClient {
  private linearClient: LinearClient;

  constructor(linearClient: LinearClient) {
    this.linearClient = linearClient;
  }

  async execute<T = any, V extends Record<string, unknown> = Record<string, unknown>>(
    document: DocumentNode,
    variables?: V
  ): Promise<T> {
    const graphQLClient = this.linearClient.client;
    try {
      const response = await graphQLClient.rawRequest(
        document.loc?.source.body || '',
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
  async createIssue(input: IssueCreateInput) {
    const operation = Operations.issues.createIssue(input);
    return this.execute(operation.document, operation.variables);
  }

  // Create multiple issues
  async createIssues(issues: IssueCreateInput[]) {
    // For multiple issues, we'll need to make multiple requests
    const results = await Promise.all(issues.map(issue => this.createIssue(issue)));
    return {
      issueCreate: {
        success: results.every(r => r.issueCreate.success),
        issues: results.map(r => r.issueCreate.issue)
      }
    };
  }

  // Create project with associated issues
  async createProjectWithIssues(projectInput: ProjectCreateInput, issues: IssueCreateInput[]) {
    const projectOperation = Operations.projects.createProject(projectInput);
    const project = await this.execute(projectOperation.document, projectOperation.variables);
    
    if (!project.projectCreate?.success) {
      throw new Error('Failed to create project');
    }

    const projectId = project.projectCreate.project.id;
    const issuesWithProject = issues.map(issue => ({
      ...issue,
      projectId
    }));

    const createdIssues = await this.createIssues(issuesWithProject);
    return {
      project: project.projectCreate.project,
      issues: createdIssues.issueCreate.issues,
      success: true
    };
  }

  // Update a single issue
  async updateIssue(id: string, input: IssueUpdateInput) {
    const operation = Operations.issues.updateIssue(id, input);
    return this.execute(operation.document, operation.variables);
  }

  // Bulk update issues
  async updateIssues(ids: string[], input: IssueUpdateInput) {
    const results = await Promise.all(ids.map(id => this.updateIssue(id, input)));
    return {
      issueUpdate: {
        success: results.every(r => r.issueUpdate.success),
        issues: results.map(r => r.issueUpdate.issue)
      }
    };
  }

  // Search issues with pagination
  async searchIssues(filter: any, first: number = 50, after?: string) {
    const operation = Operations.issues.getIssues({ first, after });
    return this.execute(operation.document, operation.variables);
  }

  // Get teams with their states and labels
  async getTeams() {
    const operation = Operations.teams.getTeams();
    return this.execute(operation.document, operation.variables);
  }

  // Get current user info
  async getCurrentUser() {
    const operation = Operations.users.getViewer();
    return this.execute(operation.document, operation.variables);
  }

  // Get project info
  async getProject(id: string) {
    const operation = Operations.projects.getProject(id);
    return this.execute(operation.document, operation.variables);
  }

  // Update project
  async updateProject(id: string, input: ProjectUpdateInput) {
    const operation = Operations.projects.updateProject(id, input);
    return this.execute(operation.document, operation.variables);
  }

  // Search projects
  async searchProjects(filter: { name?: { eq: string } }) {
    const operation = Operations.projects.getProjects();
    return this.execute(operation.document, operation.variables);
  }

  // Delete an issue (by updating its state to canceled)
  async deleteIssue(id: string) {
    // Get team's canceled state
    const teams = await this.getTeams();
    const team = teams.teams.nodes[0]; // Use first team for now
    const canceledState: WorkflowState | undefined = team.states?.nodes.find(
      (state: WorkflowState) => state.type === 'canceled'
    );
    
    if (!canceledState) {
      throw new Error('No canceled state found');
    }

    const operation = Operations.issues.updateIssue(id, {
      stateId: canceledState.id
    });
    return this.execute(operation.document, operation.variables);
  }

  // Delete multiple issues
  async deleteIssues(ids: string[]) {
    const results = await Promise.all(ids.map(id => this.deleteIssue(id)));
    return {
      issueDelete: {
        success: results.every(r => r.issueUpdate.success)
      }
    };
  }
}
