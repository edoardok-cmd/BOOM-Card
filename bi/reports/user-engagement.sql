-- User Engagement Analytics Report
-- Tracks user activity, feature usage, and engagement metrics across the platform
-- Supports time-based analysis and cohort tracking

WITH date_params AS (
    SELECT 
        COALESCE(:start_date::date, CURRENT_DATE - INTERVAL '30 days') as start_date,
        COALESCE(:end_date::date, CURRENT_DATE) as end_date,
        COALESCE(:time_zone, 'UTC') as tz
),

-- Daily Active Users (DAU)
daily_active_users AS (
    SELECT 
        DATE(al.created_at AT TIME ZONE dp.tz) as activity_date,
        COUNT(DISTINCT al.user_id) as dau_count,
        COUNT(DISTINCT CASE WHEN u.subscription_status = 'active' THEN al.user_id END) as dau_subscribers,
        COUNT(DISTINCT CASE WHEN u.subscription_status != 'active' OR u.subscription_status IS NULL THEN al.user_id END) as dau_free_users
    FROM activity_logs al
    CROSS JOIN date_params dp
    INNER JOIN users u ON u.id = al.user_id
    WHERE DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
        AND al.action_type IN ('login', 'search', 'view_partner', 'redeem_discount', 'app_open')
    GROUP BY DATE(al.created_at AT TIME ZONE dp.tz)
),

-- Weekly Active Users (WAU)
weekly_active_users AS (
    SELECT 
        DATE_TRUNC('week', al.created_at AT TIME ZONE dp.tz)::date as week_start,
        COUNT(DISTINCT al.user_id) as wau_count,
        COUNT(DISTINCT CASE WHEN u.subscription_status = 'active' THEN al.user_id END) as wau_subscribers,
        COUNT(DISTINCT CASE WHEN u.subscription_status != 'active' OR u.subscription_status IS NULL THEN al.user_id END) as wau_free_users
    FROM activity_logs al
    CROSS JOIN date_params dp
    INNER JOIN users u ON u.id = al.user_id
    WHERE DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
        AND al.action_type IN ('login', 'search', 'view_partner', 'redeem_discount', 'app_open')
    GROUP BY DATE_TRUNC('week', al.created_at AT TIME ZONE dp.tz)
),

-- Monthly Active Users (MAU)
monthly_active_users AS (
    SELECT 
        DATE_TRUNC('month', al.created_at AT TIME ZONE dp.tz)::date as month_start,
        COUNT(DISTINCT al.user_id) as mau_count,
        COUNT(DISTINCT CASE WHEN u.subscription_status = 'active' THEN al.user_id END) as mau_subscribers,
        COUNT(DISTINCT CASE WHEN u.subscription_status != 'active' OR u.subscription_status IS NULL THEN al.user_id END) as mau_free_users
    FROM activity_logs al
    CROSS JOIN date_params dp
    INNER JOIN users u ON u.id = al.user_id
    WHERE DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
        AND al.action_type IN ('login', 'search', 'view_partner', 'redeem_discount', 'app_open')
    GROUP BY DATE_TRUNC('month', al.created_at AT TIME ZONE dp.tz)
),

-- Session Metrics
session_metrics AS (
    SELECT 
        DATE(s.started_at AT TIME ZONE dp.tz) as session_date,
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT s.user_id) as unique_users,
        AVG(EXTRACT(EPOCH FROM (s.ended_at - s.started_at))/60)::numeric(10,2) as avg_session_duration_minutes,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (s.ended_at - s.started_at))/60) as median_session_duration_minutes,
        COUNT(DISTINCT CASE WHEN s.platform = 'web' THEN s.id END) as web_sessions,
        COUNT(DISTINCT CASE WHEN s.platform = 'mobile_app' THEN s.id END) as app_sessions,
        COUNT(DISTINCT CASE WHEN s.ended_at - s.started_at < INTERVAL '10 seconds' THEN s.id END) as bounce_sessions
    FROM user_sessions s
    CROSS JOIN date_params dp
    WHERE DATE(s.started_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
        AND s.ended_at IS NOT NULL
    GROUP BY DATE(s.started_at AT TIME ZONE dp.tz)
),

-- Feature Usage Analytics
feature_usage AS (
    SELECT 
        al.action_type as feature,
        COUNT(*) as usage_count,
        COUNT(DISTINCT al.user_id) as unique_users,
        COUNT(DISTINCT DATE(al.created_at AT TIME ZONE dp.tz)) as active_days,
        AVG(CASE WHEN al.response_time_ms IS NOT NULL THEN al.response_time_ms END)::numeric(10,2) as avg_response_time_ms
    FROM activity_logs al
    CROSS JOIN date_params dp
    WHERE DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
    GROUP BY al.action_type
),

