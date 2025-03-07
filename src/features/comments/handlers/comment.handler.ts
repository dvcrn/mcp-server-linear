import { BaseHandler } from "../../../core/handlers/base.handler.js";
import { BaseToolResponse } from "../../../core/interfaces/tool-handler.interface.js";
import {
  CommentCreateInput,
  CommentUpdateInput,
  CommentDeleteInput,
  CommentResolveInput,
  CommentUnresolveInput,
  CustomerNeedCreateFromAttachmentInput,
} from "../types/comment.types.js";
import {
  CREATE_COMMENT,
  UPDATE_COMMENT,
  DELETE_COMMENT,
  RESOLVE_COMMENT,
  UNRESOLVE_COMMENT,
  CREATE_CUSTOMER_NEED_FROM_ATTACHMENT,
} from "../../../graphql/mutations/comment.mutations.js";

export class CommentHandler extends BaseHandler {
  async handleCommentCreate(
    args: CommentCreateInput
  ): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["body", "issueId"]);

      const response = await client.execute<{
        commentCreate: {
          success: boolean;
          comment: {
            id: string;
            body: string;
            createdAt: string;
            updatedAt: string;
          };
        };
      }>(CREATE_COMMENT, {
        input: {
          body: args.body,
          issueId: args.issueId,
        },
      });

      return this.createJsonResponse(response.commentCreate);
    } catch (error) {
      return this.handleError(error, "create comment");
    }
  }

  async handleCommentUpdate(args: {
    id: string;
    input: CommentUpdateInput;
  }): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["id", "input"]);
      this.validateRequiredParams(args.input, ["body"]);

      const response = await client.execute<{
        commentUpdate: {
          success: boolean;
          comment: {
            id: string;
            body: string;
            createdAt: string;
            updatedAt: string;
          };
        };
      }>(UPDATE_COMMENT, {
        id: args.id,
        input: args.input,
      });

      return this.createJsonResponse(response.commentUpdate);
    } catch (error) {
      return this.handleError(error, "update comment");
    }
  }

  async handleCommentDelete(
    args: CommentDeleteInput
  ): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["id"]);

      const response = await client.execute<{
        commentDelete: {
          success: boolean;
          id: string;
        };
      }>(DELETE_COMMENT, {
        id: args.id,
      });

      return this.createJsonResponse(response.commentDelete);
    } catch (error) {
      return this.handleError(error, "delete comment");
    }
  }

  async handleCommentResolve(
    args: CommentResolveInput
  ): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["id"]);

      const response = await client.execute<{
        commentResolve: {
          success: boolean;
          comment: {
            id: string;
            body: string;
            createdAt: string;
            updatedAt: string;
          };
        };
      }>(RESOLVE_COMMENT, {
        id: args.id,
        resolvingCommentId: args.resolvingCommentId,
      });

      return this.createJsonResponse(response.commentResolve);
    } catch (error) {
      return this.handleError(error, "resolve comment");
    }
  }

  async handleCommentUnresolve(
    args: CommentUnresolveInput
  ): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["id"]);

      const response = await client.execute<{
        commentUnresolve: {
          success: boolean;
          comment: {
            id: string;
            body: string;
            createdAt: string;
            updatedAt: string;
          };
        };
      }>(UNRESOLVE_COMMENT, {
        id: args.id,
      });

      return this.createJsonResponse(response.commentUnresolve);
    } catch (error) {
      return this.handleError(error, "unresolve comment");
    }
  }

  async handleCustomerNeedCreateFromAttachment(
    args: CustomerNeedCreateFromAttachmentInput
  ): Promise<BaseToolResponse> {
    try {
      const client = this.verifyAuth();
      this.validateRequiredParams(args, ["attachmentId"]);

      const response = await client.execute<{
        customerNeedCreateFromAttachment: {
          success: boolean;
          customerNeed: {
            id: string;
            title: string;
            description?: string;
          };
        };
      }>(CREATE_CUSTOMER_NEED_FROM_ATTACHMENT, {
        input: args,
      });

      return this.createJsonResponse(response.customerNeedCreateFromAttachment);
    } catch (error) {
      return this.handleError(error, "create customer need from attachment");
    }
  }
}
