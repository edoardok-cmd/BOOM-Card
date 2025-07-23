-- Monthly Revenue Report for BOOM Card Platform
-- Generates comprehensive revenue analytics by month, partner, and category
-- Includes subscription revenue, transaction fees, and partner performance metrics

WITH date_params AS (
    SELECT 
        COALESCE(:start_date::date, DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months'))::date AS start_date,
        COALESCE(:end_date::date, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date AS end_date
),

-- Monthly subscription revenue
monthly_subscriptions AS (
    SELECT 
        DATE_TRUNC('month', s.created_at)::date AS month,
        s.plan_type,
        s.billing_period,
        COUNT(DISTINCT s.id) AS subscription_count,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) AS active_subscriptions,
        COUNT(DISTINCT CASE WHEN s.created_at >= DATE_TRUNC('month', s.created_at) THEN s.id END) AS new_subscriptions,
        SUM(p.amount) AS gross_revenue,
        SUM(p.amount * (1 - COALESCE(p.processing_fee_rate, 0.029))) AS net_revenue,
        AVG(p.amount) AS avg_subscription_value
    FROM subscriptions s
    INNER JOIN payments p ON p.subscription_id = s.id AND p.status = 'completed'
    CROSS JOIN date_params dp
    WHERE DATE_TRUNC('month', s.created_at) >= dp.start_date 
        AND DATE_TRUNC('month', s.created_at) <= dp.end_date
    GROUP BY DATE_TRUNC('month', s.created_at), s.plan_type, s.billing_period
),

-- Transaction-based revenue from partner discounts
transaction_revenue AS (
    SELECT 
        DATE_TRUNC('month', t.created_at)::date AS month,
        p.category,
        p.subcategory,
        COUNT(DISTINCT t.id) AS transaction_count,
        COUNT(DISTINCT t.user_id) AS unique_users,
        COUNT(DISTINCT t.partner_id) AS active_partners,
        SUM(t.original_amount) AS total_original_amount,
        SUM(t.discount_amount) AS total_discount_given,
        SUM(t.original_amount - t.discount_amount) AS total_paid_amount,
        SUM(t.platform_fee) AS platform_revenue,
        AVG(t.discount_percentage) AS avg_discount_percentage
    FROM transactions t
    INNER JOIN partners p ON p.id = t.partner_id
    CROSS JOIN date_params dp
    WHERE t.status = 'completed'
        AND DATE_TRUNC('month', t.created_at) >= dp.start_date 
        AND DATE_TRUNC('month', t.created_at) <= dp.end_date
    GROUP BY DATE_TRUNC('month', t.created_at), p.category, p.subcategory
),

-- Partner subscription revenue
partner_subscriptions AS (
    SELECT 
        DATE_TRUNC('month', ps.created_at)::date AS month,
        ps.plan_type AS partner_plan,
        COUNT(DISTINCT ps.id) AS partner_subscription_count,
        SUM(pp.amount) AS partner_revenue,
        AVG(pp.amount) AS avg_partner_subscription_value
    FROM partner_subscriptions ps
    INNER JOIN partner_payments pp ON pp.subscription_id = ps.id AND pp.status = 'completed'
    CROSS JOIN date_params dp
    WHERE DATE_TRUNC('month', ps.created_at) >= dp.start_date 
        AND DATE_TRUNC('month', ps.created_at) <= dp.end_date
    GROUP BY DATE_TRUNC('month', ps.created_at), ps.plan_type
),

-- Monthly revenue summary
monthly_summary AS (
    SELECT 
        m.month,
        -- Subscription revenue
        COALESCE(SUM(ms.gross_revenue), 0) AS subscription_gross_revenue,
        COALESCE(SUM(ms.net_revenue), 0) AS subscription_net_revenue,
        COALESCE(SUM(ms.subscription_count), 0) AS total_subscriptions,
        COALESCE(SUM(ms.active_subscriptions), 0) AS active_subscriptions,
        COALESCE(SUM(ms.new_subscriptions), 0) AS new_subscriptions,
        
        -- Transaction revenue
        COALESCE(SUM(tr.platform_revenue), 0) AS transaction_revenue,
        COALESCE(SUM(tr.transaction_count), 0) AS total_transactions,
        COALESCE(SUM(tr.total_discount_given), 0) AS total_discounts_given,
        
        -- Partner revenue
        COALESCE(SUM(ps.partner_revenue), 0) AS partner_subscription_revenue,
        COALESCE(SUM(ps.partner_subscription_count), 0) AS partner_subscriptions,
        
        -- Totals
        COALESCE(SUM(ms.net_revenue), 0) + 
        COALESCE(SUM(tr.platform_revenue), 0) + 
        COALESCE(SUM(ps.partner_revenue), 0) AS total_revenue
    FROM (
        SELECT DISTINCT month FROM (
            SELECT month FROM monthly_subscriptions
            UNION SELECT month FROM transaction_revenue
            UNION SELECT month FROM partner_subscriptions
        ) all_months
    ) m
    LEFT JOIN monthly_subscriptions ms ON ms.month = m.month
    LEFT JOIN transaction_revenue tr ON tr.month = m.month
    LEFT JOIN partner_subscriptions ps ON ps.month = m.month
    GROUP BY m.month
),

-- Category performance
category_performance AS (
    SELECT 
        DATE_TRUNC('month', t.created_at)::date AS month,
        p.category,
        COUNT(DISTINCT t.partner_id) AS active_partners,
        COUNT(t.id) AS transactions,
        SUM(t.platform_fee) AS revenue,
        AVG(t.discount_percentage) AS avg_discount,
        SUM(t.original_amount) AS gmv,
        ROW_NUMBER() OVER (PARTITION BY DATE_TRUNC('month', t.created_at) ORDER BY SUM(t.platform_fee) DESC) AS category_rank
    FROM transactions t
    INNER JOIN partners p ON p.id = t.partner_id
    CROSS JOIN date_params dp
    WHERE t.status = 'completed'
        AND DATE_TRUNC('month', t.created_at) >= dp.start_date 
        AND DATE_TRUNC('month', t.created_at) <= dp.end_date
    GROUP BY DATE_TRUNC('month', t.created_at), p.category
),

-- Top performing partners
top_partners AS (
    SELECT 
        DATE_TRUNC('month', t.created_at)::date AS month,
        p.id AS partner_id,
        p.name AS partner_name,
        p.category,
        COUNT(t.id) AS transactions,
        SUM(t.platform_fee) AS revenue_generated,
        AVG(t.rating) AS avg_rating,
        ROW_NUMBER() OVER (PARTITION BY DATE_TRUNC('month', t.created_at) ORDER BY SUM(t.platform_fee) DESC) AS partner_rank
    FROM transactions t
    INNER JOIN partners p ON p.id = t.partner_id
    CROSS JOIN date_params dp
    WHERE t.status = 'completed'
        AND DATE_TRUNC('month', t.created_at) >= dp.start_date 
        AND DATE_TRUNC('month', t.created_at) <= dp.end_date
    GROUP BY DATE_TRUNC('month', t.created_at), p.id, p.name, p.category
),

-- Churn and retention metrics
retention_metrics AS (
    SELECT 
        DATE_TRUNC('month', s.created_at)::date AS cohort_month,
        DATE_TRUNC('month', CURRENT_DATE)::date AS current_month,
        COUNT(DISTINCT s.user_id) AS cohort_size,
        COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.user_id END) AS retained_users,
        COUNT(DISTINCT CASE WHEN s.cancelled_at IS NOT NULL 
            AND DATE_TRUNC('month', s.cancelled_at) = DATE_TRUNC('month', s.created_at) + INTERVAL '1 month' 
            THEN s.user_id END) AS churned_month_1,
        COUNT(DISTINCT CASE WHEN s.cancelled_at IS NOT NULL 
            AND DATE_TRUNC('month', s.cancelled_at) = DATE_TRUNC('month', s.created_at) + INTERVAL '2 months' 
            THEN s.user_id END) AS churned_month_2,
        COUNT(DISTINCT CASE WHEN s.cancelled_at IS NOT NULL 
            AND DATE_TRUNC('month', s.cancelled_at) = DATE_TRUNC('month', s.created_at) + INTERVAL '3 months' 
            THEN s.user_id END) AS churned_month_3
    FROM subscriptions s
    CROSS JOIN date_params dp
    WHERE DATE_TRUNC('month', s.created_at) >= dp.start_date 
        AND DATE_TRUNC('month', s.created_at) <= dp.end_date
    GROUP BY DATE_TRUNC('month', s.created_at)
)

