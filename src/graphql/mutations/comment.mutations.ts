import { gql } from "graphql-tag";

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentCreateInput!) {
    commentCreate(input: $input) {
      success
      comment {
        id
        body
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: String!, $input: CommentUpdateInput!) {
    commentUpdate(id: $id, input: $input) {
      success
      comment {
        id
        body
        createdAt
        updatedAt
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    commentDelete(id: $id) {
      success
      id
    }
  }
`;

export const RESOLVE_COMMENT = gql`
  mutation ResolveComment($id: String!, $resolvingCommentId: String) {
    commentResolve(id: $id, resolvingCommentId: $resolvingCommentId) {
      success
      comment {
        id
        body
        createdAt
        updatedAt
      }
    }
  }
`;

export const UNRESOLVE_COMMENT = gql`
  mutation UnresolveComment($id: String!) {
    commentUnresolve(id: $id) {
      success
      comment {
        id
        body
        createdAt
        updatedAt
      }
    }
  }
`;

export const CREATE_CUSTOMER_NEED_FROM_ATTACHMENT = gql`
  mutation CreateCustomerNeedFromAttachment(
    $input: CustomerNeedCreateFromAttachmentInput!
  ) {
    customerNeedCreateFromAttachment(input: $input) {
      success
      customerNeed {
        id
        title
        description
      }
    }
  }
`;
