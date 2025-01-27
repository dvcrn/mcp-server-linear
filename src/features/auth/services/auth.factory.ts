/**
 * Auth Factory
 * 
 * Creates appropriate authentication service based on configuration.
 */

import { Logger } from '../../../utils/logger';
import { ConfigService } from '../../../utils/config.service';
import { AuthConfig } from './auth.service';
import { OAuthService } from './oauth.service';
import { PATService } from './pat.service';

export class AuthFactory {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService
  ) {}

  /**
   * Create auth service based on config
   */
  createAuthService(config: AuthConfig): OAuthService | PATService {
    switch (config.type) {
      case 'oauth':
        return new OAuthService(config, this.logger, this.configService);
      case 'pat':
        return new PATService(config, this.logger);
      default:
        throw new Error(`Unsupported auth type: ${config.type}`);
    }
  }
}
