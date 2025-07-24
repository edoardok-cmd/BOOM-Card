import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
;
interface CardDesignTemplate {
  id: string;
  name: string,
  category: string,
  thumbnail_url: string,
  design_data: Record<string, any>;,
  is_premium: boolean,
  usage_count: number,
  created_at: Date,
  updated_at: Date,
}
interface UserCardDesign {
  id: string;
  user_id: string,
  card_id: string,
  template_id?: string,
  design_version: number,
  design_data: Record<string, any>;,
  is_active: boolean,
  created_at: Date,
  updated_at: Date,
}
interface CardAnalytics {
  id: string;
  card_id: string,
  metric_type: 'view' | 'share' | 'save' | 'click' | 'scan',
  metric_value: number,
  metadata?: Record<string, any>;,
  recorded_at: Date,
  created_at: Date,
}
interface UserNotificationPreferences {
  id: string;
  user_id: string,
  notification_type: string,
  email_enabled: boolean,
  push_enabled: boolean,
  sms_enabled: boolean,
  frequency: 'instant' | 'daily' | 'weekly' | 'never',
  created_at: Date,
  updated_at: Date,
}
const TABLE_NAMES = {
  CARD_DESIGN_TEMPLATES: 'card_design_templates',
  USER_CARD_DESIGNS: 'user_card_designs',
  CARD_ANALYTICS: 'card_analytics',
  USER_NOTIFICATION_PREFERENCES: 'user_notification_preferences';
} as const;
;

const INDEXES = {
  USER_CARD_DESIGNS_USER_ID: 'idx_user_card_designs_user_id',
  USER_CARD_DESIGNS_CARD_ID: 'idx_user_card_designs_card_id',
  CARD_ANALYTICS_CARD_ID: 'idx_card_analytics_card_id',
  CARD_ANALYTICS_METRIC_TYPE: 'idx_card_analytics_metric_type',
  NOTIFICATION_PREFS_USER_ID: 'idx_notification_prefs_user_id';
} as const;
;

const DEFAULT_TEMPLATES = [
  {
  name: 'Modern Minimalist',
    category: 'Professional',
    thumbnail_url: '/templates/modern-minimalist.png',
    is_premium: false
  },
  {
  name: 'Creative Gradient',
    category: 'Creative',
    thumbnail_url: '/templates/creative-gradient.png',
    is_premium: false
  },
  {
  name: 'Executive Gold',
    category: 'Premium',
    thumbnail_url: '/templates/executive-gold.png',
    is_premium: true
  }
];
;

