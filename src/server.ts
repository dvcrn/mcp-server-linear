/**
 * Linear MCP Server
 * 
 * Main entry point for the Linear MCP server. This file orchestrates the
 * different components of the application using dependency injection and
 * following the Domain-Driven Design architecture.
 * 
 * Responsibilities:
 * - Server initialization and configuration
 * - Service registration and dependency injection
 * - Request handling and routing
 * - Error handling and logging
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { IAuthService, IGraphQLService, ILogger } from './core/interfaces';
import { LinearError, isLinearError } from './core/errors';

export class LinearServer {
  private server: Server;
  private authService?: IAuthService;
  private graphqlService?: IGraphQLService;
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
    this.server = new Server(
      {
        name: 'linear-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupErrorHandling();
    this.setupRequestHandlers();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: unknown) => {
      if (isLinearError(error)) {
        this.logger.error('Linear error:', error);
      } else {
        this.logger.error('Unexpected error:', error instanceof Error ? error : new Error(String(error)));
      }
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Tool definitions will be moved to their respective feature modules
        // and registered here during initialization
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        // Tool handlers will be moved to their respective feature modules
        // and called here based on the request name
        throw new LinearError('Not implemented', 'NOT_IMPLEMENTED');
      } catch (error) {
        if (isLinearError(error)) {
          throw new McpError(ErrorCode.InternalError, error.message);
        }
        throw error;
      }
    });
  }

  public registerAuthService(service: IAuthService): void {
    this.authService = service;
  }

  public registerGraphQLService(service: IGraphQLService): void {
    this.graphqlService = service;
  }

  public async start(): Promise<void> {
    if (!this.authService || !this.graphqlService) {
      throw new LinearError(
        'Required services not registered',
        'INITIALIZATION_ERROR'
      );
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('Linear MCP server running on stdio');
  }
}
