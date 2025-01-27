/**
 * GraphQL Fragments
 * 
 * Common fragments for GraphQL queries and mutations.
 * Ensures consistent field selection across operations.
 */

export const issueFields = {
  name: 'IssueFields',
  on: 'Issue',
  fields: `
    id
    title
    description
    priority
    estimate
    boardOrder
    sortOrder
    startedAt
    completedAt
    canceledAt
    dueDate
    createdAt
    updatedAt
    number
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
      displayName
      avatarUrl
    }
    creator {
      id
      name
      email
      displayName
      avatarUrl
    }
    labels {
      nodes {
        id
        name
        color
        description
      }
    }
    children {
      nodes {
        id
        title
      }
    }
    parent {
      id
      title
    }
    team {
      ...TeamFields
    }
  `,
};

export const teamFields = {
  name: 'TeamFields',
  on: 'Team',
  fields: `
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
  `,
};

export const projectFields = {
  name: 'ProjectFields',
  on: 'Project',
  fields: `
    id
    name
    description
    icon
    color
    state
    startDate
    targetDate
    progress
    createdAt
    updatedAt
    lead {
      id
      name
      email
      displayName
      avatarUrl
    }
  `,
};

export const userFields = {
  name: 'UserFields',
  on: 'User',
  fields: `
    id
    name
    email
    displayName
    avatarUrl
    active
  `,
};

export const commentFields = {
  name: 'CommentFields',
  on: 'Comment',
  fields: `
    id
    body
    createdAt
    updatedAt
    user {
      id
      name
      displayName
      avatarUrl
    }
  `,
};

export const attachmentFields = {
  name: 'AttachmentFields',
  on: 'Attachment',
  fields: `
    id
    title
    url
    size
    contentType
    createdAt
    updatedAt
    creator {
      id
      name
      displayName
      avatarUrl
    }
  `,
};

export const labelFields = {
  name: 'LabelFields',
  on: 'IssueLabel',
  fields: `
    id
    name
    color
    description
    createdAt
    updatedAt
  `,
};

export const workflowStateFields = {
  name: 'WorkflowStateFields',
  on: 'WorkflowState',
  fields: `
    id
    name
    type
    color
    position
    description
  `,
};
