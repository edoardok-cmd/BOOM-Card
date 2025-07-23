import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

interface CardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  design_config: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CardAnalytics {
  id: string;
  card_id: string;
  user_id: string;
  event_type: 'view' | 'share' | 'download' | 'edit' | 'delete';
  event_data: Record<string, any>;
  ip_address: string;
  user_agent: string;
  referrer: string;
  session_id: string;
  created_at: Date;
}

interface CardCollaboration {
  id: string;
  card_id: string;
  user_id: string;
  permission_level: 'view' | 'comment' | 'edit' | 'admin';
  invited_by: string;
  invitation_status: 'pending' | 'accepted' | 'declined' | 'revoked';
  invited_at: Date;
  responded_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface CardRevision {
  id: string;
  card_id: string;
  user_id: string;
  revision_number: number;
  change_type: 'content' | 'design' | 'settings' | 'metadata';
  changes: Record<string, any>;
  previous_data: Record<string, any>;
  created_at: Date;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  body_template: string;
  variables: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

type MigrationDirection = 'up' | 'down';
type TableOperation = 'create' | 'alter' | 'drop';

const MIGRATION_NAME = '012_add_analytics_and_collaboration';
const SCHEMA_NAME = 'public';

const TABLE_NAMES = {
  CARD_TEMPLATES: 'card_templates',
  CARD_ANALYTICS: 'card_analytics',
  CARD_COLLABORATIONS: 'card_collaborations',
  CARD_REVISIONS: 'card_revisions',
  NOTIFICATION_TEMPLATES: 'notification_templates',
  CARDS: 'cards',
  USERS: 'users'
} as const;

const INDEX_NAMES = {
  IDX_ANALYTICS_CARD_ID: 'idx_card_analytics_card_id',
  IDX_ANALYTICS_USER_ID: 'idx_card_analytics_user_id',
  IDX_ANALYTICS_EVENT_TYPE: 'idx_card_analytics_event_type',
  IDX_ANALYTICS_CREATED_AT: 'idx_card_analytics_created_at',
  IDX_ANALYTICS_SESSION: 'idx_card_analytics_session_id',
  IDX_COLLAB_CARD_ID: 'idx_card_collaborations_card_id',
  IDX_COLLAB_USER_ID: 'idx_card_collaborations_user_id',
  IDX_COLLAB_STATUS: 'idx_card_collaborations_status',
  IDX_REVISION_CARD_ID: 'idx_card_revisions_card_id',
  IDX_REVISION_USER_ID: 'idx_card_revisions_user_id',
  IDX_REVISION_NUMBER: 'idx_card_revisions_number',
  IDX_TEMPLATE_TYPE: 'idx_notification_templates_type',
  IDX_TEMPLATE_ACTIVE: 'idx_notification_templates_active'
} as const;

const TRIGGER_NAMES = {
  UPDATE_CARD_TEMPLATES_TIMESTAMP: 'update_card_templates_timestamp',
  UPDATE_CARD_COLLABORATIONS_TIMESTAMP: 'update_card_collaborations_timestamp',
  UPDATE_NOTIFICATION_TEMPLATES_TIMESTAMP: 'update_notification_templates_timestamp',
  LOG_CARD_REVISION: 'log_card_revision_on_update'
} as const;

const DEFAULT_TEMPLATES = {
  INVITATION: {
    name: 'Card Collaboration Invitation',
    type: 'email' as const,
    subject: 'You have been invited to collaborate on a BOOM Card',
    variables: ['inviter_name', 'card_title', 'permission_level', 'invitation_link']
  },
  REVISION_NOTIFICATION: {
    name: 'Card Updated Notification',
    type: 'in_app' as const,
    subject: 'A card you are collaborating on has been updated',
    variables: ['editor_name', 'card_title', 'change_summary']
  };

const MIGRATION_BATCH_SIZE = 1000;
const MIGRATION_TIMEOUT = 60000;

Since Part 1 doesn't exist yet, I'll generate Part 2 of migration 012 based on the pattern from previous migrations. Based on migration 011 which handles notifications, migration 012 would likely continue with related functionality. Here's Part 2:

export async function up(knex: Knex): Promise<void> {
  // Create email_queue table
  await knex.schema.createTable('email_queue', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('notification_id').references('id').inTable('notifications').onDelete('SET NULL');
    table.string('to', 255).notNullable();
    table.string('cc', 500);
    table.string('bcc', 500);
    table.string('from', 255).notNullable().defaultTo('noreply@boomcard.bg');
    table.string('reply_to', 255);
    table.string('subject', 500).notNullable();
    table.text('html_content').notNullable();
    table.text('text_content');
    table.jsonb('attachments').defaultTo('[]');
    table.jsonb('headers').defaultTo('{}');
    table.enum('priority', ['low', 'normal', 'high']).defaultTo('normal');
    table.enum('status', ['pending', 'processing', 'sent', 'failed', 'bounced']).defaultTo('pending');
    table.integer('retry_count').defaultTo(0);
    table.integer('max_retries').defaultTo(3);
    table.timestamp('scheduled_at');
    table.timestamp('sent_at');
    table.timestamp('failed_at');
    table.text('error_message');
    table.string('message_id', 255);
    table.jsonb('provider_response').defaultTo('{}');
    table.timestamps(true, true);
    
    table.index(['status', 'scheduled_at']);
    table.index(['notification_id']);
    table.index('sent_at');
  });

  // Create sms_queue table
  await knex.schema.createTable('sms_queue', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('notification_id').references('id').inTable('notifications').onDelete('SET NULL');
    table.string('to', 20).notNullable();
    table.string('from', 20);
    table.text('message').notNullable();
    table.enum('status', ['pending', 'processing', 'sent', 'delivered', 'failed']).defaultTo('pending');
    table.integer('retry_count').defaultTo(0);
    table.integer('max_retries').defaultTo(3);
    table.decimal('cost', 10, 4);
    table.string('provider', 50);
    table.string('message_id', 255);
    table.jsonb('provider_response').defaultTo('{}');
    table.timestamp('scheduled_at');
    table.timestamp('sent_at');
    table.timestamp('delivered_at');
    table.timestamp('failed_at');
    table.text('error_message');
    table.timestamps(true, true);
    
    table.index(['status', 'scheduled_at']);
    table.index(['notification_id']);
    table.index('to');
  });

  // Create notification_batches table for bulk notifications
  await knex.schema.createTable('notification_batches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 255).notNullable();
    table.text('description');
    table.uuid('template_id').references('id').inTable('notification_templates');
    table.jsonb('template_variables').defaultTo('{}');
    table.jsonb('recipient_filters').defaultTo('{}');
    table.integer('total_recipients').defaultTo(0);
    table.integer('sent_count').defaultTo(0);
    table.integer('failed_count').defaultTo(0);
    table.enum('status', ['draft', 'scheduled', 'processing', 'completed', 'cancelled']).defaultTo('draft');
    table.timestamp('scheduled_at');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.uuid('created_by').references('id').inTable('admin_users');
    table.uuid('cancelled_by').references('id').inTable('admin_users');
    table.text('cancellation_reason');
    table.timestamps(true, true);
    
    table.index(['status', 'scheduled_at']);
    table.index('created_by');
  });

