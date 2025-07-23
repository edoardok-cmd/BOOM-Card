-- Migration: Add POS Integration Tables
-- Description: Creates tables for POS system integrations, API credentials, and transaction tracking

-- POS Provider Types
CREATE TYPE pos_provider_type AS ENUM (
    'square',
    'clover',
    'toast',
    'lightspeed',
    'shopify',
    'custom',
    'other'
);

-- POS Integration Status
CREATE TYPE pos_integration_status AS ENUM (
    'pending',
    'active',
    'inactive',
    'error',
    'suspended'
);

-- Transaction Sync Status
CREATE TYPE transaction_sync_status AS ENUM (
    'pending',
    'synced',
    'failed',
    'partial'
);

-- Webhook Event Types
CREATE TYPE webhook_event_type AS ENUM (
    'transaction.created',
    'transaction.updated',
    'transaction.cancelled',
    'inventory.updated',
    'store.updated',
    'connection.established',
    'connection.lost'
);

-- POS Providers Registry
CREATE TABLE pos_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    provider_type pos_provider_type NOT NULL,
    api_base_url VARCHAR(255),
    auth_url VARCHAR(255),
    webhook_url VARCHAR(255),
    supported_features JSONB DEFAULT '[]'::jsonb,
    configuration_schema JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partner POS Integrations
CREATE TABLE partner_pos_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    pos_provider_id UUID NOT NULL REFERENCES pos_providers(id),
    integration_status pos_integration_status DEFAULT 'pending',
    store_id VARCHAR(255),
    store_name VARCHAR(255),
    api_credentials JSONB DEFAULT '{}'::jsonb, -- Encrypted in application
    webhook_secret VARCHAR(255),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency_minutes INTEGER DEFAULT 15,
    error_count INTEGER DEFAULT 0,
    last_error_at TIMESTAMP WITH TIME ZONE,
    last_error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(partner_id, pos_provider_id, store_id)
);

-- POS Transactions
CREATE TABLE pos_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES partner_pos_integrations(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    pos_transaction_id VARCHAR(255) NOT NULL,
    pos_order_id VARCHAR(255),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    original_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BGN',
    customer_identifier VARCHAR(255),
    card_number_masked VARCHAR(20),
    items JSONB DEFAULT '[]'::jsonb,
    pos_metadata JSONB DEFAULT '{}'::jsonb,
    sync_status transaction_sync_status DEFAULT 'pending',
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, pos_transaction_id)
);

-- POS Webhook Events
CREATE TABLE pos_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES partner_pos_integrations(id) ON DELETE CASCADE,
    event_id VARCHAR(255) NOT NULL,
    event_type webhook_event_type NOT NULL,
    payload JSONB NOT NULL,
    headers JSONB DEFAULT '{}'::jsonb,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, event_id)
);

-- POS Integration Logs
CREATE TABLE pos_integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES partner_pos_integrations(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    request_method VARCHAR(10),
    request_url TEXT,
    request_headers JSONB DEFAULT '{}'::jsonb,
    request_body JSONB DEFAULT '{}'::jsonb,
    response_status INTEGER,
    response_headers JSONB DEFAULT '{}'::jsonb,
    response_body JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- POS Menu Items Sync
CREATE TABLE pos_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES partner_pos_integrations(id) ON DELETE CASCADE,
    pos_item_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BGN',
    is_available BOOLEAN DEFAULT true,
    modifiers JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    pos_metadata JSONB DEFAULT '{}'::jsonb,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(integration_id, pos_item_id)
);

