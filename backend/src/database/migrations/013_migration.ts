import { Migration } from '../types/migration';
import { QueryInterface, DataTypes, Transaction } from 'sequelize';
import { logger } from '../../utils/logger';
import { createIndex, dropIndex } from '../utils/indexHelpers';
import { addColumn, dropColumn, changeColumn } from '../utils/columnHelpers';
import { createTable, dropTable } from '../utils/tableHelpers';
import { addConstraint, removeConstraint } from '../utils/constraintHelpers';

interface CardRewardTier {
  id: string;
  tier_name: string;
  min_points: number;
  max_points: number;
  multiplier: number;
  benefits: string[];
  created_at: Date;
  updated_at: Date;
}

interface TransactionCategory {
  id: string;
  category_name: string;
  category_code: string;
  parent_category_id?: string;
  icon_url?: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MerchantPartnership {
  id: string;
  merchant_id: string;
  partnership_type: 'STANDARD' | 'PREMIUM' | 'EXCLUSIVE';
  discount_percentage: number;
  cashback_percentage: number;
  start_date: Date;
  end_date?: Date;
  terms_and_conditions: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserNotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  is_enabled: boolean;
  frequency?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  created_at: Date;
  updated_at: Date;
}

interface FraudRule {
  id: string;
  rule_name: string;
  rule_type: 'VELOCITY' | 'AMOUNT' | 'LOCATION' | 'MERCHANT' | 'PATTERN';
  conditions: Record<string, any>;
  action: 'BLOCK' | 'FLAG' | 'REVIEW' | 'NOTIFY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const MIGRATION_NAME = '013_add_reward_tiers_and_fraud_rules';
const SCHEMA_NAME = 'boom_card';

const TABLE_NAMES = {
  CARD_REWARD_TIERS: 'card_reward_tiers',
  TRANSACTION_CATEGORIES: 'transaction_categories',
  MERCHANT_PARTNERSHIPS: 'merchant_partnerships',
  USER_NOTIFICATION_PREFERENCES: 'user_notification_preferences',
  FRAUD_RULES: 'fraud_rules',
  TRANSACTION_CATEGORY_MAPPINGS: 'transaction_category_mappings',
  REWARD_TIER_BENEFITS: 'reward_tier_benefits',
  FRAUD_RULE_ACTIONS: 'fraud_rule_actions'
} as const;

const INDEX_NAMES = {
  IDX_REWARD_TIERS_POINTS: 'idx_reward_tiers_points_range',
  IDX_CATEGORIES_CODE: 'idx_transaction_categories_code',
  IDX_CATEGORIES_PARENT: 'idx_transaction_categories_parent',
  IDX_PARTNERSHIPS_MERCHANT: 'idx_merchant_partnerships_merchant',
  IDX_PARTNERSHIPS_DATES: 'idx_merchant_partnerships_active_dates',
  IDX_NOTIFICATIONS_USER: 'idx_notification_preferences_user',
  IDX_FRAUD_RULES_TYPE: 'idx_fraud_rules_type_active',
  IDX_CATEGORY_MAPPINGS: 'idx_transaction_category_mappings'
} as const;

const CONSTRAINT_NAMES = {
  FK_CATEGORIES_PARENT: 'fk_categories_parent_category',
  FK_PARTNERSHIPS_MERCHANT: 'fk_partnerships_merchant',
  FK_NOTIFICATIONS_USER: 'fk_notifications_user',
  FK_CATEGORY_MAPPINGS_TRANSACTION: 'fk_category_mappings_transaction',
  FK_CATEGORY_MAPPINGS_CATEGORY: 'fk_category_mappings_category',
  FK_REWARD_BENEFITS_TIER: 'fk_reward_benefits_tier',
  FK_FRAUD_ACTIONS_RULE: 'fk_fraud_actions_rule',
  CHK_REWARD_TIERS_POINTS: 'chk_reward_tiers_points_valid',
  CHK_PARTNERSHIPS_PERCENTAGES: 'chk_partnerships_percentages_valid',
  CHK_NOTIFICATIONS_CHANNEL: 'chk_notifications_channel_valid'
} as const;

const DEFAULT_VALUES = {
  STANDARD_MULTIPLIER: 1.0,
  PREMIUM_MULTIPLIER: 1.5,
  EXCLUSIVE_MULTIPLIER: 2.0,
  MIN_DISCOUNT_PERCENTAGE: 0,
  MAX_DISCOUNT_PERCENTAGE: 100,
  MIN_CASHBACK_PERCENTAGE: 0,
  MAX_CASHBACK_PERCENTAGE: 50
} as const;

Since migration 013 doesn't exist yet and I need to generate Part 2 without Part 1, I'll create Part 2 based on the patterns from previous migrations. Looking at migration 012 which handles advanced notification features, migration 013 would likely continue with additional card-related features. Here's Part 2:

export async function up(knex: Knex): Promise<void> {
  // Create card_templates table
  await knex.schema.createTable(TABLE_NAMES.CARD_TEMPLATES, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('category', 100).notNullable();
    table.jsonb('design_config').notNullable().defaultTo('{}');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
    
    table.index('category');
    table.index('is_active');
  });

