import { gql } from 'graphql-tag';

export const CREATE_ISSUES_MUTATION = gql`
  mutation CreateIssues($input: IssueCreateInput!) {
    issueCreate(input: $input) {
      success
      issue {
        id
        identifier
        title
        url
        team {
          id
          name
        }
        project {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_PROJECT_WITH_ISSUES = gql`
  mutation CreateProjectWithIssues(
    $projectInput: ProjectCreateInput!
    $issues: [IssueCreateInput!]!
  ) {
    projectCreate(input: $projectInput) {
      success
      project {
        id
        name
        url
      }
    }
    issueCreate(input: $issues) {
      success
      issue {
        id
        identifier
        title
        url
      }
    }
  }
`;

export const UPDATE_ISSUES_MUTATION = gql`
  # This is singular
  mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
    issueUpdate(id: $id, input: $input) {
      success
      issue {
        id
        identifier
        title
        url
        state {
          name
        }
      }
    }
  }
`;

export const DELETE_ISSUE_MUTATION = gql`
  mutation DeleteIssue($id: String!) {
    issueDelete(id: $id) {
      success
    }
  }
`;

export const CREATE_ISSUE_LABELS = gql`
  mutation CreateIssueLabels($labels: [IssueLabelCreateInput!]!) {
    issueLabelCreate(input: $labels) {
      success
      issueLabels {
        id
        name
        color
      }
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: String!, $input: ProjectUpdateInput!) {
    projectUpdate(id: $id, input: $input) {
      success
      project {
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
      }
    }
  }
`;
