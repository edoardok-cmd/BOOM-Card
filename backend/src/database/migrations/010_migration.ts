import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';
import { Logger } from '@nestjs/common';
;
interface MigrationConfig {
  schemaName: string,
  transactionTimeout: number,
  batchSize: number,
}
interface TableDefinition {
  name: string,
  columns: TableColumn[],
  indices?: TableIndex[]
  foreignKeys?: TableForeignKey[]}
interface ColumnDefinition {
  name: string,
  type: string,
  isPrimary?: boolean
  isNullable?: boolean
  isUnique?: boolean
  default?: any
  length?: number
  precision?: number
  scale?: number}
interface IndexDefinition {
  name: string,
  columnNames: string[],
  isUnique?: boolean
  where?: string}
interface ForeignKeyDefinition {
  name: string,
  columnNames: string[];,
  referencedTableName: string,
  referencedColumnNames: string[],
  onDelete?: string
  onUpdate?: string}
type MigrationOperation = 'CREATE' | 'ALTER' | 'DROP' | 'INDEX' | 'DATA';
;

const MIGRATION_CONFIG: MigrationConfig = {
  schemaName: 'boom_card',
  transactionTimeout: 60000,
  batchSize: 1000
}
    const TABLE_NAMES = {
  CARD_ANALYTICS: 'card_analytics',
  LOYALTY_TIERS: 'loyalty_tiers',
  REWARD_REDEMPTIONS: 'reward_redemptions',
  MERCHANT_SETTLEMENTS: 'merchant_settlements',
  AUDIT_LOGS: 'audit_logs';
} as const;
;

const COLUMN_TYPES = {
  UUID: 'uuid',
  TIMESTAMP: 'timestamp with time zone',
  JSONB: 'jsonb',
  DECIMAL: 'decimal',
  INTEGER: 'integer',
  BIGINT: 'bigint',
  VARCHAR: 'varchar',
  BOOLEAN: 'boolean',
  TEXT: 'text',
  ENUM: 'enum';
} as const;
;

const INDEX_PREFIXES = {
  IDX: 'idx',
  UNQ: 'unq',
  FK: 'fk';
} as const;
;

const MIGRATION_VERSION = '010';

const MIGRATION_NAME = 'AddAnalyticsAndLoyaltyFeatures';
;

const BASE_ENTITY_COLUMNS: TableColumn[] = [
  {
  name: 'created_at',
    type: COLUMN_TYPES.TIMESTAMP,
    default: 'CURRENT_TIMESTAMP',
    isNullable: false
  },
  {
  name: 'updated_at',
    type: COLUMN_TYPES.TIMESTAMP,
    default: 'CURRENT_TIMESTAMP',
    isNullable: false
  },
  {
  name: 'deleted_at',
    type: COLUMN_TYPES.TIMESTAMP,
    isNullable: true
  }
];
;
export class BOOMCardMigration implements MigrationInterface {
  name = 'BOOMCard1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create BOOM card types table
    await queryRunner.createTable(
      new Table({
  name: 'boom_card_types',
        columns: [
          {
  name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
},
          {
  name: 'type_name',
            type: 'varchar',
            length: '50',
            isUnique: true
},
          {
  name: 'display_name',
            type: 'varchar',
            length: '100'
},
          {
  name: 'description',
            type: 'text',
            isNullable: true
},
          {
  name: 'benefits',
            type: 'jsonb',
            default: "'[]'"
},
          {
  name: 'tier_level',
            type: 'int',
            default: 1
},
          {
  name: 'annual_fee',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
},
          {
  name: 'rewards_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 1.0
},
          {
  name: 'is_active',
            type: 'boolean',
            default: true
},
          ...BASE_ENTITY_COLUMNS,
        ]
}),
      true
    );

    // Create BOOM cards table
    await queryRunner.createTable(
      new Table({
  name: 'boom_cards',
        columns: [
          {
  name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
},
          {
  name: 'card_number',
            type: 'varchar',
            length: '19',
            isUnique: true
},
          {
  name: 'card_number_encrypted',
            type: 'text'
},
          {
  name: 'card_number_last4',
            type: 'varchar',
            length: '4'
},
          {
  name: 'user_id',
            type: 'uuid'
},
          {
  name: 'card_type_id',
            type: 'uuid'
},
          {
  name: 'status',
            type: 'enum',
            enum: ['pending', 'active', 'suspended', 'cancelled', 'expired'],
            default: "'pending'"
},
          {
  name: 'activation_date',
            type: 'timestamp',
            isNullable: true
},
          {
  name: 'expiry_date',
            type: 'date'
},
          {
  name: 'cvv_encrypted',
            type: 'text'
},
          {
  name: 'pin_encrypted',
            type: 'text',
            isNullable: true
},
          {
  name: 'cardholder_name',
            type: 'varchar',
            length: '100'
},
          {
  name: 'billing_address',
            type: 'jsonb'
},
          {
  name: 'credit_limit',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0
},
          {
  name: 'available_credit',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0
},
          {
  name: 'rewards_points',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0
},
          {
  name: 'is_virtual',
            type: 'boolean',
            default: false
},
          {
  name: 'is_locked',
            type: 'boolean',
            default: false
},
          {
  name: 'failed_attempts',
            type: 'int',
            default: 0
},
          {
  name: 'last_used_at',
            type: 'timestamp',
            isNullable: true
},
          {
  name: 'metadata',
            type: 'jsonb',
            default: "'{}'"
},
          ...BASE_ENTITY_COLUMNS,
        ]
}),
      true
    );

