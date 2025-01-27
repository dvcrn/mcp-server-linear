/**
 * Linear Types
 * 
 * Type definitions for Linear API responses and entities.
 */

import { Connection, Node, Timestamps } from './common.types';

// Base Entities
export interface User extends Node, Timestamps {
  name: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  active: boolean;
}

export interface Team extends Node, Timestamps {
  name: string;
  key: string;
  description?: string;
  icon?: string;
  private: boolean;
  settings: TeamSettings;
  members?: Connection<TeamMember>;
  states?: Connection<WorkflowState>;
  labels?: Connection<IssueLabel>;
}

export interface Project extends Node, Timestamps {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  state: string;
  startDate?: string;
  targetDate?: string;
  progress: number;
  lead?: User;
  members?: Connection<User>;
  teams?: Connection<Team>;
  issues?: Connection<Issue>;
}

// Entity Components
export interface TeamSettings {
  defaultIssueEstimate: number;
  defaultTemplateForMembers?: string;
  defaultTemplateForNonMembers?: string;
  issueEstimationType: string;
  upcomingCycleCount: number;
}

export interface TeamMember extends Node {
  owner: boolean;
  user: User;
}

export interface Issue extends Node, Timestamps {
  title: string;
  description?: string;
  priority: number;
  estimate?: number;
  boardOrder: number;
  sortOrder: number;
  startedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  dueDate?: string;
  number: number;
  state: WorkflowState;
  assignee?: User;
  creator: User;
  team: Team;
  parent?: Issue;
  children?: Connection<Issue>;
  labels?: Connection<IssueLabel>;
  project?: Project;
}

export interface WorkflowState extends Node {
  name: string;
  type: string;
  color: string;
  position: number;
  description?: string;
}

export interface IssueLabel extends Node, Timestamps {
  name: string;
  color: string;
  description?: string;
}

// Input Types
export interface IssueCreateInput {
  teamId: string;
  title: string;
  description?: string;
  priority?: number;
  estimate?: number;
  stateId?: string;
  assigneeId?: string;
  parentId?: string;
  labelIds?: string[];
  projectId?: string;
}

export interface IssueUpdateInput {
  title?: string;
  description?: string;
  priority?: number;
  estimate?: number;
  stateId?: string;
  assigneeId?: string;
  parentId?: string;
  labelIds?: string[];
  projectId?: string;
}

export interface TeamCreateInput {
  name: string;
  key: string;
  description?: string;
  icon?: string;
  private?: boolean;
  settings?: Partial<TeamSettings>;
}

export interface TeamUpdateInput {
  name?: string;
  key?: string;
  description?: string;
  icon?: string;
  private?: boolean;
  settings?: Partial<TeamSettings>;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  state?: string;
  startDate?: string;
  targetDate?: string;
  leadId?: string;
  teamIds?: string[];
  progress?: number;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  state?: string;
  startDate?: string;
  targetDate?: string;
  leadId?: string;
  teamIds?: string[];
  progress?: number;
}

// Error Types
export interface LinearError extends Error {
  code?: string;
  data?: unknown;
}

export interface LinearErrorResponse {
  error: LinearError;
}

// Re-export common types
export { Connection, Node, Timestamps, PageInfo } from './common.types';
