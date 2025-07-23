-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  address TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  membership_type VARCHAR(20) DEFAULT 'Basic' CHECK (membership_type IN ('Basic', 'Premium', 'VIP')),
  card_number VARCHAR(20) UNIQUE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_card_number ON users(card_number);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id VARCHAR(255) NOT NULL,
  partner_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_partner_id ON reviews(partner_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE
ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  logo VARCHAR(500),
  cover_image VARCHAR(500),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(500),
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_description TEXT NOT NULL,
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_slug ON partners(slug);
CREATE INDEX idx_partners_category ON partners(category);
CREATE INDEX idx_partners_city ON partners(city);
CREATE INDEX idx_partners_is_active ON partners(is_active);
CREATE INDEX idx_partners_is_featured ON partners(is_featured);

-- Create trigger for partners table
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE
ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed some initial users for testing (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, phone, membership_type, card_number, valid_until) VALUES
('alex.stefanov@email.com', '$2a$10$xGqnLWQhUQg6H1HGbNgUMe.HoVqIgXW0jJpkRYJFzZ7TzuBHN7AZy', 'Alex', 'Stefanov', '+359 888 123 456', 'Premium', 'BC-2024-5847', '2025-12-31'),
('maria.ivanova@email.com', '$2a$10$xGqnLWQhUQg6H1HGbNgUMe.HoVqIgXW0jJpkRYJFzZ7TzuBHN7AZy', 'Maria', 'Ivanova', '+359 888 987 654', 'Basic', 'BC-2024-5848', '2025-12-31')
ON CONFLICT (email) DO NOTHING;

-- Seed some initial partners for testing
INSERT INTO partners (name, slug, category, description, address, city, discount_percentage, discount_description, is_featured) VALUES
('Restaurant Paradise', 'restaurant-paradise', 'Fine Dining', 'Experience culinary excellence at Restaurant Paradise, where traditional Bulgarian cuisine meets modern gastronomy.', '123 Vitosha Blvd, Sofia', 'Sofia', 30, 'Enjoy 30% off your total bill', true),
('Fitness First Gym', 'fitness-first-gym', 'Fitness & Sports', 'State-of-the-art fitness facility with professional trainers and modern equipment.', '45 Alexander Malinov Blvd, Sofia', 'Sofia', 25, '25% discount on all membership plans', false),
('Spa Relaxation Center', 'spa-relaxation-center', 'Spa & Wellness', 'Indulge in ultimate relaxation with our premium spa treatments and wellness programs.', '78 Bulgaria Blvd, Sofia', 'Sofia', 35, '35% off all spa treatments and packages', true),
('Coffee Central', 'coffee-central', 'Cafes & Bakeries', 'Your neighborhood coffee shop with the finest beans and cozy atmosphere.', '12 Graf Ignatiev St, Sofia', 'Sofia', 20, '20% off all beverages and pastries', false),
('Emerald Resort & Spa', 'emerald-resort-spa', 'Hotels & Resorts', 'Luxury mountain resort offering breathtaking views and premium amenities.', 'Borovets Resort', 'Borovets', 40, '40% discount on weekend stays', true),
('Marina Bay Restaurant', 'marina-bay-restaurant', 'Seafood', 'Fresh seafood dining with panoramic views of the Black Sea.', '56 Primorski Park, Varna', 'Varna', 25, '25% off lunch and dinner menus', false)
ON CONFLICT (slug) DO NOTHING;

-- Seed some initial reviews for testing
INSERT INTO reviews (user_id, partner_id, partner_name, rating, content) VALUES
(1, 'restaurant-paradise', 'Restaurant Paradise', 5, 'Amazing food and great service! The discount made it even better.'),
(1, 'fitness-first-gym', 'Fitness First Gym', 4, 'Good facilities and the BOOM Card discount is very helpful for regular visits.'),
(2, 'restaurant-paradise', 'Restaurant Paradise', 5, 'Absolutely loved the experience. Will definitely come back!'),
(2, 'spa-relaxation-center', 'Spa Relaxation Center', 5, 'Perfect spa day with a great discount. Very relaxing atmosphere.');

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

-- Create trigger for subscription_plans table
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE
ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for user_subscriptions table
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE
ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, type, price, currency, duration_days, features, discount_percentage) VALUES
('Basic Membership', 'Basic', 9.99, 'BGN', 30, ARRAY['Access to basic discounts', 'Up to 15% off at select partners', 'Digital membership card'], 15),
('Premium Membership', 'Premium', 19.99, 'BGN', 30, ARRAY['Access to all discounts', 'Up to 30% off at all partners', 'Digital membership card', 'Priority customer support', 'Exclusive partner offers'], 30),
('VIP Membership', 'VIP', 39.99, 'BGN', 30, ARRAY['Maximum discounts available', 'Up to 50% off at all partners', 'Digital membership card', '24/7 VIP support', 'Exclusive partner offers', 'Early access to new partners', 'Complimentary services'], 50)
ON CONFLICT DO NOTHING;