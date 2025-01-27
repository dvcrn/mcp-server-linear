/**
 * Authentication Factory
 * 
 * Creates and configures authentication services based on the provided
 * configuration. Handles the instantiation of the appropriate auth
 * strategy (OAuth or PAT).
 * 
 * Responsibilities:
 * - Authentication service creation
 * - Strategy selection
 * - Dependency injection
 */

import { IAuthService, IHttpClient, ILogger } from '../../core/interfaces';
import { AuthConfig } from '../../core/types/auth.types';
import { AuthenticationError } from '../../core/errors';
import { OAuthService } from './oauth.service';
import { PersonalAccessTokenService } from './pat.service';

export class AuthFactory {
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly logger: ILogger
  ) {}

  public async createAuthService(config: AuthConfig): Promise<IAuthService> {
    let service: IAuthService;

    switch (config.type) {
      case 'oauth':
        service = new OAuthService(this.httpClient, this.logger);
        break;
      case 'pat':
        service = new PersonalAccessTokenService(this.logger);
        break;
      default:
        throw new AuthenticationError(
          `Unsupported authentication type: ${config.type}`
        );
    }

    await service.initialize(config);
    return service;
  }

  public static async create(
    config: AuthConfig,
    httpClient: IHttpClient,
    logger: ILogger
  ): Promise<IAuthService> {
    const factory = new AuthFactory(httpClient, logger);
    return factory.createAuthService(config);
  }
}