  // Create notification_batch_recipients table
  await knex.schema.createTable('notification_batch_recipients', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('batch_id').references('id').inTable('notification_batches').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('partner_id').references('id').inTable('partners').onDelete('CASCADE');
    table.jsonb('personalized_variables').defaultTo('{}');
    table.enum('status', ['pending', 'sent', 'failed', 'skipped']).defaultTo('pending');
    table.uuid('notification_id').references('id').inTable('notifications');
    table.text('skip_reason');
    table.text('error_message');
    table.timestamp('processed_at');
    table.timestamps(true, true);
    
    table.index(['batch_id', 'status']);
    table.index(['user_id']);
    table.index(['partner_id']);
    
    table.check('(user_id IS NOT NULL AND partner_id IS NULL) OR (user_id IS NULL AND partner_id IS NOT NULL)');
  });

  // Create notification_analytics table
  await knex.schema.createTable('notification_analytics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.date('date').notNullable();
    table.specificType('notification_type', 'notification_type').notNullable();
    table.enum('channel', ['email', 'sms', 'push', 'in_app']).notNullable();
    table.integer('sent_count').defaultTo(0);
    table.integer('delivered_count').defaultTo(0);
    table.integer('opened_count').defaultTo(0);
    table.integer('clicked_count').defaultTo(0);
    table.integer('failed_count').defaultTo(0);
    table.integer('bounced_count').defaultTo(0);
    table.integer('unsubscribed_count').defaultTo(0);
    table.decimal('avg_delivery_time', 10, 2);
    table.jsonb('hourly_breakdown').defaultTo('{}');
    table.jsonb('device_breakdown').defaultTo('{}');
    table.timestamps(true, true);
    
    table.unique(['date', 'notification_type', 'channel']);
    table.index(['date', 'channel']);
  });

  // Create webhook_events table for handling provider webhooks
  await knex.schema.createTable('webhook_events', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('provider', 50).notNullable();
    table.string('event_type', 100).notNullable();
    table.string('event_id', 255);
    table.jsonb('payload').notNullable();
    table.jsonb('headers').defaultTo('{}');
    table.string('signature', 500);
    table.boolean('verified').defaultTo(false);
    table.boolean('processed').defaultTo(false);
    table.timestamp('processed_at');
    table.text('processing_error');
    table.string('related_message_id', 255);
    table.enum('related_channel', ['email', 'sms', 'push']);
    table.timestamps(true, true);
    
    table.index(['provider', 'event_type', 'processed']);
    table.index(['related_message_id']);
    table.index('created_at');
    table.unique(['provider', 'event_id']);
  });

  // Add columns to users table for notification settings
  await knex.schema.alterTable('users', (table) => {
    table.string('notification_token', 255);
    table.timestamp('last_notification_check').defaultTo(knex.fn.now());
    table.integer('unread_notifications_count').defaultTo(0);
    table.jsonb('notification_badges').defaultTo('{}');
  });

  // Add columns to partners table for notification settings
  await knex.schema.alterTable('partners', (table) => {
    table.string('notification_email', 255);
    table.string('notification_phone', 20);
    table.timestamp('last_notification_check').defaultTo(knex.fn.now());
    table.integer('unread_notifications_count').defaultTo(0);
  });

  // Create function to update unread notification counts
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_unread_notification_count()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.read != NEW.read) THEN
        IF NEW.user_id IS NOT NULL THEN
          UPDATE users 
          SET unread_notifications_count = (
            SELECT COUNT(*) 
            FROM notifications 
            WHERE user_id = NEW.user_id 
              AND read = false 
              AND archived = false
              AND (expires_at IS NULL OR expires_at > NOW())
          )
          WHERE id = NEW.user_id;
        ELSIF NEW.partner_id IS NOT NULL THEN
          UPDATE partners 
          SET unread_notifications_count = (
            SELECT COUNT(*) 
            FROM notifications 
            WHERE partner_id = NEW.partner_id 
              AND read = false 
              AND archived = false
              AND (expires_at IS NULL OR expires_at > NOW())
          )
          WHERE id = NEW.partner_id;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create trigger for notification count updates
  await knex.raw(`
    CREATE TRIGGER update_notification_count_trigger
    AFTER INSERT OR UPDATE OF read ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_notification_count();
  `);

  // Create function to clean up expired notifications
  await knex.raw(`
    CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
    RETURNS void AS $$
    BEGIN
      DELETE FROM notifications
      WHERE expires_at < NOW() - INTERVAL '30 days';
      
      DELETE FROM notification_logs
      WHERE created_at < NOW() - INTERVAL '90 days';
      
      DELETE FROM webhook_events
      WHERE created_at < NOW() - INTERVAL '30 days';
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create indexes for notification queries
  await knex.raw(`
    CREATE INDEX idx_notifications_user_unread 
    ON notifications(user_id, created_at DESC) 
    WHERE read = false AND archived = false;
    
    CREATE INDEX idx_notifications_partner_unread 
    ON notifications(partner_id, created_at DESC) 
    WHERE read = false AND archived = false;
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Drop triggers and functions
  await knex.raw('DROP TRIGGER IF EXISTS update_notification_count_trigger ON 
}
}
