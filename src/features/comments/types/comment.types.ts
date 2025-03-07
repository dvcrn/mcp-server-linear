export interface CommentCreateInput {
  body: string;
  issueId: string;
}

export interface CommentUpdateInput {
  body?: string;
}

export interface CommentDeleteInput {
  id: string;
}

export interface CommentResolveInput {
  id: string;
  resolvingCommentId?: string;
}

export interface CommentUnresolveInput {
  id: string;
}

export interface CustomerNeedCreateFromAttachmentInput {
  attachmentId: string;
  // Additional fields based on Linear API requirements
  title?: string;
  description?: string;
  teamId?: string;
}

export interface CommentPayload {
  success: boolean;
  comment?: {
    id: string;
    body: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface DeletePayload {
  success: boolean;
  id: string;
}

export interface CustomerNeedPayload {
  success: boolean;
  customerNeed?: {
    id: string;
    title: string;
    description?: string;
  };
}