const DEFAULT_NOTIFICATION_TYPES = [
  'card_viewed',
  'card_shared',
  'new_connection',
  'profile_update',
  'system_announcement';
];
;
export class Migration016BoomCard implements IMigration {
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
            default: 'uuid_generate_v4()'
},
          {
  name: 'user_id',
            type: 'uuid'
},
          {
  name: 'card_number',
            type: 'varchar',
            length: '16',
            isUnique: true
},
          {
  name: 'card_type',
            type: 'enum',
            enum: ['virtual', 'physical'],
            default: "'virtual'"
},
          {
  name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'blocked', 'expired'],
            default: "'active'"
},
          {
  name: 'balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
},
          {
  name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'"
},
          {
  name: 'expiry_date',
            type: 'date'
},
          {
  name: 'cvv_hash',
            type: 'varchar',
            length: '255'
},
          {
  name: 'pin_hash',
            type: 'varchar',
            length: '255',
            isNullable: true
},
          {
  name: 'daily_limit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 1000
},
          {
  name: 'monthly_limit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 10000
},
          {
  name: 'transaction_limit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 500
},
          {
  name: 'atm_enabled',
            type: 'boolean',
            default: true
},
          {
  name: 'online_enabled',
            type: 'boolean',
            default: true
},
          {
  name: 'contactless_enabled',
            type: 'boolean',
            default: true
},
          {
  name: 'international_enabled',
            type: 'boolean',
            default: false
},
          {
  name: 'freeze_reason',
            type: 'varchar',
            length: '255',
            isNullable: true
},
          {
  name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
},
          {
  name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
},
        ]
}),
      true
    );

    // Create card_transactions table
    await queryRunner.createTable(
      new Table({
  name: 'card_transactions',
        columns: [
          {
  name: 'id',
            type: 'uuid',
            isPrimary: true,
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
            enum: ['purchase', 'withdrawal', 'refund', 'fee', 'interest']
},
          {
  name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2
},
          {
  name: 'currency',
            type: 'varchar',
            length: '3'
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
  name: 'merchant_country',
            type: 'varchar',
            length: '2',
            isNullable: true
},
          {
  name: 'status',
            type: 'enum',
            enum: ['pending', 'completed', 'failed', 'reversed'],
            default: "'pending'"
},
          {
  name: 'authorization_code',
            type: 'varchar',
            length: '50',
            isNullable: true
},
          {
  name: 'processor_response',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'fees',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
},
          {
  name: 'settled_at',
            type: 'timestamp',
            isNullable: true
},
        ]
}),
      true
    );

    // Create card_security_settings table
    await queryRunner.createTable(
      new Table({
  name: 'card_security_settings',
        columns: [
          {
  name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()'
},
          {
  name: 'card_id',
            type: 'uuid',
            isUnique: true
},
          {
  name: 'transaction_notifications',
            type: 'boolean',
            default: true
},
          {
  name: 'fraud_alerts',
            type: 'boolean',
            default: true
},
          {
  name: 'location_based_security',
            type: 'boolean',
            default: false
},
          {
  name: 'trusted_merchants',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'blocked_merchants',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'blocked_categories',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'blocked_countries',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'velocity_limits',
            type: 'jsonb',
            isNullable: true
},
          {
  name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
},
          {
  name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP'
},
        ]
}),
      true
    );

    // Create foreign key constraints
    await queryRunner.createForeignKey(
      'boom_cards',
      new TableForeignKey({
  columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE'
})
    );

    await queryRunner.createForeignKey(
      'card_transactions',
      new TableForeignKey({
  columnNames: ['card_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'boom_cards',
        onDelete: 'CASCADE'
})
    );

    await queryRunner.createForeignKey(
      'card_security_settings',
      new TableForeignKey({
  columnNames: ['card_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'boom_cards',
        onDelete: 'CASCADE'
})
    );

    // Create indexes for performance
    await queryRunner.createIndex(
      'boom_cards',
      new TableIndex({
  name: 'IDX_boom_cards_user_id',
        columnNames: ['user_id']
})
    );

    await queryRunner.createIndex(
      'boom_cards',
      new TableIndex({
  name: 'IDX_boom_cards_status',
        columnNames: ['status']
})
    );

    await queryRunner.createIndex(
      'card_transactions',
      new TableIndex({
  name: 'IDX_card_transactions_card_id',
        columnNames: ['card_id']
})
    );

    await queryRunner.createIndex(
      'card_transactions',
      new TableIndex({
  name: 'IDX_card_transactions_created_at',
        columnNames: ['created_at']
})
    );

    await queryRunner.createIndex(
      'card_transactions',
      new TableIndex({
  name: 'IDX_card_transactions_status',
        columnNames: ['status']
})
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('card_transactions', 'IDX_card_transactions_status');
    await queryRunner.dropIndex('card_transactions', 'IDX_card_transactions_created_at');
    await queryRunner.dropIndex('card_transactions', 'IDX_card_transactions_card_id');
    await queryRunner.dropIndex('boom_cards', 'IDX_boom_cards_status');
    await queryRunner.dropIndex('boom_cards', 'IDX_boom_cards_user_id');

    // Drop foreign keys;

const cardSecurityTable = await queryRunner.getTable('card_security_settings');

    const cardSecurityForeignKey = cardSecurityTable?.foreignKeys.find(
      fk => fk.columnNames.indexOf('card_id') !== -1;
    );
    if (cardSecurityForeignKey) {
      await queryRunner.dropForeignKey('card_security_settings', cardSecurityForeignKey);
    };
const cardTransactionsTable = await queryRunner.getTable('card_transactions');

    const cardTransactionsForeignKey = cardTransactionsTable?.foreignKeys.find(
      fk => fk.columnNames.indexOf('card_id') !== -1;
    );
    if (cardTransactionsForeignKey) {
      await queryRunner.dropForeignKey('card_transactions', cardTransactionsForeignKey);
    };
const boomCardsTable = await queryRunner.getTable('boo
}
}