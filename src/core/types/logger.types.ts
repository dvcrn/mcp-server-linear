/**
 * Logger Types
 * 
 * Type definitions for logging functionality.
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export type LogFormat = 'json' | 'text';
export type LogDestination = 'console' | 'file';

export interface LogMetadata {
  [key: string]: unknown;
  error?: Error;
}

export interface LoggerConfig {
  level?: LogLevel;
  format?: LogFormat;
  destination?: LogDestination;
}

export interface ILogger {
  error(message: string, error?: Error, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}
