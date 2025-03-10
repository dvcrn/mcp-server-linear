import { gql } from "graphql-tag";

export const SEARCH_ISSUES_QUERY = gql`
  query SearchIssues(
    $filter: IssueFilter
    $first: Int
    $after: String
    $orderBy: PaginationOrderBy
  ) {
    issues(filter: $filter, first: $first, after: $after, orderBy: $orderBy) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        identifier
        title
        description
        url
        state {
          id
          name
          type
          color
        }
        assignee {
          id
          name
          email
        }
        team {
          id
          name
          key
        }
        project {
          id
          name
        }
        priority
        labels {
          nodes {
            id
            name
            color
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_ISSUES_BY_IDENTIFIER = gql`
  query GetIssuesByIdentifier($numbers: [Float!]!) {
    issues(
      filter: { number: { in: $numbers } }
      first: 100
      orderBy: updatedAt
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        identifier
        title
        description
        url
        state {
          id
          name
          type
          color
        }
        assignee {
          id
          name
          email
        }
        team {
          id
          name
          key
        }
        project {
          id
          name
        }
        priority
        labels {
          nodes {
            id
            name
            color
          }
        }
        comments {
          nodes {
            id
            body
            user {
              id
              name
              email
            }
            createdAt
            updatedAt
            resolvedAt
            resolvingComment {
              id
              body
            }
          }
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_TEAMS_QUERY = gql`
  query GetTeams {
    teams {
      nodes {
        id
        name
        key
        description
        states {
          nodes {
            id
            name
            type
            color
          }
        }
        labels {
          nodes {
            id
            name
            color
          }
        }
      }
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser {
    viewer {
      id
      name
      email
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  }
`;

export const SEARCH_PROJECTS_QUERY = gql`
  query SearchProjects($filter: ProjectFilter) {
    projects(filter: $filter) {
      nodes {
        id
        name
        description
        url
        state
        teams {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_PROJECT_QUERY = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
      description
      url
      teams {
        nodes {
          id
          name
        }
      }
      projectMilestones {
        nodes {
          id
          name
          description
          targetDate
          progress
          sortOrder
          archivedAt
          createdAt
          updatedAt
          currentProgress
          progressHistory
          descriptionState
          documentContent {
            content
          }
          project {
            id
            name
          }
          issues {
            nodes {
              id
              identifier
              title
            }
          }
        }
      }
    }
  }
`;

export const GET_PROJECT_MILESTONES = gql`
  query GetProjectMilestones(
    $filter: ProjectMilestoneFilter
    $first: Int
    $after: String
    $last: Int
    $before: String
    $includeArchived: Boolean
    $orderBy: PaginationOrderBy
  ) {
    projectMilestones(
      filter: $filter
      first: $first
      after: $after
      last: $last
      before: $before
      includeArchived: $includeArchived
      orderBy: $orderBy
    ) {
      nodes {
        id
        name
        description
        targetDate
        progress
        sortOrder
        archivedAt
        createdAt
        updatedAt
        currentProgress
        progressHistory
        descriptionState
        documentContent {
          content
        }
        project {
          id
          name
        }
        issues {
          nodes {
            id
            identifier
            title
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