-- Main report output
SELECT 
    TO_CHAR(ms.month, 'YYYY-MM') AS month,
    TO_CHAR(ms.month, 'Month YYYY') AS month_name,
    
    -- Revenue metrics
    ms.subscription_gross_revenue::decimal(10,2) AS subscription_gross_revenue,
    ms.subscription_net_revenue::decimal(10,2) AS subscription_net_revenue,
    ms.transaction_revenue::decimal(10,2) AS transaction_revenue,
    ms.partner_subscription_revenue::decimal(10,2) AS partner_revenue,
    ms.total_revenue::decimal(10,2) AS total_revenue,
    
    -- Growth metrics
    LAG(ms.total_revenue, 1) OVER (ORDER BY ms.month)::decimal(10,2) AS previous_month_revenue,
    CASE 
        WHEN LAG(ms.total_revenue, 1) OVER (ORDER BY ms.month) > 0 
        THEN ((ms.total_revenue - LAG(ms.total_revenue, 1) OVER (ORDER BY ms.month)) / 
              LAG(ms.total_revenue, 1) OVER (ORDER BY ms.month) * 100)::decimal(5,2)
        ELSE NULL 
    END AS month_over_month_growth,
    
    -- Volume metrics
    ms.total_subscriptions AS new_subscriptions,
    ms.active_subscriptions,
    ms.total_transactions,
    ms.partner_subscriptions AS active_partners,
    
    -- Average metrics
    CASE WHEN ms.total_subscriptions > 0 
        THEN (ms.subscription_net_revenue / ms.total_subscriptions)::decimal(10,2) 
        ELSE 0 END AS avg_subscription_value,
    CASE WHEN ms.total_transactions > 0 
        THEN (ms.transaction_revenue / ms.total_transactions)::decimal(10,2) 
        ELSE 0 END AS avg_transaction_fee,
    
    -- Category performance (top 3)
    (SELECT json_agg(json_build_object(
        'category', cp.category,
        'revenue', cp.revenue::decimal(10,2),
        'transactions', cp.transactions,
        'active_partners', cp.active_partners
    ) ORDER BY cp.category_rank) 
    FROM category_performance cp 
    WHERE cp.month = ms.month AND cp.category_rank <= 3) AS top_categories,
    
    -- Top partners (top 5)
    (SELECT json_agg(json_build_object(
        'partner_name', tp.partner_name,
        'category', tp.category,
        'revenue', tp.revenue_generated::decimal(10,2),
        'transactions', tp.transactions,
        'avg_rating', tp.avg_rating::decimal(2,1)
    ) ORDER BY tp.partner_rank) 
    FROM top_partners tp 
    WHERE tp.month = ms.month AND tp.partner_rank <= 5) AS top_partners,
    
    -- Retention metrics
    rm.cohort_size AS new_users_cohort,
    rm.retained_users AS retained_users,
    CASE WHEN rm.cohort_size > 0 
        THEN (rm.retained_users::float / rm.cohort_size * 100)::decimal(5