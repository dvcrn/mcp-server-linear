/**
 * This file contains the schema definitions for all MCP tools exposed by the Linear server.
 * These schemas define the input parameters and validation rules for each tool.
 */

const getToolName = (baseName: string): string => {
  const prefix = process.env.TOOL_PREFIX;
  return prefix ? `${prefix}_${baseName}` : baseName;
};

const getToolDescription = (description: string): string => {
  const prefix = process.env.TOOL_PREFIX;
  return prefix
    ? `For '${prefix}' Linear workspace: ${description}`
    : description;
};

export const toolSchemas = {
  // Linear Authentication Tools
  // [getToolName('linear_auth')]: {
  //   name: getToolName('linear_auth'),
  //   description: getToolDescription("Initialize OAuth flow with Linear"),
  //   inputSchema: {
  //     type: "object",
  //     properties: {
  //       clientId: {
  //         type: "string",
  //         description: "Linear OAuth client ID",
  //       },
  //       clientSecret: {
  //         type: "string",
  //         description: "Linear OAuth client secret",
  //       },
  //       redirectUri: {
  //         type: "string",
  //         description: "OAuth redirect URI",
  //       },
  //     },
  //     required: ["clientId", "clientSecret", "redirectUri"],
  //   },
  // },

  [getToolName("linear_auth_callback")]: {
    name: getToolName("linear_auth_callback"),
    description: getToolDescription("Handle OAuth callback"),
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "OAuth authorization code",
        },
      },
      required: ["code"],
    },
  },

  // Linear Issue Management Tools
  [getToolName("linear_create_issue")]: {
    name: getToolName("linear_create_issue"),
    description: getToolDescription("Create a new issue in Linear"),
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Issue title",
        },
        description: {
          type: "string",
          description: "Issue description",
        },
        teamId: {
          type: "string",
          description: "Team ID",
        },
        assigneeId: {
          type: "string",
          description: "Assignee user ID",
          optional: true,
        },
        priority: {
          type: "number",
          description: "Issue priority (0-4)",
          optional: true,
        },
        createAsUser: {
          type: "string",
          description: "Name to display for the created issue",
          optional: true,
        },
        displayIconUrl: {
          type: "string",
          description: "URL of the avatar to display",
          optional: true,
        },
      },
      required: ["title", "description", "teamId"],
    },
  },

  // Linear Project Management Tools
  [getToolName("linear_create_project_with_issues")]: {
    name: getToolName("linear_create_project_with_issues"),
    description: getToolDescription(
      "Create a new project with associated issues. Note: Project requires teamIds (array) not teamId (single value)."
    ),
    inputSchema: {
      type: "object",
      properties: {
        project: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Project name",
            },
            description: {
              type: "string",
              description: "Project description (optional)",
            },
            teamIds: {
              type: "array",
              items: {
                type: "string",
              },
              description:
                "Array of team IDs this project belongs to (Required). Use linear_get_teams to get available team IDs.",
              minItems: 1,
            },
          },
          required: ["name", "teamIds"],
        },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Issue title",
              },
              description: {
                type: "string",
                description: "Issue description",
              },
              teamId: {
                type: "string",
                description: "Team ID (must match one of the project teamIds)",
              },
            },
            required: ["title", "description", "teamId"],
          },
          description: "List of issues to create with this project",
        },
      },
      required: ["project", "issues"],
    },
    examples: [
      {
        description: "Create a project with a single team and issue",
        value: {
          project: {
            name: "Q1 Planning",
            description: "Q1 2025 Planning Project",
            teamIds: ["eng-team-id"],
          },
          issues: [
            {
              title: "Project Setup",
              description: "Initial project setup tasks",
              teamId: "eng-team-id",
            },
          ],
        },
      },
      {
        description: "Create a project with multiple teams",
        value: {
          project: {
            name: "Cross-team Initiative",
            description: "Project spanning multiple teams",
            teamIds: ["eng-team-id", "design-team-id"],
          },
          issues: [
            {
              title: "Engineering Tasks",
              description: "Tasks for engineering team",
              teamId: "eng-team-id",
            },
            {
              title: "Design Tasks",
              description: "Tasks for design team",
              teamId: "design-team-id",
            },
          ],
        },
      },
    ],
  },

  [getToolName("linear_bulk_update_issues")]: {
    name: getToolName("linear_bulk_update_issues"),
    description: getToolDescription("Update multiple issues at once"),
    inputSchema: {
      type: "object",
      properties: {
        issueIds: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of issue IDs to update",
        },
        update: {
          type: "object",
          properties: {
            stateId: {
              type: "string",
              description: "New state ID",
              optional: true,
            },
            assigneeId: {
              type: "string",
              description: "New assignee ID",
              optional: true,
            },
            priority: {
              type: "number",
              description: "New priority (0-4)",
              optional: true,
            },
          },
        },
      },
      required: ["issueIds", "update"],
    },
  },

  // Linear Search Tools
  [getToolName("linear_search_issues")]: {
    name: getToolName("linear_search_issues"),
    description: getToolDescription(
      "Search for issues with filtering and pagination"
    ),
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query string",
          optional: true,
        },
        teamIds: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Filter by team IDs",
          optional: true,
        },
        assigneeIds: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Filter by assignee IDs",
          optional: true,
        },
        states: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Filter by state names",
          optional: true,
        },
        priority: {
          type: "number",
          description: "Filter by priority (0-4)",
          optional: true,
        },
        first: {
          type: "number",
          description: "Number of issues to return (default: 50)",
          optional: true,
        },
        after: {
          type: "string",
          description: "Cursor for pagination",
          optional: true,
        },
        orderBy: {
          type: "string",
          description: "Field to order by (default: updatedAt)",
          optional: true,
        },
      },
    },
  },

  [getToolName("linear_search_issues_by_identifier")]: {
    name: getToolName("linear_search_issues_by_identifier"),
    description: getToolDescription(
      'Search for issues by their identifiers (e.g., ["ENG-78", "ENG-79"])'
    ),
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Array of issue identifiers to search for",
        },
      },
      required: ["identifiers"],
    },
  },

  // Linear Team Management Tools
  [getToolName("linear_get_teams")]: {
    name: getToolName("linear_get_teams"),
    description: getToolDescription(
      "Get all teams with their states and labels"
    ),
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  [getToolName("linear_get_user")]: {
    name: getToolName("linear_get_user"),
    description: getToolDescription("Get current user information"),
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  [getToolName("linear_delete_issue")]: {
    name: getToolName("linear_delete_issue"),
    description: getToolDescription("Delete an issue"),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Issue identifier (e.g., ENG-123)",
        },
      },
      required: ["id"],
    },
  },

  [getToolName("linear_delete_issues")]: {
    name: getToolName("linear_delete_issues"),
    description: getToolDescription("Delete multiple issues"),
    inputSchema: {
      type: "object",
      properties: {
        ids: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of issue identifiers to delete",
        },
      },
      required: ["ids"],
    },
  },

  [getToolName("linear_get_project")]: {
    name: getToolName("linear_get_project"),
    description: getToolDescription("Get project information"),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Project identifier",
        },
      },
      required: ["id"],
    },
  },

  [getToolName("linear_list_projects")]: {
    name: getToolName("linear_list_projects"),
    description: getToolDescription(
      "List all projects or filter them by criteria"
    ),
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "object",
          properties: {
            status: {
              type: "object",
              properties: {
                eq: { type: "string", description: "Equal to" },
                in: {
                  type: "array",
                  items: { type: "string" },
                  description: "In array of values",
                },
                neq: { type: "string", description: "Not equal to" },
                nin: {
                  type: "array",
                  items: { type: "string" },
                  description: "Not in array of values",
                },
              },
              description: "Filter by project status",
            },
            projectMilestones: {
              type: "object",
              description: "Filter by project milestones",
            },
            projectUpdates: {
              type: "object",
              description: "Filter by project updates",
            },
            nextProjectMilestone: {
              type: "object",
              description: "Filter by next project milestone",
            },
            completedProjectMilestones: {
              type: "object",
              description: "Filter by completed project milestones",
            },
          },
          description: "Optional filter criteria for projects",
        },
      },
    },
  },

  [getToolName("linear_create_issues")]: {
    name: getToolName("linear_create_issues"),
    description: getToolDescription("Create multiple issues at once"),
    inputSchema: {
      type: "object",
      properties: {
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Issue title",
              },
              description: {
                type: "string",
                description: "Issue description",
              },
              teamId: {
                type: "string",
                description: "Team ID",
              },
              projectId: {
                type: "string",
                description: "Project ID",
                optional: true,
              },
              labelIds: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "Label IDs to apply",
                optional: true,
              },
            },
            required: ["title", "description", "teamId"],
          },
          description: "List of issues to create",
        },
      },
      required: ["issues"],
    },
  },

  // Linear Comment Management Tools
  [getToolName("linear_create_comment")]: {
    name: getToolName("linear_create_comment"),
    description: getToolDescription("Creates a new comment on an issue"),
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "Comment text content",
        },
        issueId: {
          type: "string",
          description: "ID of the issue to comment on",
        },
      },
      required: ["body", "issueId"],
    },
  },

  [getToolName("linear_update_comment")]: {
    name: getToolName("linear_update_comment"),
    description: getToolDescription("Updates an existing comment"),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Comment ID",
        },
        input: {
          type: "object",
          properties: {
            body: {
              type: "string",
              description: "Updated comment text",
            },
          },
          required: ["body"],
        },
      },
      required: ["id", "input"],
    },
  },

  [getToolName("linear_delete_comment")]: {
    name: getToolName("linear_delete_comment"),
    description: getToolDescription("Deletes a comment"),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Comment ID to delete",
        },
      },
      required: ["id"],
    },
  },

  [getToolName("linear_resolve_comment")]: {
    name: getToolName("linear_resolve_comment"),
    description: getToolDescription("Resolves a comment"),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Comment ID to resolve",
        },
        resolvingCommentId: {
          type: "string",
          description: "Optional ID of a resolving comment",
          optional: true,
        },
      },
      required: ["id"],
    },
  },

  [getToolName("linear_unresolve_comment")]: {
    name: getToolName("linear_unresolve_comment"),
    description: getToolDescription("Unresolves a comment"),
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Comment ID to unresolve",
        },
      },
      required: ["id"],
    },
  },

  // Linear Customer Need Tools
  [getToolName("linear_create_customer_need_from_attachment")]: {
    name: getToolName("linear_create_customer_need_from_attachment"),
    description: getToolDescription(
      "Creates a new customer need from an attachment"
    ),
    inputSchema: {
      type: "object",
      properties: {
        attachmentId: {
          type: "string",
          description: "ID of the attachment",
        },
        title: {
          type: "string",
          description: "Title for the customer need",
          optional: true,
        },
        description: {
          type: "string",
          description: "Description for the customer need",
          optional: true,
        },
        teamId: {
          type: "string",
          description: "Team ID for the customer need",
          optional: true,
        },
      },
      required: ["attachmentId"],
    },
  },
};
