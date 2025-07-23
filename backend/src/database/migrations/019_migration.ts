import { Knex } from 'knex';
import { MigrationInterface } from '../interfaces/MigrationInterface';
import { TableNames } from '../constants/tableNames';
import { ColumnTypes } from '../constants/columnTypes';
import { IndexTypes } from '../constants/indexTypes';
import { ForeignKeyActions } from '../constants/foreignKeyActions';

interface CardActivityLog {
  id: string;
  card_id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

interface CardSecuritySettings {
  id: string;
  card_id: string;
  pin_enabled: boolean;
  pin_hash?: string;
  biometric_enabled: boolean;
  transaction_notifications: boolean;
  international_transactions: boolean;
  online_transactions: boolean;
  atm_withdrawals: boolean;
  contactless_payments: boolean;
  daily_limit: number;
  monthly_limit: number;
  per_transaction_limit: number;
  restricted_merchant_categories: string[];
  restricted_countries: string[];
  updated_at: Date;
  updated_by: string;
}

interface MerchantCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CardRewardPoints {
  id: string;
  card_id: string;
  user_id: string;
  points_earned: number;
  points_redeemed: number;
  points_balance: number;
  tier_level: string;
  tier_multiplier: number;
  last_activity_date: Date;
  created_at: Date;
  updated_at: Date;
}

interface RewardTransaction {
  id: string;
  card_id: string;
  user_id: string;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points_amount: number;
  reference_id?: string;
  reference_type?: string;
  description: string;
  metadata: Record<string, any>;
  created_at: Date;
}

type MigrationDirection = 'up' | 'down';
type ConstraintType = 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';

const MIGRATION_VERSION = '019';
const MIGRATION_NAME = 'add_card_security_and_rewards';
const BATCH_SIZE = 1000;
const DEFAULT_DAILY_LIMIT = 5000;
const DEFAULT_MONTHLY_LIMIT = 50000;
const DEFAULT_TRANSACTION_LIMIT = 2000;

const TABLE_CARD_ACTIVITY_LOGS = 'card_activity_logs';
const TABLE_CARD_SECURITY_SETTINGS = 'card_security_settings';
const TABLE_MERCHANT_CATEGORIES = 'merchant_categories';
const TABLE_CARD_REWARD_POINTS = 'card_reward_points';
const TABLE_REWARD_TRANSACTIONS = 'reward_transactions';

const INDEX_CARD_ACTIVITY_CARD_ID = 'idx_card_activity_card_id';
const INDEX_CARD_ACTIVITY_USER_ID = 'idx_card_activity_user_id';
const INDEX_CARD_ACTIVITY_TYPE = 'idx_card_activity_type';
const INDEX_CARD_ACTIVITY_CREATED = 'idx_card_activity_created';
const INDEX_SECURITY_CARD_ID = 'idx_security_card_id';
const INDEX_MERCHANT_CODE = 'idx_merchant_code';
const INDEX_REWARDS_CARD_USER = 'idx_rewards_card_user';
const INDEX_REWARDS_BALANCE = 'idx_rewards_balance';
const INDEX_REWARD_TX_CARD_ID = 'idx_reward_tx_card_id';
const INDEX_REWARD_TX_TYPE = 'idx_reward_tx_type';

const ACTIVITY_TYPES = [
  'card_activated',
  'card_blocked',
  'card_unblocked',
  'pin_changed',
  'pin_reset',
  'security_updated',
  'limit_changed',
  'biometric_enabled',
  'biometric_disabled',
  'transaction_declined',
  'suspicious_activity'
] as const;

const REWARD_TIERS = {
  BRONZE: { level: 'bronze', multiplier: 1.0, minPoints: 0 },
  SILVER: { level: 'silver', multiplier: 1.5, minPoints: 10000 },
  GOLD: { level: 'gold', multiplier: 2.0, minPoints: 50000 },
  PLATINUM: { level: 'platinum', multiplier: 3.0, minPoints: 100000 } as const;

I don't see a backend directory structure in the current project. Based on the context, it appears you're asking me to generate Part 2 of a database migration file for a BOOM Card project. Since the exact structure and Part 1 aren't visible, I'll generate a typical Part 2 of a database migration based on common patterns for a card-based system.

export class Migration019BoomCard implements Migration {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Create boom_cards table
    await queryRunner.createTable(
      new Table({
        name: 'boom_cards',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
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
            enum: ['standard', 'premium', 'platinum'],
            default: "'standard'",
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'points_balance',
            type: 'integer',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'cancelled', 'expired'],
            default: "'active'",
          },
          {
            name: 'activation_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'expiry_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'last_transaction_date',
            type: 'timestamp',
            isNullable: true,
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
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_boom_cards_user_id',
            columnNames: ['user_id'],
          },
          {
            name: 'IDX_boom_cards_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_boom_cards_card_type',
            columnNames: ['card_type'],
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
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'card_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'transaction_type',
            type: 'enum',
            enum: ['purchase', 'reload', 'transfer', 'cashback', 'refund', 'fee'],
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
            name: 'points_earned',
            type: 'integer',
            default: 0,
          },
          {
            name: 'points_redeemed',
            type: 'integer',
            default: 0,
          },
          {
            name: 'merchant_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reference_number',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed', 'reversed'],
            default: "'pending'",
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
            name: 'processed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['card_id'],
            referencedTableName: 'boom_cards',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['merchant_id'],
            referencedTableName: 'merchants',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
        indices: [
          {
            name: 'IDX_boom_card_transactions_card_id',
            columnNames: ['card_id'],
          },
          {
            name: 'IDX_boom_card_transactions_merchant_id',
            columnNames: ['merchant_id'],
          },
          {
            name: 'IDX_boom_card_transactions_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_boom_card_transactions_created_at',
            columnNames: ['created_at'],
          },
        ],
      }),
      true
    );

    // Create boom_card_rewards table
    await queryRunner.createTable(
      new Table({
        name: 'boom_card_rewards',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'card_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reward_type',
            type: 'enum',
            enum: ['cashback', 'points_multiplier', 'discount', 'voucher'],
            isNullable: false,
          },
          {
            name: 'value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'threshold_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'valid_from',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'valid_until',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'is_claimed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'claimed_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['card_id'],
            referencedTableName: 'boom_cards',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_boom_card_rewards_card_id',
            columnNames: ['card_id'],
          },
          {
            name: 'IDX_boom_card_rewards_is_claimed',
            columnNames: ['is_claimed'],
          },
        ],
      }),
      true
    );

    // Add trigger for updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_boom_cards_updated_at 
      BEFORE UPDATE ON boom_cards 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    // Add check constraints
    await queryRunner.query(`
      ALTER TABLE boom_cards 
      ADD CONSTRAINT check_balance_non_negative 
      CHECK (balance >= 0);
    `);

    await queryRunner.query(`
      ALTER TABLE boom_cards 
      ADD CONSTRAINT check_points_non_negative 
      CHECK (points_balance >= 0);
    `);

    await queryRunner.query(`
      ALTER TABLE boom_card_transactions 
      ADD CONSTRAINT check_points_non_negative 
      CHECK (points_earned >= 0 AND points_redeemed >= 0);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query('DROP TRIGGER IF EXISTS update_boom_cards_updated_at ON boom_cards');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column');

    // Drop tables in reverse order
    await queryRunner.dropTable('boom_card_rewards', true);
    await queryRunner.dropTable('boom_card_transactions', true);
    await queryRunner.dropTable('boom_cards', true);
  }

// Transaction handler implementation
export class BoomCardTransactionHandler {
  constructor(
    private readonly queryRunner: QueryRunner,
    private readonly logger: Logger
  ) {}

  async processTransaction(data: TransactionData): Promise<TransactionResult> {
    const queryBuilder = this.queryRunner.manager.createQueryBuilder();
    
    try {
      await queryRunner.startTransaction();

      // Validate card
      const card =
}}}
}
}
