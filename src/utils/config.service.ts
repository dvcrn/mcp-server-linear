/**
 * Configuration Service
 * 
 * Manages application configuration and environment variables.
 * Features:
 * - Type-safe configuration access
 * - Environment variable validation
 * - Default values
 * - Configuration schema validation
 */

import { LogLevel } from '../core/types/logger.types.js';

export interface AuthConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  accessToken?: string;
  scopes?: string[];
}

export interface LoggingConfig {
  level: LogLevel;
  enableConsole: boolean;
  formatOutput: boolean;
}

export interface HttpConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface AppConfig {
  auth: AuthConfig;
  logging: LoggingConfig;
  http: HttpConfig;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get the full configuration object
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get authentication configuration
   */
  getAuthConfig(): AuthConfig {
    return this.config.auth;
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig(): LoggingConfig {
    return this.config.logging;
  }

  /**
   * Get HTTP client configuration
   */
  getHttpConfig(): HttpConfig {
    return this.config.http;
  }

  /**
   * Load and validate configuration from environment variables
   */
  private loadConfig(): AppConfig {
    const config: AppConfig = {
      auth: this.loadAuthConfig(),
      logging: this.loadLoggingConfig(),
      http: this.loadHttpConfig(),
    };

    this.validateConfig(config);
    return config;
  }

  /**
   * Load authentication configuration
   */
  private loadAuthConfig(): AuthConfig {
    return {
      clientId: process.env.LINEAR_CLIENT_ID,
      clientSecret: process.env.LINEAR_CLIENT_SECRET,
      redirectUri: process.env.LINEAR_REDIRECT_URI,
      accessToken: process.env.LINEAR_ACCESS_TOKEN,
      scopes: process.env.LINEAR_SCOPES?.split(','),
    };
  }

  /**
   * Load logging configuration
   */
  private loadLoggingConfig(): LoggingConfig {
    return {
      level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      formatOutput: process.env.LOG_FORMAT_OUTPUT !== 'false',
    };
  }

  /**
   * Load HTTP client configuration
   */
  private loadHttpConfig(): HttpConfig {
    const config: HttpConfig = {
      baseUrl: process.env.LINEAR_API_URL || 'https://api.linear.app',
      timeout: parseInt(process.env.HTTP_TIMEOUT || '30000', 10),
      maxRetries: parseInt(process.env.HTTP_MAX_RETRIES || '3', 10),
    };

    const maxRequests = process.env.HTTP_RATE_LIMIT_MAX_REQUESTS;
    const windowMs = process.env.HTTP_RATE_LIMIT_WINDOW_MS;

    if (maxRequests && windowMs) {
      config.rateLimit = {
        maxRequests: parseInt(maxRequests, 10),
        windowMs: parseInt(windowMs, 10),
      };
    }

    return config;
  }

  /**
   * Validate the configuration
   */
  private validateConfig(config: AppConfig): void {
    // Validate auth config
    if (!config.auth.accessToken && !(config.auth.clientId && config.auth.clientSecret)) {
      throw new ConfigError(
        'Either LINEAR_ACCESS_TOKEN or both LINEAR_CLIENT_ID and LINEAR_CLIENT_SECRET must be provided'
      );
    }

    if (config.auth.clientId && config.auth.clientSecret && !config.auth.redirectUri) {
      throw new ConfigError(
        'LINEAR_REDIRECT_URI must be provided when using OAuth authentication'
      );
    }

    // Validate HTTP config
    if (config.http.timeout < 1000) {
      throw new ConfigError('HTTP_TIMEOUT must be at least 1000ms');
    }

    if (config.http.maxRetries < 0) {
      throw new ConfigError('HTTP_MAX_RETRIES must be non-negative');
    }

    if (config.http.rateLimit) {
      if (config.http.rateLimit.maxRequests < 1) {
        throw new ConfigError('HTTP_RATE_LIMIT_MAX_REQUESTS must be positive');
      }
      if (config.http.rateLimit.windowMs < 1000) {
        throw new ConfigError('HTTP_RATE_LIMIT_WINDOW_MS must be at least 1000ms');
      }
    }

    // Validate logging config
    if (!Object.values(LogLevel).includes(config.logging.level)) {
      throw new ConfigError(
        `LOG_LEVEL must be one of: ${Object.values(LogLevel).join(', ')}`
      );
    }
  }

  /**
   * Create a new instance with overridden configuration
   */
  static fromConfig(config: Partial<AppConfig>): ConfigService {
    const service = new ConfigService();
    service.config = {
      ...service.config,
      ...config,
      auth: {
        ...service.config.auth,
        ...config.auth,
      },
      logging: {
        ...service.config.logging,
        ...config.logging,
      },
      http: {
        ...service.config.http,
        ...config.http,
      },
    };
    service.validateConfig(service.config);
    return service;
  }
}

// Create default config service instance
export const defaultConfig = new ConfigService();
