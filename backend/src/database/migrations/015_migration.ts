import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class AddAnalyticsAndReportingTables1734567890015 implements MigrationInterface {
    name = 'AddAnalyticsAndReportingTables1734567890015';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create analytics_events table for tracking all platform events
        await queryRunner.createTable(
            new Table({
                name: 'analytics_events',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'event_type',
                        type: 'varchar',
                        length: '100',
                        comment: 'Type of event: page_view, search, transaction, etc.',
                    },
                    {
                        name: 'event_category',
                        type: 'varchar',
                        length: '50',
                        comment: 'Category: consumer, partner, admin',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: true,
                        comment: 'Reference to user if authenticated',
                    },
                    {
                        name: 'session_id',
                        type: 'varchar',
                        length: '255',
                        comment: 'Session identifier for grouping events',
                    },
                    {
                        name: 'event_data',
                        type: 'jsonb',
                        comment: 'Additional event-specific data',
                    },
                    {
                        name: 'device_info',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'Device, browser, OS information',
                    },
                    {
                        name: 'ip_address',
                        type: 'inet',
                        isNullable: true,
                    },
                    {
                        name: 'user_agent',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'referrer',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'page_url',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Create search_analytics table for search behavior tracking
        await queryRunner.createTable(
            new Table({
                name: 'search_analytics',
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
                        isNullable: true,
                    },
                    {
                        name: 'search_query',
                        type: 'text',
                        comment: 'User search query',
                    },
                    {
                        name: 'search_filters',
                        type: 'jsonb',
                        comment: 'Applied filters: category, location, discount_range, etc.',
                    },
                    {
                        name: 'results_count',
                        type: 'integer',
                        comment: 'Number of results returned',
                    },
                    {
                        name: 'clicked_results',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'Array of partner IDs clicked from results',
                    },
                    {
                        name: 'search_location',
                        type: 'geography(Point, 4326)',
                        isNullable: true,
                        comment: 'User location during search',
                    },
                    {
                        name: 'device_type',
                        type: 'varchar',
                        length: '50',
                        isNullable: true,
                    },
                    {
                        name: 'language',
                        type: 'varchar',
                        length: '2',
                        default: "'en'",
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Create partner_analytics table for partner-specific metrics
        await queryRunner.createTable(
            new Table({
                name: 'partner_analytics',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'partner_id',
                        type: 'uuid',
                        comment: 'Reference to partner',
                    },
                    {
                        name: 'date',
                        type: 'date',
                        comment: 'Analytics date',
                    },
                    {
                        name: 'profile_views',
                        type: 'integer',
                        default: 0,
                        comment: 'Number of profile page views',
                    },
                    {
                        name: 'search_impressions',
                        type: 'integer',
                        default: 0,
                        comment: 'Times appeared in search results',
                    },
                    {
                        name: 'search_clicks',
                        type: 'integer',
                        default: 0,
                        comment: 'Clicks from search results',
                    },
                    {
                        name: 'transactions_count',
                        type: 'integer',
                        default: 0,
                        comment: 'Number of transactions',
                    },
                    {
                        name: 'transactions_value',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0,
                        comment: 'Total transaction value',
                    },
                    {
                        name: 'unique_customers',
                        type: 'integer',
                        default: 0,
                        comment: 'Unique customers count',
                    },
                    {
                        name: 'average_discount_used',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: true,
                        comment: 'Average discount percentage used',
                    },
                    {
                        name: 'popular_items',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'Most purchased items/services',
                    },
                    {
                        name: 'peak_hours',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'Peak transaction hours',
                    },
                    {
                        name: 'customer_demographics',
                        type: 'jsonb',
                        isNullable: true,
                        comment: 'Age groups, gender distribution',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );

        // Create user_behavior_analytics table
        await queryRunner.createTable(
            new Table({
                name: 'user_behavior_analytics',
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
                        comment: 'Reference to user',
                    },
             
}}}