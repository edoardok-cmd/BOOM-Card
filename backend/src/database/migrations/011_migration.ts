import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create enum for notification types
  await knex.raw(`
    CREATE TYPE notification_type AS ENUM (
      'system',
      'subscription',
      'discount_used',
      'partner_update',
      'promotion',
      'payment',
      'security',
      'achievement',
      'reminder'
    );
  `);

  // Create enum for notification priority
  await knex.raw(`
    CREATE TYPE notification_priority AS ENUM (
      'low',
      'medium',
      'high',
      'urgent'
    );
  `);

  // Create notifications table
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('partner_id').references('id').inTable('partners').onDelete('CASCADE');
    table.specificType('type', 'notification_type').notNullable();
    table.specificType('priority', 'notification_priority').notNullable().defaultTo('medium');
    table.string('title_en', 255).notNullable();
    table.string('title_bg', 255).notNullable();
    table.text('message_en').notNullable();
    table.text('message_bg').notNullable();
    table.jsonb('metadata').defaultTo('{}');
    table.boolean('read').defaultTo(false);
    table.timestamp('read_at');
    table.boolean('archived').defaultTo(false);
    table.timestamp('archived_at');
    table.string('action_url', 500);
    table.string('action_label_en', 100);
    table.string('action_label_bg', 100);
    table.timestamp('expires_at');
    table.timestamps(true, true);
    
    // Indexes for performance
    table.index(['user_id', 'read', 'archived']);
    table.index(['partner_id', 'read', 'archived']);
    table.index(['type', 'created_at']);
    table.index('expires_at');
  });

  // Create notification_preferences table
  await knex.schema.createTable('notification_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('partner_id').references('id').inTable('partners').onDelete('CASCADE');
    table.specificType('notification_type', 'notification_type').notNullable();
    table.boolean('email_enabled').defaultTo(true);
    table.boolean('sms_enabled').defaultTo(false);
    table.boolean('push_enabled').defaultTo(true);
    table.boolean('in_app_enabled').defaultTo(true);
    table.jsonb('quiet_hours').defaultTo('{"enabled": false, "start": "22:00", "end": "08:00"}');
    table.jsonb('frequency_settings').defaultTo('{}');
    table.timestamps(true, true);
    
    // Ensure unique preference per user/partner and notification type
    table.unique(['user_id', 'notification_type']);
    table.unique(['partner_id', 'notification_type']);
    
    // Check constraint to ensure either user_id or partner_id is set, but not both
    table.check('(user_id IS NOT NULL AND partner_id IS NULL) OR (user_id IS NULL AND partner_id IS NOT NULL)');
  });

  // Create push_subscriptions table for web push notifications
  await knex.schema.createTable('push_subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('partner_id').references('id').inTable('partners').onDelete('CASCADE');
    table.string('endpoint', 500).notNullable();
    table.string('p256dh', 500).notNullable();
    table.string('auth', 500).notNullable();
    table.string('device_type', 50);
    table.string('browser', 50);
    table.string('os', 50);
    table.timestamp('last_active').defaultTo(knex.fn.now());
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id', 'active']);
    table.index(['partner_id', 'active']);
    table.unique('endpoint');
    
    // Check constraint
    table.check('(user_id IS NOT NULL AND partner_id IS NULL) OR (user_id IS NULL AND partner_id IS NOT NULL)');
  });

  // Create notification_templates table
  await knex.schema.createTable('notification_templates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('key', 100).notNullable().unique();
    table.specificType('type', 'notification_type').notNullable();
    table.string('title_template_en', 500).notNullable();
    table.string('title_template_bg', 500).notNullable();
    table.text('message_template_en').notNullable();
    table.text('message_template_bg').notNullable();
    table.text('sms_template_en');
    table.text('sms_template_bg');
    table.jsonb('variables').defaultTo('[]');
    table.jsonb('default_metadata').defaultTo('{}');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['key', 'active']);
    table.index('type');
  });

  // Create notification_logs table for tracking delivery
  await knex.schema.createTable('notification_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('notification_id').references('id').inTable('notifications').onDelete('CASCADE');
    table.enum('channel', ['email', 'sms', 'push', 'in_app']).notNullable();
    table.enum('status', ['pending', 'sent', 'delivered', 'failed', 'bounced']).notNullable();
    table.string('recipient', 255);
    table.jsonb('provider_response').defaultTo('{}');
    table.text('error_message');
    table.integer('retry_count').defaultTo(0);
    table.timestamp('sent_at');
    table.timestamp('delivered_at');
    table.timestamp('failed_at');
    table.timestamps(true, true);
    
    table.index(['notification_id', 'channel']);
    table.index(['status', 'created_at']);
    table.index('sent_at');
  });

  // Create announcement_banners table for system-wide announcements
  await knex.schema.createTable('announcement_banners', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title_en', 255).notNullable();
    table.string('title_bg', 255).notNullable();
    table.text('content_en').notNullable();
    table.text('content_bg').notNullable();
    table.enum('type', ['info', 'warning', 'success', 'error']).notNullable().defaultTo('info');
    table.string('icon', 50);
    table.string('background_color', 7);
    table.string('text_color', 7);
    table.string('link_url', 500);
    table.string('link_text_en', 100);
    table.string('link_text_bg', 100);
    table.boolean('dismissible').defaultTo(true);
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date').notNullable();
    table.jsonb('target_segments').defaultTo('[]');
    table.boolean('active').defaultTo(true);
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
    
    table.index(['active', 'start_date', 'end_date']);
    table.index('display_order');
  });

  // Create dismissed_announcements table
  await knex.schema.createTable('dismissed_announcements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('announcement_id').references('id').inTable('announcement_banners').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('dismissed_at').defaultTo(knex.fn.now());
    
    table.unique(['announcement_id', 'user_id']);
    table.index('user_id');
  });

  // Insert default notification templates
  await knex('notification_templates').insert([
    {
      key: 'welcome_user',
      type: 'system',
      title_template_en: 'Welcome to BOOM Card!',
      title_template_bg: 'Добре дошли в BOOM Card!',
      message_template_en: 'Hi {{name}}, welcome to BOOM Card! Start exploring amazing discounts at restaurants, hotels, and entertainment venues.',
      message_template_bg: 'Здравейте {{name}}, добре дошли в BOOM Card! Започнете да разглеждате невероятни отстъпки в ресторанти, хотели и места за развлечения.',)
      variables: JSON.stringify(['name']),
      active: true
    },
    {
      key: 'subscription_expiring',
      type: 'subscription',
      title_template_en: 'Your subscription expires soon',
      title_template_bg: 'Вашият абонамент изтича скоро',
      message_template_en: 'Your BOOM Card subscription expires in {{days}} days. Renew now to continue enjoying exclusive discounts!',
      message_template_bg: 'Вашият абонамент за BOOM Card изтича след {{days}} дни. Подновете сега, за да продължите да се възползвате от ексклузивни отстъпки!',
      sms_template_en: 'BOOM Card: Your subscription expires in {{days}} days. Renew at {{link}}',
      sms_template_bg: 'BOOM Card: Абонаментът Ви изтича след {{days}} дни. Подновете на {{link}}',
      variables: JSON.stringify(['days', 'link']),
      active: true
    },
    {
      key: 'discount_used',
      type: 'discount_used',
      title_template_en: 'Discount applied successfully!',
      title_template_bg: 'Отстъпката е приложена успешно!',
      message_template_en: 'You saved {{amount}} {{currency}} at {{partner_name}}. Total savings this month: {{total_savings}} {{currency}}',
      message_template_bg: 'Спестихте {{amount}} {{currency}} в {{partner_name}}. Общо спестявания този месец: {{total_savings}} {{currency}}',
      variables: JSON.stringify(['amount', 'currency', 'partner_name', 'total_savings']),
      active: true
    },
    {
      key: 'new_partner_nearby',
      type: 'partner_update',
      title_template_en: 'New partner near you!',
      title_template_bg: 'Нов партньор близо до вас!',
      message_template_en: '{{partner_name}} just joined BOOM Card! They offer {{discount}}% discount and are only {{distance}}km away.',
      message_template_bg: '{
}}}