// Subscription/Membership model for PostgreSQL
export interface SubscriptionPlan {
  id?: number;
  name: string;
  type: 'Basic' | 'Premium' | 'VIP';
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
  discount_percentage: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserSubscription {
  id?: number;
  user_id: string; // UUID
  plan_id: number;
  status: 'active' | 'expired' | 'cancelled';
  start_date: Date;
  end_date: Date;
  auto_renew: boolean;
  payment_method?: string;
  last_payment_date?: Date;
  next_payment_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface SubscriptionCreateInput {
  userId: string; // UUID
  planId: number;
  paymentMethod?: string;
  autoRenew?: boolean;
}

export interface SubscriptionUpdateInput {
  autoRenew?: boolean;
  paymentMethod?: string;
}

// SQL queries for Subscription operations
export const SubscriptionQueries = {
  // Get all subscription plans
  getAllPlans: `
    SELECT * FROM subscription_plans
    WHERE is_active = true
    ORDER BY 
      CASE type
        WHEN 'Basic' THEN 1
        WHEN 'Premium' THEN 2
        WHEN 'VIP' THEN 3
      END
  `,

  // Get plan by ID
  getPlanById: `
    SELECT * FROM subscription_plans
    WHERE id = $1
  `,

  // Get plan by type
  getPlanByType: `
    SELECT * FROM subscription_plans
    WHERE type = $1 AND is_active = true
    LIMIT 1
  `,

  // Create user subscription
  createSubscription: `
    INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, 
                                   auto_renew, payment_method, last_payment_date, next_payment_date)
    VALUES ($1, $2, 'active', NOW(), $3, $4, $5, NOW(), $6)
    RETURNING id, user_id, plan_id, status, start_date, end_date, 
              auto_renew, payment_method, last_payment_date, next_payment_date, created_at
  `,

  // Get user's active subscription
  getActiveSubscription: `
    SELECT us.*, sp.name as plan_name, sp.type as plan_type, sp.price, sp.features, sp.discount_percentage
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = $1 AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1
  `,

  // Get user's subscription history
  getSubscriptionHistory: `
    SELECT us.*, sp.name as plan_name, sp.type as plan_type, sp.price
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = $1
    ORDER BY us.created_at DESC
  `,

  // Update subscription
  updateSubscription: `
    UPDATE user_subscriptions
    SET auto_renew = COALESCE($2, auto_renew),
        payment_method = COALESCE($3, payment_method),
        updated_at = NOW()
    WHERE id = $1 AND user_id = $4
    RETURNING id, user_id, plan_id, status, start_date, end_date, 
              auto_renew, payment_method, last_payment_date, next_payment_date
  `,

  // Cancel subscription
  cancelSubscription: `
    UPDATE user_subscriptions
    SET status = 'cancelled',
        auto_renew = false,
        updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `,

  // Renew subscription
  renewSubscription: `
    UPDATE user_subscriptions
    SET end_date = $2,
        last_payment_date = NOW(),
        next_payment_date = $3,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, user_id, plan_id, status, start_date, end_date
  `,

  // Check expired subscriptions
  checkExpiredSubscriptions: `
    UPDATE user_subscriptions
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'active' 
      AND end_date < NOW() 
      AND auto_renew = false
    RETURNING id, user_id
  `,

  // Update user membership type based on subscription
  updateUserMembership: `
    UPDATE users
    SET membership_type = $2,
        valid_until = $3,
        updated_at = NOW()
    WHERE id = $1
  `
};

// Database migration for subscription tables
export const SubscriptionMigration = `
  -- Create subscription plans table
  CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Basic', 'Premium', 'VIP')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BGN',
    duration_days INTEGER NOT NULL,
    features TEXT[] NOT NULL,
    discount_percentage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create user subscriptions table
  CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    payment_method VARCHAR(50),
    last_payment_date TIMESTAMP WITH TIME ZONE,
    next_payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
  CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
  CREATE INDEX idx_user_subscriptions_end_date ON user_subscriptions(end_date);

  -- Insert default subscription plans
  INSERT INTO subscription_plans (name, type, price, currency, duration_days, features, discount_percentage) VALUES
  ('Basic Membership', 'Basic', 9.99, 'BGN', 30, ARRAY['Access to basic discounts', 'Up to 15% off at select partners', 'Digital membership card'], 15),
  ('Premium Membership', 'Premium', 19.99, 'BGN', 30, ARRAY['Access to all discounts', 'Up to 30% off at all partners', 'Digital membership card', 'Priority customer support', 'Exclusive partner offers'], 30),
  ('VIP Membership', 'VIP', 39.99, 'BGN', 30, ARRAY['Maximum discounts available', 'Up to 50% off at all partners', 'Digital membership card', '24/7 VIP support', 'Exclusive partner offers', 'Early access to new partners', 'Complimentary services'], 50)
  ON CONFLICT DO NOTHING;
`;