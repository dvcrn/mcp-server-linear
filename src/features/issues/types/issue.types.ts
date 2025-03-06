import { BaseToolResponse } from "../../../core/interfaces/tool-handler.interface.js";

/**
 * Input types for issue operations
 */

export interface CreateIssueInput {
  title: string;
  description: string;
  teamId: string;
  assigneeId?: string;
  priority?: number;
  projectId?: string;
}

export interface CreateIssuesInput {
  issues: CreateIssueInput[];
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  assigneeId?: string;
  priority?: number;
  projectId?: string;
  stateId?: string;
}

export interface BulkUpdateIssuesInput {
  issueIds: string[];
  update: UpdateIssueInput;
}

export interface SearchIssuesInput {
  query?: string;
  filter?: {
    project?: {
      id?: {
        eq?: string;
      };
    };
    identifier?: {
      in: string[];
    };
  };
  teamIds?: string[];
  assigneeIds?: string[];
  states?: string[];
  priority?: number;
  first?: number;
  after?: string;
  orderBy?: string;
}

export interface SearchIssuesByIdentifierInput {
  identifiers: string[];
}

export interface DeleteIssueInput {
  id: string;
}

export interface DeleteIssuesInput {
  ids: string[];
}

/**
 * Response types for issue operations
 */

export interface Issue {
  id: string;
  identifier: string;
  title: string;
  url: string;
  state: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    name: string;
  };
  priority?: number;
  labels?: {
    nodes: {
      id: string;
      name: string;
      color: string;
    }[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIssueResponse {
  issueCreate: {
    success: boolean;
    issue?: Issue;
  };
}

export interface CreateIssuesResponse {
  issueCreate: {
    success: boolean;
    issues: Issue[];
  };
}

export interface IssueBatchResponse {
  issueBatchCreate: {
    success: boolean;
    issues: Issue[];
    lastSyncId: number;
  };
}

export interface UpdateIssueResponse {
  issueUpdate: {
    success: boolean;
    issue: Issue;
  };
}

export interface SearchIssuesResponse {
  issues: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: Issue[];
  };
}

export interface DeleteIssueResponse {
  issueDelete: {
    success: boolean;
  };
}

/**
 * Handler method types
 */

export interface IssueHandlerMethods {
  handleCreateIssue(args: CreateIssueInput): Promise<BaseToolResponse>;
  handleCreateIssues(args: CreateIssuesInput): Promise<BaseToolResponse>;
  handleBulkUpdateIssues(
    args: BulkUpdateIssuesInput
  ): Promise<BaseToolResponse>;
  handleSearchIssues(args: SearchIssuesInput): Promise<BaseToolResponse>;
  handleSearchIssuesByIdentifier(
    args: SearchIssuesByIdentifierInput
  ): Promise<BaseToolResponse>;
  handleDeleteIssue(args: DeleteIssueInput): Promise<BaseToolResponse>;
  handleDeleteIssues(args: DeleteIssuesInput): Promise<BaseToolResponse>;
}
