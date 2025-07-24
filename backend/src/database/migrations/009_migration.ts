import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';
import { DatabaseConnection } from '../connection';
import { MigrationLogger } from '../utils/migration-logger';
import { MigrationValidator } from '../utils/migration-validator';
;
interface MigrationMetadata {
  version: string,
  name: string,
  timestamp: number,
  description: string,
  breaking: boolean,
  rollbackable: boolean,
}
interface TableConfiguration {
  name: string,
  columns: TableColumn[],
  indices?: TableIndex[]
  foreignKeys?: TableForeignKey[]
  uniques?: string[][]
  checks?: string[]}
interface ColumnDefinition {
  name: string,
  type: string,
  isPrimary?: boolean
  isNullable?: boolean
  isUnique?: boolean
  default?: any
  length?: number
  precision?: number
  scale?: number
  enum?: string[]
  enumName?: string}
interface IndexDefinition {
  name: string,
  columns: string[],
  isUnique?: boolean
  isSpatial?: boolean
  isFulltext?: boolean
  where?: string
  parser?: string}
interface ForeignKeyDefinition {
  name: string,
  columns: string[];,
  referencedTable: string,
  referencedColumns: string[],
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'}
type MigrationOperation = 'CREATE_TABLE' | 'DROP_TABLE' | 'ADD_COLUMN' | 'DROP_COLUMN' | 
                          'MODIFY_COLUMN' | 'ADD_INDEX' | 'DROP_INDEX' | 'ADD_FOREIGN_KEY' | 
                          'DROP_FOREIGN_KEY' | 'RENAME_TABLE' | 'RENAME_COLUMN';
;

const MIGRATION_METADATA: MigrationMetadata = {
  version: '009',
  name: 'AddTransactionAnalyticsAndReporting',
  timestamp: 1704067200000,
  description: 'Add transaction analytics, reporting tables, and performance indices',
  breaking: false,
  rollbackable: true
}
    const SCHEMA_NAME = 'boom_card';

const BATCH_SIZE = 1000;

const LOCK_TIMEOUT = 30000;

const STATEMENT_TIMEOUT = 120000;
;

const TABLE_NAMES = {
  TRANSACTION_ANALYTICS: 'transaction_analytics',
  DAILY_AGGREGATES: 'daily_aggregates',
  MERCHANT_METRICS: 'merchant_metrics',
  USER_SPENDING_PATTERNS: 'user_spending_patterns',
  CATEGORY_ANALYTICS: 'category_analytics',
  FRAUD_INDICATORS: 'fraud_indicators',
  PERFORMANCE_METRICS: 'performance_metrics',
  REPORT_SCHEDULES: 'report_schedules',
  GENERATED_REPORTS: 'generated_reports';
} as const;
;

const INDEX_PREFIXES = {
  PRIMARY: 'pk',
  FOREIGN: 'fk',
  INDEX: 'idx',
  UNIQUE: 'uq',
  CHECK: 'ck';
} as const;

Execution error
