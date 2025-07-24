import { Knex } from 'knex';
;
export async function up(knex: Knex): Promise<void> {
  // Create user_preferences table for storing user-specific settings
  await knex.schema.createTable('user_preferences', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('language', 5).notNullable().defaultTo('bg');
    table.string('currency', 3).notNullable().defaultTo('BGN');
    table.string('distance_unit', 10).notNullable().defaultTo('km');
    table.boolean('email_notifications').notNullable().defaultTo(true);
    table.boolean('push_notifications').notNullable().defaultTo(true);
    table.boolean('sms_notifications').notNullable().defaultTo(false);
    table.jsonb('notification_preferences').defaultTo('{}');
    table.jsonb('dietary_preferences').defaultTo('[]');
    table.jsonb('favorite_categories').defaultTo('[]');
    table.integer('default_search_radius').notNullable().defaultTo(10);
    table.string('theme', 20).notNullable().defaultTo('light');
    table.boolean('location_sharing').notNullable().defaultTo(true);
    table.timestamps(true, true);
    
    table.unique(['user_id']);
    table.index(['user_id']);
  });

  // Create saved_searches table for storing user search preferences
  await knex.schema.createTable('saved_searches', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.jsonb('search_criteria').notNullable();
    table.boolean('notifications_enabled').notNullable().defaultTo(false);
    table.string('notification_frequency', 20).defaultTo('daily');
    table.timestamp('last_notified_at').nullable();
    table.integer('usage_count').notNullable().defaultTo(0);
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['notifications_enabled', 'notification_frequency']);
  });

  // Create user_favorites table for storing favorite partners
  await knex.schema.createTable('user_favorites', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('partner_id').notNullable().references('id').inTable('partners').onDelete('CASCADE');
    table.text('notes').nullable();
    table.timestamp('favorited_at').notNullable().defaultTo(knex.fn.now());
    
    table.unique(['user_id', 'partner_id']);
    table.index(['user_id']);
    table.index(['partner_id']);
  });

  // Create user_lists table for custom user collections
  await knex.schema.createTable('user_lists', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.text('description').nullable();
    table.boolean('is_public').notNullable().defaultTo(false);
    table.string('slug', 150).unique().nullable();
    table.integer('items_count').notNullable().defaultTo(0);
    table.integer('followers_count').notNullable().defaultTo(0);
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['is_public', 'created_at']);
    table.index(['slug']);
  });

  // Create user_list_items table for items in user lists
  await knex.schema.createTable('user_list_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('list_id').notNullable().references('id').inTable('user_lists').onDelete('CASCADE');
    table.uuid('partner_id').notNullable().references('id').inTable('partners').onDelete('CASCADE');
    table.text('notes').nullable();
    table.integer('position').notNullable().defaultTo(0);
    table.timestamp('added_at').notNullable().defaultTo(knex.fn.now());
    
    table.unique(['list_id', 'partner_id']);
    table.index(['list_id', 'position']);
    table.index(['partner_id']);
  });

  // Create user_list_followers table
  await knex.schema.createTable('user_list_followers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('list_id').notNullable().references('id').inTable('user_lists').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('followed_at').notNullable().defaultTo(knex.fn.now());
    
    table.unique(['list_id', 'user_id']);
    table.index(['list_id']);
    table.index(['user_id']);
  });

  // Create search_history table for tracking user searches
  await knex.schema.createTable('search_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('session_id', 100).nullable();
    table.string('search_query', 500).nullable();
    table.jsonb('filters').defaultTo('{}');
    table.point('location').nullable();
    table.integer('results_count').notNullable().defaultTo(0);
    table.string('device_type', 50).nullable();
    table.string('ip_address', 45).nullable();
    table.timestamp('searched_at').notNullable().defaultTo(knex.fn.now());
    
    table.index(['user_id', 'searched_at']);
    table.index(['session_id', 'searched_at']);
    table.index(['searched_at']);
  });

  // Create user_activity_log table for detailed activity tracking
  await knex.schema.createTable('user_activity_log', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('activity_type', 50).notNullable();
    table.string('entity_type', 50).nullable();
    table.uuid('entity_id').nullable();
    table.jsonb('metadata').defaultTo('{}');
    table.string('ip_address', 45).nullable();
    table.string('user_agent', 500).nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    
    table.index(['user_id', 'created_at']);
    table.index(['activity_type', 'created_at']);
    table.index(['entity_type', 'entity_id']);
  });

  // Create social_shares table for tracking social media shares
  await knex.schema.createTable('social_shares', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('platform', 50).notNullable();
    table.string('content_type', 50).notNullable();
    table.uuid('content_id').notNullable();
    table.string('share_url', 500).nullable();
    table.jsonb('metadata').defaultTo('{}');
    table.timestamp('shared_at').notNullable().defaultTo(knex.fn.now());
    
    table.index(['user_id', 'shared_at']);
    table.index(['platform', 'shared_at']);
    table.index(['content_type', 'content_id']);
  });

  // Create referral_codes table
  await knex.schema.createTable('referral_codes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('code', 20).unique().notNullable();
    table.integer('uses_count').notNullable().defaultTo(0);
    table.integer('max_uses').nullable();
    table.decimal('bonus_amount', 10, 2).nullable();
    table.integer('bonus_percentage').nullable();
    table.date('valid_from').notNullable().defaultTo(knex.fn.now());
    table.date('valid_until').nullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
    
    table.index(['code']);
    table.index(['user_id']);
    table.index(['is_active', 'valid_from', 'valid_until']);
  });

  // Create referral_uses table
  await knex.schema.createTable('referral_uses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('referral_code_id').notNullable().references('id').inTable('referral_codes').onDelete('RESTRICT');
    table.uuid('referred_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.decimal('bonus_applied', 10, 2).nullable();
    table.timestamp('used_at').notNullable().defaultTo(knex.fn.now());
    
    table.unique(['referred_user_id']);
    table.index(['referral_code_id']);
    table.index(['referred_user_id']);
  });

  // Add new columns to users table
  await knex.schema.alterTable('users', (table) => {
    table.string('display_name', 100).nullable();
    table.text('bio').nullable();
    table.string('avatar_url', 500).nullable();
    table.jsonb('social_links').defaultTo('{}');
    table.integer('followers_count').notNullable().defaultTo(0);
    table.integer('following_count').notNullable().defaultTo(0);
    table.boolean('is_verified').notNullable().defaultTo(false);
    table.timestamp('last_seen_at').nullable();
    table.string('referred_by_code', 20).nullable();
  });

  // Create user_follows table for social features
  await knex.schema.createTable('user_follows', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('follower_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('following_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('followed_at').notNullable().defaultTo(knex.fn.now());
    
    table.unique(['follower_id', 'following_id']);
    table.index(['follower_id']);
    table.index(['following_id']);
    
    // Prevent self-following
    table.check('follower_id != following_id');
  });

  // Create function to update follower counts
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_user_follower_counts()
   
}
