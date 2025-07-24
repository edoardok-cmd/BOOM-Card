import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
;
export class AddPartnerAnalyticsAndReporting1710000018 implements MigrationInterface {
    name = 'AddPartnerAnalyticsAndReporting1710000018';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create partner_analytics_daily table for daily aggregated metrics
        await queryRunner.createTable(
            new Table({
  name: 'partner_analytics_daily',
                columns: [
                    {
  name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()'
},
                    {
  name: 'partner_id',
                        type: 'uuid',
                        isNullable: false
},
                    {
  name: 'date',
                        type: 'date',
                        isNullable: false
},
                    {
  name: 'total_scans',
                        type: 'integer',
                        default: 0
},
                    {
  name: 'unique_users',
                        type: 'integer',
                        default: 0
},
                    {
  name: 'total_discount_given',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
},
                    {
  name: 'average_transaction_value',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
},
                    {
  name: 'new_customers',
                        type: 'integer',
                        default: 0
},
                    {
  name: 'returning_customers',
                        type: 'integer',
                        default: 0
},
                    {
  name: 'peak_hour',
                        type: 'smallint',
                        isNullable: true
},
                    {
  name: 'hourly_distribution',
                        type: 'jsonb',
                        default: "'{}'"
},
                    {
  name: 'device_breakdown',
                        type: 'jsonb',
                        default: "'{}'"
},
                    {
  name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
},
                    {
  name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP'
},
                ]
}),
            true
        );

        // Create unique index for partner_id and date combination
        await queryRunner.createIndex(
            'partner_analytics_daily',
            new TableIndex({
  name: 'IDX_partner_analytics_daily_partner_date',
                columnNames: ['partner_id', 'date'],
                isUnique: true
})
        );

        // Create customer_retention table for tracking customer retention metrics
        await queryRunner.createTable(
            new Table({
  name: 'customer_retention',
                columns: [
                    {
  name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()'
},
                    {
  name: 'partner_id',
                        type: 'uuid',
                        isNullable: false
},
                    {
  name: 'user_id',
                        type: 'uuid',
                        isNullable: false
},
                    {
  name: 'first_visit_date',
                        type: 'timestamp',
                        isNullable: false
},
                    {
  name: 'last_visit_date',
                        type: 'timestamp',
                        isNullable: false
},
                    {
  name: 'total_visits',
                        type: 'integer',
                        default: 1
},
                    {
  name: 'total_spent',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
},
                    {
  name: 'average_spend',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
},
                    {
  name: 'days_between_visits',
                        type: 'integer',
                        isNullable: true
},
                    {
  name: 'customer_lifetime_value',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
},
                    {
  name: 'retention_score',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        default: 0
},
                    {
  name: 'is_churned',
                        type: 'boolean',
                        default: false
},
                    {
  name: 'churn_prediction_score',
                        type: 'decimal',
                        precision: 5,
                        scale: 4,
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
                        default: 'CURRENT_TIMESTAMP'
},
                ]
}),
            true
        );

        // Create indexes for customer_retention
        await queryRunner.createIndex(
            'customer_retention',
            new TableIndex({
  name: 'IDX_customer_retention_partner_user',
                columnNames: ['partner_id', 'user_id'],
                isUnique: true
})
        );

        await queryRunner.createIndex(
            'customer_retention',
            new TableIndex({
  name: 'IDX_customer_retention_last_visit',
                columnNames: ['last_visit_date']
})
        );

        // Create revenue_reports table for financial reporting
        await queryRunner.createTable(
            new Table({
  name: 'revenue_reports',
                columns: [
                    {
  name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()'
},
                    {
  name: 'partner_id',
                        type: 'uuid',
                        isNullable: false
},
                    {
  name: 'report_period',
                        type: 'varchar',
                        length: '20',
                        isNullable: false
},
                    {
  name: 'period_start',
                        type: 'date',
                        isNullable: false
},
                    {
  name: 'period_end',
                        type: 'date',
                        isNullable: false
},
                    {
  name: 'gross_revenue',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
},
                    {
  name: 'discount_amount',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
},
                    {
  name: 'net_revenue',
                        type: 'decimal',
                        precision: 12,
                        scale: 2,
                        default: 0
},
                    {
  name: 'platform_fee',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
},
                    {
  name: 'transaction_count',
                        type: 'integer',
                        default: 0
},
                    {
  name: 'average_transaction_value',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0
},
                    {
  
}

}
}