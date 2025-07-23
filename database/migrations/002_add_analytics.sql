-- Migration: Add Analytics Tables
-- Description: Creates comprehensive analytics infrastructure for tracking platform usage, partner performance, and user behavior

-- Analytics Events Table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    page_url TEXT,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partner Analytics Summary Table
CREATE TABLE partner_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- View metrics
    profile_views INTEGER DEFAULT 0,
    search_appearances INTEGER DEFAULT 0,
    map_views INTEGER DEFAULT 0,
    
    -- Engagement metrics
    qr_code_scans INTEGER DEFAULT 0,
    transactions_count INTEGER DEFAULT 0,
    transactions_total DECIMAL(10, 2) DEFAULT 0,
    savings_provided DECIMAL(10, 2) DEFAULT 0,
    
    -- Customer metrics
    unique_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    
    -- Rating metrics
    reviews_received INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate entries
    CONSTRAINT unique_partner_date UNIQUE (partner_id, date));

-- User Analytics Summary Table
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Activity metrics
    app_opens INTEGER DEFAULT 0,
    searches_performed INTEGER DEFAULT 0,
    partners_viewed INTEGER DEFAULT 0,
    qr_codes_used INTEGER DEFAULT 0,
    
    -- Transaction metrics
    transactions_count INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    total_saved DECIMAL(10, 2) DEFAULT 0,
    
    -- Engagement metrics
    session_duration_seconds INTEGER DEFAULT 0,
    pages_viewed INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    CONSTRAINT unique_user_date UNIQUE (user_id, date));

-- Platform Analytics Summary Table
CREATE TABLE platform_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE,
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    churned_users INTEGER DEFAULT 0,
    
    -- Partner metrics
    total_partners INTEGER DEFAULT 0,
    active_partners INTEGER DEFAULT 0,
    new_partners INTEGER DEFAULT 0,
    
    -- Transaction metrics
    total_transactions INTEGER DEFAULT 0,
    total_transaction_value DECIMAL(12, 2) DEFAULT 0,
    total_savings DECIMAL(12, 2) DEFAULT 0,
    average_transaction_value DECIMAL(10, 2) DEFAULT 0,
    
    -- Subscription metrics
    active_subscriptions INTEGER DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    cancelled_subscriptions INTEGER DEFAULT 0,
    subscription_revenue DECIMAL(10, 2) DEFAULT 0,
    
    -- Engagement metrics
    daily_active_users INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    total_qr_scans INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Search Analytics Table
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    search_query TEXT,
    search_filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    clicked_results JSONB DEFAULT '[]',
    -- location GEOGRAPHY(POINT, 4326), -- Requires PostGIS
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    device_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- QR Code Analytics Table
CREATE TABLE qr_code_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- qr_code_id UUID NOT NULL REFERENCES partner_qr_codes(id) ON DELETE CASCADE, -- Table doesn't exist yet
    qr_code_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    -- scan_location GEOGRAPHY(POINT, 4326), -- Requires PostGIS
    scan_latitude DECIMAL(10, 8),
    scan_longitude DECIMAL(11, 8),
    device_type VARCHAR(50),
    os VARCHAR(50),
    browser VARCHAR(50),
    ip_address INET,
    resulted_in_transaction BOOLEAN DEFAULT FALSE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    scan_duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Conversion Funnel Analytics Table
CREATE TABLE conversion_funnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    funnel_name VARCHAR(100) NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    time_spent_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);

-- Partner Performance Metrics Table
CREATE TABLE partner_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    
    -- Performance scores
    overall_score DECIMAL(5, 2) DEFAULT 0,
    customer_satisfaction_score DECIMAL(5, 2) DEFAULT 0,
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    revenue_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Ranking
    category_rank INTEGER,
    location_rank INTEGER,
    overall_rank INTEGER,
    
    -- Growth metrics
    growth_rate_weekly DECIMAL(5, 2),
    growth_rate_monthly DECIMAL(5, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint
    CONSTRAINT unique_partner_metric_date UNIQUE (partner_id, metric_date));