-- POS Integration API Keys
CREATE TABLE pos_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES partner_pos_integrations(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    name VARCHAR(100),
    permissions JSONB DEFAULT '[]'::jsonb,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_partner_pos_integrations_partner_id ON partner_pos_integrations(partner_id);
CREATE INDEX idx_partner_pos_integrations_status ON partner_pos_integrations(integration_status) WHERE is_active = true;
CREATE INDEX idx_partner_pos_integrations_last_sync ON partner_pos_integrations(last_sync_at) WHERE is_active = true;

CREATE INDEX idx_pos_transactions_integration_id ON pos_transactions(integration_id);
CREATE INDEX idx_pos_transactions_transaction_id ON pos_transactions(transaction_id);
CREATE INDEX idx_pos_transactions_date ON pos_transactions(transaction_date);
CREATE INDEX idx_pos_transactions_sync_status ON pos_transactions(sync_status) WHERE sync_status != 'synced';

CREATE INDEX idx_pos_webhook_events_integration_id ON pos_webhook_events(integration_id);
CREATE INDEX idx_pos_webhook_events_processed ON pos_webhook_events(processed) WHERE processed = false;
CREATE INDEX idx_pos_webhook_events_created_at ON pos_webhook_events(created_at);

CREATE INDEX idx_pos_integration_logs_integration_id ON pos_integration_logs(integration_id);
CREATE INDEX idx_pos_integration_logs_created_at ON pos_integration_logs(created_at);

CREATE INDEX idx_pos_menu_items_integration_id ON pos_menu_items(integration_id);
CREATE INDEX idx_pos_menu_items_available ON pos_menu_items(is_available) WHERE is_available = true;

CREATE INDEX idx_pos_api_keys_integration_id ON pos_api_keys(integration_id);
CREATE INDEX idx_pos_api_keys_active ON pos_api_keys(is_active) WHERE is_active = true;

-- Triggers for updated_at
CREATE TRIGGER update_pos_providers_updated_at
    BEFORE UPDATE ON pos_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_pos_integrations_updated_at
    BEFORE UPDATE ON partner_pos_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pos_transactions_updated_at
    BEFORE UPDATE ON pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pos_menu_items_updated_at
    BEFORE UPDATE ON pos_menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initial POS Providers
INSERT INTO pos_providers (name, provider_type, api_base_url, auth_url, supported_features) VALUES
('Square', 'square', 'https://connect.squareup.com/v2', 'https://connect.squareup.com/oauth2/authorize', 
 '["transactions", "inventory", "customers", "webhooks", "analytics"]'::jsonb),
('Clover', 'clover', 'https://api.clover.com/v3', 'https://www.clover.com/oauth/authorize',
 '["transactions", "inventory", "customers", "webhooks", "loyalty"]'::jsonb),
('Toast', 'toast', 'https://api.toasttab.com/v2', 'https://api.toasttab.com/authentication',
 '["transactions", "menu", "customers", "webhooks", "reports"]'::jsonb),
('Lightspeed', 'lightspeed', 'https://api.lightspeedhq.com', 'https://cloud.lightspeedhq.com/oauth/authorize',
 '["transactions", "inventory", "customers", "webhooks", "multi-location"]'::jsonb),
('Custom API', 'custom', NULL, NULL,
 '["transactions", "webhooks"]'::jsonb);

-- Comments
COMMENT ON TABLE pos_providers IS 'Registry of supported POS system providers';
COMMENT ON TABLE partner_pos_integrations IS 'Partner-specific POS system integration configurations';
COMMENT ON TABLE pos_transactions IS 'Synchronized transactions from POS systems';
COMMENT ON TABLE pos_webhook_events IS 'Webhook events received from POS systems';
COMMENT ON TABLE pos_integration_logs IS 'Detailed logs of POS API interactions';
COMMENT ON TABLE pos_menu_items IS 'Synchronized menu items from POS systems';
COMMENT ON TABLE pos_api_keys IS 'API keys for POS system authentication';

COMMENT ON COLUMN partner_pos_integrations.api_credentials IS 'Encrypted API credentials stored as JSONB';
COMMENT ON COLUMN partner_pos_integrations.sync_frequency_minutes IS 'How often to sync data from POS system';
COMMENT ON COLUMN pos_transactions.items IS 'Array of transaction line items from POS';
COMMENT ON COLUMN pos_webhook_events.payload IS 'Raw webhook payload from POS provider';