-- User Journey Funnel
user_funnel AS (
    SELECT 
        COUNT(DISTINCT CASE WHEN al.action_type = 'search' THEN al.user_id END) as searched_users,
        COUNT(DISTINCT CASE WHEN al.action_type = 'view_partner' THEN al.user_id END) as viewed_partner_users,
        COUNT(DISTINCT CASE WHEN al.action_type = 'generate_qr' THEN al.user_id END) as generated_qr_users,
        COUNT(DISTINCT CASE WHEN al.action_type = 'redeem_discount' THEN al.user_id END) as redeemed_users,
        -- Conversion rates
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN al.action_type = 'search' THEN al.user_id END) > 0
            THEN (COUNT(DISTINCT CASE WHEN al.action_type = 'view_partner' THEN al.user_id END)::numeric / 
                  COUNT(DISTINCT CASE WHEN al.action_type = 'search' THEN al.user_id END) * 100)::numeric(5,2)
            ELSE 0
        END as search_to_view_rate,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN al.action_type = 'view_partner' THEN al.user_id END) > 0
            THEN (COUNT(DISTINCT CASE WHEN al.action_type = 'generate_qr' THEN al.user_id END)::numeric / 
                  COUNT(DISTINCT CASE WHEN al.action_type = 'view_partner' THEN al.user_id END) * 100)::numeric(5,2)
            ELSE 0
        END as view_to_qr_rate,
        CASE 
            WHEN COUNT(DISTINCT CASE WHEN al.action_type = 'generate_qr' THEN al.user_id END) > 0
            THEN (COUNT(DISTINCT CASE WHEN al.action_type = 'redeem_discount' THEN al.user_id END)::numeric / 
                  COUNT(DISTINCT CASE WHEN al.action_type = 'generate_qr' THEN al.user_id END) * 100)::numeric(5,2)
            ELSE 0
        END as qr_to_redeem_rate
    FROM activity_logs al
    CROSS JOIN date_params dp
    WHERE DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
),

-- User Retention Cohorts
retention_cohorts AS (
    SELECT 
        DATE_TRUNC('week', u.created_at AT TIME ZONE dp.tz)::date as cohort_week,
        COUNT(DISTINCT u.id) as cohort_size,
        COUNT(DISTINCT CASE 
            WHEN EXISTS (
                SELECT 1 FROM activity_logs al 
                WHERE al.user_id = u.id 
                AND DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN 
                    DATE(u.created_at AT TIME ZONE dp.tz) + 7 AND DATE(u.created_at AT TIME ZONE dp.tz) + 13
            ) THEN u.id END) as week_1_retained,
        COUNT(DISTINCT CASE 
            WHEN EXISTS (
                SELECT 1 FROM activity_logs al 
                WHERE al.user_id = u.id 
                AND DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN 
                    DATE(u.created_at AT TIME ZONE dp.tz) + 28 AND DATE(u.created_at AT TIME ZONE dp.tz) + 34
            ) THEN u.id END) as week_4_retained,
        COUNT(DISTINCT CASE 
            WHEN EXISTS (
                SELECT 1 FROM activity_logs al 
                WHERE al.user_id = u.id 
                AND DATE(al.created_at AT TIME ZONE dp.tz) >= DATE(u.created_at AT TIME ZONE dp.tz) + 84
            ) THEN u.id END) as week_12_retained
    FROM users u
    CROSS JOIN date_params dp
    WHERE DATE(u.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date - INTERVAL '90 days' AND dp.end_date
    GROUP BY DATE_TRUNC('week', u.created_at AT TIME ZONE dp.tz)
),

-- Platform Usage Distribution
platform_distribution AS (
    SELECT 
        s.platform,
        s.device_type,
        COUNT(DISTINCT s.user_id) as unique_users,
        COUNT(*) as total_sessions,
        AVG(EXTRACT(EPOCH FROM (s.ended_at - s.started_at))/60)::numeric(10,2) as avg_session_minutes
    FROM user_sessions s
    CROSS JOIN date_params dp
    WHERE DATE(s.started_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
        AND s.ended_at IS NOT NULL
    GROUP BY s.platform, s.device_type
),

-- Time-based Usage Patterns
usage_patterns AS (
    SELECT 
        EXTRACT(HOUR FROM al.created_at AT TIME ZONE dp.tz)::integer as hour_of_day,
        EXTRACT(DOW FROM al.created_at AT TIME ZONE dp.tz)::integer as day_of_week,
        COUNT(*) as activity_count,
        COUNT(DISTINCT al.user_id) as unique_users,
        COUNT(DISTINCT CASE WHEN al.action_type = 'redeem_discount' THEN al.id END) as redemptions
    FROM activity_logs al
    CROSS JOIN date_params dp
    WHERE DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
    GROUP BY 
        EXTRACT(HOUR FROM al.created_at AT TIME ZONE dp.tz),
        EXTRACT(DOW FROM al.created_at AT TIME ZONE dp.tz)
),

-- Geographic Engagement
geographic_engagement AS (
    SELECT 
        COALESCE(u.city, 'Unknown') as city,
        COALESCE(u.country, 'Unknown') as country,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.subscription_status = 'active' THEN u.id END) as active_subscribers,
        COUNT(DISTINCT al.id) as total_activities,
        COUNT(DISTINCT CASE WHEN al.action_type = 'redeem_discount' THEN al.id END) as total_redemptions,
        AVG(CASE WHEN d.amount > 0 THEN d.amount END)::numeric(10,2) as avg_discount_value
    FROM users u
    CROSS JOIN date_params dp
    LEFT JOIN activity_logs al ON al.user_id = u.id 
        AND DATE(al.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
    LEFT JOIN discounts d ON d.user_id = u.id 
        AND DATE(d.created_at AT TIME ZONE dp.tz) BETWEEN dp.start_date AND dp.end_date
    WHERE u.created_at AT TIME ZONE dp.tz <= dp.end_date
    GROUP BY COALESCE(u.city, 'Unknown'), COALESCE(u.country, 'Unknown')
),

-- User Lifecycle Stage Distribution
lifecycle_distribution AS (
    SELECT 
        CASE 
            WHEN u.created_at AT TIME ZONE dp.tz >= dp.end_date - INTERVAL '7 days' THEN 'New (< 1 week)'
