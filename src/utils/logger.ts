/**
 * Logger
 * 
 * Provides logging functionality with configurable levels and formats.
 * Implements ILogger interface for consistent logging across the application.
 */

import {
  LogLevel,
  LogFormat,
  LogDestination,
  LogMetadata,
  LoggerConfig,
  ILogger,
} from '../core/types/logger.types.js';

export class Logger implements ILogger {
  private level: LogLevel;
  private format: LogFormat;
  private destination: LogDestination;

  constructor(
    config: LoggerConfig = {},
    format: LogFormat = 'json',
    destination: LogDestination = 'console'
  ) {
    this.level = config.level || LogLevel.INFO;
    this.format = config.format || format;
    this.destination = config.destination || destination;
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const metadata: LogMetadata = {
        error,
        args: args.length > 0 ? args : undefined,
      };
      this.log('error', message, metadata);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const metadata: LogMetadata = {
        args: args.length > 0 ? args : undefined,
      };
      this.log('warn', message, metadata);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const metadata: LogMetadata = {
        args: args.length > 0 ? args : undefined,
      };
      this.log('info', message, metadata);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const metadata: LogMetadata = {
        args: args.length > 0 ? args : undefined,
      };
      this.log('debug', message, metadata);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const currentLevelIndex = levels.indexOf(this.level);
    const targetLevelIndex = levels.indexOf(level);
    return targetLevelIndex <= currentLevelIndex;
  }

  private log(level: string, message: string, metadata?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    let logData: Record<string, unknown> = {
      timestamp,
      level,
      message,
    };

    if (metadata) {
      if (metadata.error instanceof Error) {
        logData.error = {
          name: metadata.error.name,
          message: metadata.error.message,
          stack: metadata.error.stack,
        };
      }
      if (metadata.args) {
        logData.args = metadata.args;
      }
    }

    const logEntry = this.format === 'json'
      ? JSON.stringify(logData)
      : `${timestamp} [${level.toUpperCase()}] ${message}${
          metadata?.error ? ` Error: ${metadata.error.message}` : ''
        }${metadata?.args ? ` Args: ${JSON.stringify(metadata.args)}` : ''}`;

    if (this.destination === 'console') {
      switch (level) {
        case 'error':
          console.error(logEntry);
          break;
        case 'warn':
          console.warn(logEntry);
          break;
        case 'info':
          console.info(logEntry);
          break;
        case 'debug':
          console.debug(logEntry);
          break;
        default:
          console.log(logEntry);
      }
    } else {
      // File logging could be implemented here
      console.log(logEntry);
    }
  }
}

// Re-export logger types
export {
  LogLevel,
  LogFormat,
  LogDestination,
  LogMetadata,
  LoggerConfig,
  ILogger,
} from '../core/types/logger.types.js';