-- Real-time Analytics Cache Table
CREATE TABLE analytics_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Create indexes for analytics tables
CREATE INDEX idx_analytics_events_user_id ON analytics_events (user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events (event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events (created_at);
CREATE INDEX idx_analytics_events_session_id ON analytics_events (session_id);
CREATE INDEX idx_partner_analytics_date ON partner_analytics (date);
CREATE INDEX idx_partner_analytics_partner_date ON partner_analytics (partner_id, date);
CREATE INDEX idx_user_analytics_date ON user_analytics (date);
CREATE INDEX idx_user_analytics_user_date ON user_analytics (user_id, date);
CREATE INDEX idx_platform_analytics_date ON platform_analytics (date);
CREATE INDEX idx_search_analytics_user_id ON search_analytics (user_id);
CREATE INDEX idx_search_analytics_created_at ON search_analytics (created_at);
CREATE INDEX idx_search_analytics_query ON search_analytics (search_query);
CREATE INDEX idx_qr_analytics_qr_code_id ON qr_code_analytics (qr_code_id);
CREATE INDEX idx_qr_analytics_user_id ON qr_code_analytics (user_id);
CREATE INDEX idx_qr_analytics_partner_id ON qr_code_analytics (partner_id);
CREATE INDEX idx_qr_analytics_created_at ON qr_code_analytics (created_at);
CREATE INDEX idx_conversion_funnel_user_id ON conversion_funnel (user_id);
CREATE INDEX idx_conversion_funnel_session_id ON conversion_funnel (session_id);
CREATE INDEX idx_conversion_funnel_funnel_name ON conversion_funnel (funnel_name);
CREATE INDEX idx_conversion_funnel_created_at ON conversion_funnel (created_at);
CREATE INDEX idx_partner_performance_date ON partner_performance_metrics (metric_date);
CREATE INDEX idx_partner_performance_partner_date ON partner_performance_metrics (partner_id, metric_date);
CREATE INDEX idx_analytics_cache_expires_at ON analytics_cache (expires_at);

-- Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_partner_analytics_updated_at
    BEFORE UPDATE ON partner_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_user_analytics_updated_at
    BEFORE UPDATE ON user_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_platform_analytics_updated_at
    BEFORE UPDATE ON platform_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_partner_performance_metrics_updated_at
    BEFORE UPDATE ON partner_performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_analytics_cache_updated_at
    BEFORE UPDATE ON analytics_cache
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_updated_at();

-- Create materialized view for partner rankings
CREATE MATERIALIZED VIEW partner_rankings AS
SELECT 
    p.id,
    p.business_name,
    p.category,
    COUNT(DISTINCT t.user_id) as unique_customers,
    COUNT(t.id) as total_transactions,
    COALESCE(SUM(t.final_amount), 0) as total_revenue,
    COALESCE(AVG(r.rating), 0) as average_rating,
    COUNT(DISTINCT r.id) as review_count,
    ROW_NUMBER() OVER (ORDER BY COUNT(t.id) DESC) as overall_rank,
    ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY COUNT(t.id) DESC) as category_rank
FROM partners p
LEFT JOIN transactions t ON p.id = t.partner_id AND t.status = 'completed'
LEFT JOIN reviews r ON p.id = r.partner_id AND r.status = 'published'
WHERE p.status = 'active'
GROUP BY p.id, p.business_name, p.category;

-- Create index on materialized view
CREATE INDEX idx_partner_rankings_partner_id ON partner_rankings(id);
CREATE INDEX idx_partner_rankings_category ON partner_rankings(category);

-- Function to refresh analytics summaries
CREATE OR REPLACE FUNCTION refresh_analytics_summaries(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
    -- Refresh partner analytics
    INSERT INTO partner_analytics (partner_id, date, profile_views, qr_code_scans, transactions_count, transactions_total, unique_customers)
    SELECT 
        p.id,
        target_date,
        COUNT(DISTINCT CASE WHEN ae.event_name = 'partner_profile_view' THEN ae.user_id END),
        COUNT(DISTINCT CASE WHEN ae.event_name = 'qr_code_scan' THEN ae.id END),
        COUNT(DISTINCT t.id),
        COALESCE(SUM(t.final_amount), 0),
        COUNT(DISTINCT t.user_id)
    FROM partners p
    LEFT JOIN analytics_events ae ON p.id = (ae.properties->>'partner_id')::UUID 
        AND DATE(ae.created_at) = target_date
    LEFT JOIN transactions t ON p.id = t.partner_id 
        AND DATE(t.created_at) = target_date 
        AND t.status = 'completed'
    GROUP BY p.id
    ON CONFLICT (partner_id, date) 
    DO UPDATE SET
        profile_views = EXCLUDED.profile_views,
        qr_code_scans = EXCLUDED.qr_code_scans,
        transactions_count = EXCLUDED.transactions_count,
        transactions_total = EXCLUDED.transactions_total,
        unique_customers = EXCLUDED.unique_customers,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Refresh platform analytics
    INSERT INTO platform_analytics (date, total_users, active_users, total_transactions, total_transaction_value)
    SELECT 
        target_date,
        COUNT(DISTINCT u.id),
        COUNT(DISTINCT CASE WHEN ae.created_at::DATE = target_date THEN ae.user_id END),
        COUNT(DISTINCT t.id),
        COALESCE(SUM(t.final_amount), 0)
    FROM users u
    LEFT JOIN analytics_events ae ON u.id = ae.user_id AND DATE(ae.created_at) = target_date
    LEFT JOIN transactions t ON u.id = t.user_id AND DATE(t.created_at) = target_date
    ON CONFLICT (date) 
    DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        total_transactions = EXCLUDED.total_transactions,
        total_transaction_value = EXCLUDED.total_transaction_value,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create analytics materialized view refresh function
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY partner_rankings;
END;
$$ LANGUAGE plpgsql;

-- Note: Indexes on materialized views already created above

-- Schedule periodic refresh (note: actual scheduling would be done via cron or pg_cron)
COMMENT ON FUNCTION refresh_analytics_views() IS 'Run this function periodically to refresh analytics views';