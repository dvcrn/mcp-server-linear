/**
 * Project operation types
 * These types define the structure for project-related operations in Linear
 */

/**
 * Input for creating a new project
 * @example
 * ```typescript
 * const projectInput: ProjectInput = {
 *   name: "Q1 Planning",
 *   description: "Q1 2025 Planning Project",
 *   teamIds: ["team-id-1", "team-id-2"], // Required: Array of team IDs this project belongs to
 *   state: "started" // Optional: Project state
 * };
 * ```
 */
export interface ProjectInput {
  /** The name of the project */
  name: string;

  /** Optional description of the project */
  description?: string;

  /**
   * Array of team IDs this project belongs to
   * @required
   * Note: Linear API requires teamIds (array) not teamId (single value)
   */
  teamIds: string[];

  /** Optional project state */
  state?: string;
}

export interface ProjectResponse {
  projectCreate: {
    success: boolean;
    project: {
      id: string;
      name: string;
      url: string;
    };
    lastSyncId: number;
  };
  issueBatchCreate?: {
    success: boolean;
    issues: Array<{
      id: string;
      identifier: string;
      title: string;
      url: string;
    }>;
    lastSyncId: number;
  };
}

/**
 * Filter for project milestone collections
 */
export interface ProjectMilestoneCollectionFilter {
  every?: ProjectMilestoneFilter;
  some?: ProjectMilestoneFilter;
  none?: ProjectMilestoneFilter;
}

/**
 * Filter for project milestone
 */
export interface ProjectMilestoneFilter {
  id?: string;
  // Add other milestone fields as needed
}

/**
 * Filter for project updates collection
 */
export interface ProjectUpdatesCollectionFilter {
  every?: ProjectUpdateFilter;
  some?: ProjectUpdateFilter;
  none?: ProjectUpdateFilter;
}

/**
 * Filter for project update
 */
export interface ProjectUpdateFilter {
  id?: string;
  // Add other update fields as needed
}

/**
 * Filter for project status
 */
export interface ProjectStatusFilter {
  eq?: string;
  in?: string[];
  neq?: string;
  nin?: string[];
}

/**
 * Project filtering options
 */
export interface ProjectFilter {
  projectMilestones?: ProjectMilestoneCollectionFilter;
  projectUpdates?: ProjectUpdatesCollectionFilter;
  nextProjectMilestone?: ProjectMilestoneFilter;
  completedProjectMilestones?: ProjectMilestoneCollectionFilter;
  and?: ProjectFilter[];
  or?: ProjectFilter[];
  status?: ProjectStatusFilter;
}

export interface SearchProjectsResponse {
  projects: {
    nodes: Array<{
      id: string;
      name: string;
      description?: string;
      url: string;
      state: string;
      teams: {
        nodes: Array<{
          id: string;
          name: string;
        }>;
      };
    }>;
  };
}