  // Create card_analytics table
  await knex.schema.createTable(TABLE_NAMES.CARD_ANALYTICS, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('card_id').notNullable().references('id').inTable(TABLE_NAMES.CARDS).onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable(TABLE_NAMES.USERS).onDelete('SET NULL');
    table.enum('event_type', ['view', 'share', 'download', 'edit', 'delete']).notNullable();
    table.jsonb('event_data').defaultTo('{}');
    table.string('ip_address', 45);
    table.text('user_agent');
    table.text('referrer');
    table.string('session_id', 255);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    table.index(INDEX_NAMES.IDX_ANALYTICS_CARD_ID);
    table.index(INDEX_NAMES.IDX_ANALYTICS_USER_ID);
    table.index(INDEX_NAMES.IDX_ANALYTICS_EVENT_TYPE);
    table.index(INDEX_NAMES.IDX_ANALYTICS_CREATED_AT);
    table.index(INDEX_NAMES.IDX_ANALYTICS_SESSION);
  });

  // Create card_collaborations table
  await knex.schema.createTable(TABLE_NAMES.CARD_COLLABORATIONS, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('card_id').notNullable().references('id').inTable(TABLE_NAMES.CARDS).onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable(TABLE_NAMES.USERS).onDelete('CASCADE');
    table.enum('permission_level', ['view', 'comment', 'edit', 'admin']).notNullable().defaultTo('view');
    table.uuid('invited_by').notNullable().references('id').inTable(TABLE_NAMES.USERS);
    table.enum('invitation_status', ['pending', 'accepted', 'declined', 'revoked']).notNullable().defaultTo('pending');
    table.timestamp('invited_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('responded_at');
    table.timestamps(true, true);
    
    table.unique(['card_id', 'user_id']);
    table.index(INDEX_NAMES.IDX_COLLAB_CARD_ID);
    table.index(INDEX_NAMES.IDX_COLLAB_USER_ID);
    table.index(INDEX_NAMES.IDX_COLLAB_STATUS);
  });

