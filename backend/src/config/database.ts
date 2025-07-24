import { Pool, PoolConfig, ClientConfig } from 'pg';
import { Redis, RedisOptions } from 'ioredis';
import { Logger } from 'winston';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
;
export interface DatabaseConfig {
  host: string;
  port: number,
  database: string,
  user: string,
  password: string,
  ssl?: {
    rejectUnauthorized?: boolean
    ca?: string
    key?: string
    cert?: string}
  poolSize?: number;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  maxRetries?: number;
  retryDelay?: number;
}
export interface RedisConfig {
  host: string;
  port: number,
  password?: string
  db?: number
  keyPrefix?: string
  enableOfflineQueue?: boolean
  maxRetriesPerRequest?: number
  retryStrategy?: (times: number) => number | void,
  tls?: {
    rejectUnauthorized?: boolean
    ca?: string
    key?: string
    cert?: string}
}
export interface DatabaseConnectionOptions {
  postgres: DatabaseConfig;
  redis: RedisConfig,
  migrations?: {
  directory: string,
    tableName?: string
    validateChecksums?: boolean}
  monitoring?: {
  enabled: boolean,
    interval?: number;
    slowQueryThreshold?: number;
  }
}
export interface QueryResult<T = any> {
  rows: T[];,
  rowCount: number,
  command: string,
  fields?: any[];
}
export interface TransactionClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>
  release(): void}
export interface DatabaseMetrics {
  activeConnections: number;
  idleConnections: number,
  waitingConnections: number,
  totalQueries: number,
  slowQueries: number,
  errors: number,
  lastError?: Error,
  uptime: number,
}
export type AsyncFunction = (sql: string, params: any[], duration: number) => void,
export type AsyncFunction = (error: Error, context?: any) => void;
;

const DEFAULT_POOL_SIZE = 20;

const DEFAULT_IDLE_TIMEOUT = 30000;

const DEFAULT_CONNECTION_TIMEOUT = 10000;

const DEFAULT_MAX_RETRIES = 3;

const DEFAULT_RETRY_DELAY = 1000;

const DEFAULT_SLOW_QUERY_THRESHOLD = 1000;

const DEFAULT_MONITORING_INTERVAL = 60000;
;

const MIGRATIONS_TABLE = 'schema_migrations';

const REDIS_COMMAND_TIMEOUT = 5000;
;
export {
  DEFAULT_POOL_SIZE,
  DEFAULT_IDLE_TIMEOUT,
  DEFAULT_CONNECTION_TIMEOUT,
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_DELAY,
  DEFAULT_SLOW_QUERY_THRESHOLD,
  DEFAULT_MONITORING_INTERVAL,
  MIGRATIONS_TABLE,
  REDIS_COMMAND_TIMEOUT
};
