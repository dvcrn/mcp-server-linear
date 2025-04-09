import { BaseToolResponse } from "../../../core/interfaces/tool-handler.interface.js";

/**
 * Input types for issue operations
 */

export interface CreateIssueInput {
  title: string;
  description: string;
  teamId: string;
  parentId?: string; // UUID of the parent issue
  labelIds?: string[]; // Label UUIDs to apply
  assigneeId?: string;
  priority?: number;
  projectId?: string;
  createAsUser?: string; // Name to display for the created issue
  displayIconUrl?: string; // URL of the avatar to display
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

export interface GetIssueInput {
  identifier: string;
}

export interface DeleteIssueInput {
  id: string;
}

export interface EditIssueInput {
  issueId: string; // Required: The UUID of the issue to update
  title?: string;
  description?: string; // Markdown format
  stateId?: string; // UUID of the target state
  priority?: number; // 0=None, 1=Urgent, 2=High, 3=Normal, 4=Low
  assigneeId?: string; // UUID of the user
  labelIds?: string[]; // Array of label UUIDs (replaces existing)
  projectId?: string; // UUID of the project
  projectMilestoneId?: string; // UUID of the project milestone
  estimate?: number; // Point estimate
  dueDate?: string; // Date in "YYYY-MM-DD" format
  parentId?: string; // UUID of the parent issue
  sortOrder?: number; // Position relative to other issues
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
  parent?: {
    id: string;
    identifier: string;
    title: string;
  };
  children?: {
    nodes: {
      id: string;
      identifier: string;
      title: string;
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
}