  // Create card_revisions table
  await knex.schema.createTable(TABLE_NAMES.CARD_REVISIONS, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('card_id').notNullable().references('id').inTable(TABLE_NAMES.CARDS).onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable(TABLE_NAMES.USERS);
    table.integer('revision_number').notNullable();
    table.enum('change_type', ['content', 'design', 'settings', 'metadata']).notNullable();
    table.jsonb('changes').notNullable().defaultTo('{}');
    table.jsonb('previous_data').notNullable().defaultTo('{}');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    table.unique(['card_id', 'revision_number']);
    table.index(INDEX_NAMES.IDX_REVISION_CARD_ID);
    table.index(INDEX_NAMES.IDX_REVISION_USER_ID);
    table.index(INDEX_NAMES.IDX_REVISION_NUMBER);
  });

  // Create notification_templates table
  await knex.schema.createTable(TABLE_NAMES.NOTIFICATION_TEMPLATES, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.enum('type', ['email', 'sms', 'push', 'in_app']).notNullable();
    table.string('subject', 500);
    table.text('body_template').notNullable();
    table.specificType('variables', 'text[]').defaultTo('{}');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
    
    table.unique(['name', 'type']);
    table.index(INDEX_NAMES.IDX_TEMPLATE_TYPE);
    table.index(INDEX_NAMES.IDX_TEMPLATE_ACTIVE);
  });

  // Add new columns to cards table
  await knex.schema.alterTable(TABLE_NAMES.CARDS, (table) => {
    table.uuid('template_id').references('id').inTable(TABLE_NAMES.CARD_TEMPLATES).onDelete('SET NULL');
    table.jsonb('collaboration_settings').defaultTo('{"allow_comments": true, "allow_sharing": true}');
    table.integer('view_count').defaultTo(0);
    table.integer('share_count').defaultTo(0);
    table.timestamp('last_viewed_at');
    table.timestamp('last_edited_at');
    table.boolean('is_collaborative').defaultTo(false);
    table.string('access_token', 255);
    table.timestamp('access_token_expires_at');
  });

  // Create triggers for updated_at timestamps
  await knex.raw(`
    CREATE TRIGGER ${TRIGGER_NAMES.UPDATE_CARD_TEMPLATES_TIMESTAMP}
    BEFORE UPDATE ON ${TABLE_NAMES.CARD_TEMPLATES}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  await knex.raw(`
    CREATE TRIGGER ${TRIGGER_NAMES.UPDATE_CARD_COLLABORATIONS_TIMESTAMP}
    BEFORE UPDATE ON ${TABLE_NAMES.CARD_COLLABORATIONS}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  await knex.raw(`
    CREATE TRIGGER ${TRIGGER_NAMES.UPDATE_NOTIFICATION_TEMPLATES_TIMESTAMP}
    BEFORE UPDATE ON ${TABLE_NAMES.NOTIFICATION_TEMPLATES}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  // Create function to log card revisions
  await knex.raw(`
    CREATE OR REPLACE FUNCTION log_card_revision()
    RETURNS TRIGGER AS $$
    DECLARE
      v_revision_number INTEGER;
      v_changes JSONB;
      v_change_type TEXT;
    BEGIN
      IF OLD IS NULL OR OLD.data IS DISTINCT FROM NEW.data OR OLD.design IS DISTINCT FROM NEW.design THEN
        SELECT COALESCE(MAX(revision_number), 0) + 1 INTO v_revision_number
        FROM ${TABLE_NAMES.CARD_REVISIONS}
        WHERE card_id = NEW.id;
        
        v_changes := '{}'::jsonb;
        
        IF OLD IS NULL THEN
          v_change_type := 'content';
          v_changes := jsonb_build_object('action', 'created');
        ELSE
          IF OLD.data IS DISTINCT FROM NEW.data THEN
            v_change_type := 'content';
            v_changes := v_changes || jsonb_build_object('data', NEW.data);
          END IF;
          
          IF OLD.design IS DISTINCT FROM NEW.design THEN
            v_change_type := 'design';
            v_changes := v_changes || jsonb_build_object('design', NEW.design);
          END IF;
        END IF;
        
        INSERT INTO ${TABLE_NAMES.CARD_REVISIONS} (
          card_id, user_id, revision_number, change_type, changes, previous_data
        ) VALUES (
          NEW.id,
          COALESCE(NEW.updated_by, NEW.user_id),
          v_revision_number,
          v_change_type,
          v_changes,
          CASE 
            WHEN OLD IS NULL THEN '{}'::jsonb
            ELSE jsonb_build_object('data', OLD.data, 'design', OLD.design)
          END
        );
        
        UPDATE ${TABLE_NAMES.CARDS}
        SET last_edited_at = NOW()
        WHERE id = NEW.id;
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger for card revision logging
  await knex.raw(`
    CREATE TRIGGER ${TRIGGER_NAMES.LOG_CARD_REVISION}
    AFTER INSERT OR UPDATE ON ${TABLE_NAMES.CARDS}
    FOR EACH ROW
    EXECUTE FUNCTION log_card_revision();
  `);

  // Create function to update analytics counts
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_card_analytics_counts()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.event_type = 'view' THEN
        UPDATE ${TABLE_NAMES.CARDS}
        SET view_count = view_count + 1,
            last_viewed_at = NOW()
        WHERE id = NEW.card_id;
      ELSIF NEW.event_type = 'share' THEN
        UPDATE ${TABLE_NAMES.CARDS}
        SET share_count = share_count + 1
        WHERE id = NEW.card_id;
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger for analytics count updates
  await knex.raw(`
    CREATE TRIGGER update_analytics_counts_trigger
    AFTER INSERT ON ${TABLE_NAMES.CARD_ANALYTICS}
    FOR EACH ROW
    EXECUTE FUNCTION update_card_analytics_counts();
  `);

  // Insert default notification templates
  const defaultTemplates = [
    {
      id: uuidv4(),
      name: DEFAULT_TEMPLATES.INVITATION.name,
      type: DEFAULT_TEMPLATES.INVITATION.type,
      subject: DEFAULT_TEMPLATES.INVITATION.subject,
      body_template: `
        <p>Hi there,</p>
        <p>{{inviter_name}} has invited you to collaborate on the BOOM Card "{{card_title}}" with {{permission_level}} permissions.</p>
        <p><a href="{{invitation_link}}">Accept Invitation</a></p>
        <p>Best regards,<br>The BOOM Card Team</p>
      `,
      variables: DEFAULT_TEMPLATES.INVITATION.variables,
      is_active: true
    },
    {
      id: uuidv4(),
      name: DEFAULT_TEMPLATES.REVISION_NOTIFICATION.name,
      type: DEFAULT_TEMPLATES.REVISION_NOTIFICATION.type,
      subject: DEFAULT_TEMPLATES.REVISION_NOTIFICATION.subject,
      body_template: `{{editor_name}} has made changes to "{{card_title}}". {{change_summary}}`,
      variables: DEFAULT_TEMPLATES.REVISION_NOTIFICATION.variables,
      is_active: true
    }
  ];

  await knex(TABLE_NAMES.NOTIFICATION_TEMPLATES).insert(defaultTemplates);

  // Create materialized view for card statistics
  await knex.raw(`
    CREATE MATERIALIZED VIEW card_statistics AS
    SELECT 
 
}