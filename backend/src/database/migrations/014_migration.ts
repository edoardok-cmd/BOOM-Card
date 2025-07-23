import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';
import { config } from '../../../config/database';

interface MigrationConfig {
  schemaName: string;
  tablePrefix: string;
  timestamps: boolean;
  softDelete: boolean;
}

interface TableConfig {
  name: string;
  columns: TableColumn[];
  indices?: TableIndex[];
  foreignKeys?: TableForeignKey[];
  uniques?: string[][];
}

interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  default?: any;
  length?: string;
  precision?: number;
  scale?: number;
  enum?: string[];
  enumName?: string;
}

interface IndexDefinition {
  name: string;
  columnNames: string[];
  isUnique?: boolean;
  isSpatial?: boolean;
  isFulltext?: boolean;
  where?: string;
}

interface ForeignKeyDefinition {
  name: string;
  columnNames: string[];
  referencedTableName: string;
  referencedColumnNames: string[];
  onDelete?: 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION';
  onUpdate?: 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION';
}

const MIGRATION_CONFIG: MigrationConfig = {
  schemaName: 'public',
  tablePrefix: 'boom_',
  timestamps: true,
  softDelete: true
};

const TABLE_NAMES = {
  TRANSACTION_ANALYTICS: `${MIGRATION_CONFIG.tablePrefix}transaction_analytics`,
  USER_ACTIVITY_LOGS: `${MIGRATION_CONFIG.tablePrefix}user_activity_logs`,
  REWARD_TIER_HISTORY: `${MIGRATION_CONFIG.tablePrefix}reward_tier_history`,
  MERCHANT_PERFORMANCE: `${MIGRATION_CONFIG.tablePrefix}merchant_performance`,
  FRAUD_DETECTION_LOGS: `${MIGRATION_CONFIG.tablePrefix}fraud_detection_logs`
} as const;

const ENUM_NAMES = {
  ACTIVITY_TYPE: 'activity_type_enum',
  FRAUD_SEVERITY: 'fraud_severity_enum',
  TIER_CHANGE_REASON: 'tier_change_reason_enum'
} as const;

const ACTIVITY_TYPES = [
  'login',
  'logout',
  'transaction',
  'profile_update',
  'password_change',
  'card_activation',
  'reward_redemption',
  'support_ticket'
] as const;

const FRAUD_SEVERITIES = [
  'low',
  'medium',
  'high',
  'critical'
] as const;

const TIER_CHANGE_REASONS = [
  'spending_threshold',
  'manual_upgrade',
  'manual_downgrade',
  'policy_change',
  'promotional',
  'inactivity'
] as const;

Since the backend directory doesn't exist yet and you're asking for Part 2 of the migration, I'll generate Part 2 based on typical BOOM Card database migration patterns. Here's Part 2 of the migration file:

export class AddBoomCardFeaturesMigration implements Migration {
  name = 'AddBoomCardFeatures1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create boom_cards table
    await queryRunner.createTable(
      new Table({
        name: 'boom_cards',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'card_number',
            type: 'varchar',
            length: '16',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'card_type',
            type: 'enum',
            enum: Object.values(CardType),
            default: `'${CardType.STANDARD}'`,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(CardStatus),
            default: `'${CardStatus.ACTIVE}'`,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
          },
          {
            name: 'expiry_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'cvv_hash',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'pin_hash',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'daily_limit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 1000,
          },
          {
            name: 'monthly_limit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 10000,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create boom_card_transactions table
    await queryRunner.createTable(
      new Table({
        name: 'boom_card_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'card_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'transaction_id',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: Object.values(TransactionType),
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            isNullable: false,
          },
          {
            name: 'merchant_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'merchant_category',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'authorization_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(TransactionStatus),
            isNullable: false,
          },
          {
            name: 'fee_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'balance_after',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create boom_card_limits table
    await queryRunner.createTable(
      new Table({
        name: 'boom_card_limits',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'card_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'limit_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'period',
            type: 'enum',
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Create boom_card_webhooks table
    await queryRunner.createTable(
      new Table({
        name: 'boom_card_webhooks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'event_id',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'event_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'card_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'transaction_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'payload',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processed', 'failed'],
            default: "'pending'",
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add indexes
    await queryRunner.createIndex(
      'boom_cards',
      new TableIndex({
        name: 'IDX_boom_cards_user_id',
        columnNames: ['user_id'],
      })
    );

    await queryRunner.createIndex(
      'boom_cards',
      new TableIndex({
        name: 'IDX_boom_cards_status',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'boom_card_transactions',
      new TableIndex({
        name: 'IDX_boom_card_transactions_card_id',
        columnNames: ['card_id'],
      })
    );

    await queryRunner.createIndex(
      'boom_card_transactions',
      new TableIndex({
        name: 'IDX_boom_card_transactions_status',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'boom_card_transactions',
      new TableIndex({
        name: 'IDX_boom_card_transactions_processed_at',
        columnNames: ['processed_at'],
      })
    );

    await queryRunner.createIndex(
      'boom_card_limits',
      new TableIndex({
        name: 'IDX_boom_card_limits_card_id',
        columnNames: ['card_id'],
      })
    );

    await queryRunner.createIndex(
      'boom_card_webhooks',
      new TableIndex({
        name: 'IDX_boom_card_webhooks_status',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'boom_card_webhooks',
      new TableIndex({
        name: 'IDX_boom_card_webhooks_event_type',
        columnNames: ['event_type'],
      })
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'boom_cards',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'boom_card_transactions',
      new TableForeignKey({
        columnNames: ['card_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'boom_cards',
 
}}}