    // Create BOOM card transactions table
    await queryRunner.createTable(
      new Table({
  name: 'boom_card_transactions',
        columns: [
          {
  name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
},
          {
  name: 'card_id',
            type: 'uuid'
},
          {
  name: 'transaction_id',
            type: 'varchar',
            length: '100',
            isUnique: true
},
          {
  name: 'type',
            type: 'enum',
            enum: ['purchase', 'refund', 'withdrawal', 'deposit', 'fee', 'reward', 'adjustment']
},
          {
  name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
            default: "'pending'"
},
          {
  name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2
},
          {
  name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'"
},
          {
  name: 'merchant_name',
            type: 'varchar',
            length: '255',
            isNullable: true
},
          {
  name: 'merchant_category',
            type: 'varchar',
            length: '100',
            isNullable: true
},
          {
  name: 'merchant_location',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'authorization_code',
            type: 'varchar',
            length: '50',
            isNullable: true
},
          {
  name: 'reference_number',
            type: 'varchar',
            length: '100',
            isNullable: true
},
          {
  name: 'rewards_earned',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
},
          {
  name: 'fee_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
},
          {
  name: 'original_transaction_id',
            type: 'uuid',
            isNullable: true
},
          {
  name: 'settlement_date',
            type: 'timestamp',
            isNullable: true
},
          {
  name: 'description',
            type: 'text',
            isNullable: true
},
          {
  name: 'metadata',
            type: 'jsonb',
            default: "'{}'"
},
          ...BASE_ENTITY_COLUMNS,
        ]
}),
      true
    );

    // Create BOOM card rewards table
    await queryRunner.createTable(
      new Table({
  name: 'boom_card_rewards',
        columns: [
          {
  name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
},
          {
  name: 'card_id',
            type: 'uuid'
},
          {
  name: 'transaction_id',
            type: 'uuid',
            isNullable: true
},
          {
  name: 'type',
            type: 'enum',
            enum: ['earned', 'redeemed', 'expired', 'adjusted', 'bonus']
},
          {
  name: 'points',
            type: 'decimal',
            precision: 12,
            scale: 2
},
          {
  name: 'balance_before',
            type: 'decimal',
            precision: 12,
            scale: 2
},
          {
  name: 'balance_after',
            type: 'decimal',
            precision: 12,
            scale: 2
},
          {
  name: 'description',
            type: 'text'
},
          {
  name: 'expiry_date',
            type: 'timestamp',
            isNullable: true
},
          {
  name: 'redeemed_for',
            type: 'varchar',
            length: '100',
            isNullable: true
},
          {
  name: 'redemption_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true
},
          {
  name: 'metadata',
            type: 'jsonb',
            default: "'{}'"
},
          ...BASE_ENTITY_COLUMNS,
        ]
}),
      true
    );

    // Create BOOM card limits table
    await queryRunner.createTable(
      new Table({
  name: 'boom_card_limits',
        columns: [
          {
  name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
},
          {
  name: 'card_id',
            type: 'uuid'
},
          {
  name: 'limit_type',
            type: 'enum',
            enum: ['daily_purchase', 'daily_withdrawal', 'monthly_purchase', 'monthly_withdrawal', 'per_transaction', 'international']
},
          {
  name: 'limit_amount',
            type: 'decimal',
            precision: 12,
            scale: 2
},
          {
  name: 'used_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0
},
          {
  name: 'reset_period',
            type: 'enum',
            enum: ['daily', 'weekly', 'monthly', 'none']
          },
        ...BASE_ENTITY_COLUMNS
      ]
    }),
    true
  );

  // Create foreign keys
  await queryRunner.createForeignKey(
    'boom_cards',
    new TableForeignKey({
  columnNames: ['user_id'],
      referencedTableName: 'users',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    })
  );

  await queryRunner.createForeignKey(
    'boom_cards',
    new TableForeignKey({
  columnNames: ['card_type_id'],
      referencedTableName: 'boom_card_types',
      referencedColumnNames: ['id'],
      onDelete: 'RESTRICT'
    })
  );

  await queryRunner.createForeignKey(
    'boom_card_transactions',
    new TableForeignKey({
  columnNames: ['card_id'],
      referencedTableName: 'boom_cards',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    })
  );

  await queryRunner.createForeignKey(
    'boom_card_rewards',
    new TableForeignKey({
  columnNames: ['card_id'],
      referencedTableName: 'boom_cards',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    })
  );

  await queryRunner.createForeignKey(
    'boom_card_limits',
    new TableForeignKey({
  columnNames: ['card_id'],
      referencedTableName: 'boom_cards',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    })
  );

  // Create indexes
  await queryRunner.createIndex('boom_cards', new TableIndex({
  name: 'idx_boom_cards_user_id',
    columnNames: ['user_id']
  }));

  await queryRunner.createIndex('boom_cards', new TableIndex({
  name: 'idx_boom_cards_status',
    columnNames: ['status']
  }));

  await queryRunner.createIndex('boom_card_transactions', new TableIndex({
  name: 'idx_transactions_card_id',
    columnNames: ['card_id']
  }));

  await queryRunner.createIndex('boom_card_transactions', new TableIndex({
  name: 'idx_transactions_status',
    columnNames: ['status']
  }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
  // Drop indexes
  await queryRunner.dropIndex('boom_card_transactions', 'idx_transactions_status');
  await queryRunner.dropIndex('boom_card_transactions', 'idx_transactions_card_id');
  await queryRunner.dropIndex('boom_cards', 'idx_boom_cards_status');
  await queryRunner.dropIndex('boom_cards', 'idx_boom_cards_user_id');

  // Drop tables in reverse order
  await queryRunner.dropTable('boom_card_limits');
  await queryRunner.dropTable('boom_card_rewards');
  await queryRunner.dropTable('boom_card_transactions');
  await queryRunner.dropTable('boom_cards');
  await queryRunner.dropTable('boom_card_types');
}

}