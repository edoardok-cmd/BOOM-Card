-- BOOM Card Platform Test Data
-- Generated for development and testing purposes

-- Clear existing test data
TRUNCATE TABLE 
    transaction_items,
    transactions,
    subscription_payments,
    user_subscriptions,
    partner_amenities,
    partner_cuisines,
    partner_operating_hours,
    partner_locations,
    partners,
    users,
    subscription_plans,
    categories,
    subcategories,
    cuisines,
    amenities,
    cities,
    countries
RESTART IDENTITY CASCADE;

-- Countries
INSERT INTO countries (code, name_en, name_bg, phone_code, currency, is_active) VALUES
('BG', 'Bulgaria', 'България', '+359', 'BGN', true),
('US', 'United States', 'Съединени щати', '+1', 'USD', false),
('GB', 'United Kingdom', 'Великобритания', '+44', 'GBP', false);

-- Cities
INSERT INTO cities (country_code, name_en, name_bg, slug, latitude, longitude, is_active) VALUES
('BG', 'Sofia', 'София', 'sofia', 42.6977, 23.3219, true),
('BG', 'Plovdiv', 'Пловдив', 'plovdiv', 42.1354, 24.7453, true),
('BG', 'Varna', 'Варна', 'varna', 43.2141, 27.9147, true),
('BG', 'Burgas', 'Бургас', 'burgas', 42.5048, 27.4626, true),
('BG', 'Bansko', 'Банско', 'bansko', 41.8404, 23.4886, true);

-- Categories
INSERT INTO categories (slug, name_en, name_bg, icon, sort_order, is_active) VALUES
('food-drink', 'Food & Drink', 'Храна и напитки', 'restaurant', 1, true),
('entertainment', 'Entertainment & Nightlife', 'Развлечения и нощен живот', 'nightlife', 2, true),
('accommodation', 'Accommodation', 'Настаняване', 'hotel', 3, true),
('experiences', 'Experiences & Services', 'Преживявания и услуги', 'experiences', 4, true);

-- Subcategories
INSERT INTO subcategories (category_id, slug, name_en, name_bg, icon, sort_order, is_active) VALUES
-- Food & Drink
(1, 'restaurants', 'Restaurants', 'Ресторанти', 'restaurant', 1, true),
(1, 'cafes', 'Cafés & Coffee Shops', 'Кафенета', 'coffee', 2, true),
(1, 'bars-pubs', 'Bars & Pubs', 'Барове и пъбове', 'local_bar', 3, true),
-- Entertainment
(2, 'nightclubs', 'Nightclubs', 'Нощни клубове', 'nightlife', 1, true),
(2, 'live-music', 'Live Music Venues', 'Музикални клубове', 'music_note', 2, true),
(2, 'cultural', 'Cultural Events', 'Културни събития', 'theater_comedy', 3, true),
(2, 'gaming', 'Gaming Centers', 'Игрални центрове', 'sports_esports', 4, true),
-- Accommodation
(3, 'hotels', 'Hotels', 'Хотели', 'hotel', 1, true),
(3, 'boutique', 'Boutique Hotels', 'Бутикови хотели', 'star', 2, true),
(3, 'vacation', 'Vacation Rentals', 'Ваканционни имоти', 'house', 3, true),
-- Experiences
(4, 'adventure', 'Adventure Activities', 'Приключенски дейности', 'hiking', 1, true),
(4, 'wellness', 'Wellness & Spa', 'Уелнес и СПА', 'spa', 2, true),
(4, 'wine-tasting', 'Wine & Food Tastings', 'Дегустации', 'wine_bar', 3, true),
(4, 'escape-rooms', 'Escape Rooms', 'Стаи за бягство', 'lock', 4, true);

-- Cuisines
INSERT INTO cuisines (slug, name_en, name_bg) VALUES
('bulgarian', 'Bulgarian', 'Българска'),
('italian', 'Italian', 'Италианска'),
('asian', 'Asian', 'Азиатска'),
('mediterranean', 'Mediterranean', 'Средиземноморска'),
('french', 'French', 'Френска'),
('mexican', 'Mexican', 'Мексиканска'),
('japanese', 'Japanese', 'Японска'),
('indian', 'Indian', 'Индийска'),
('greek', 'Greek', 'Гръцка'),
('american', 'American', 'Американска');

-- Amenities
INSERT INTO amenities (slug, name_en, name_bg, icon) VALUES
('wifi', 'Wi-Fi', 'Wi-Fi', 'wifi'),
('parking', 'Parking', 'Паркинг', 'local_parking'),
('outdoor-seating', 'Outdoor Seating', 'Места на открито', 'deck'),
('live-music', 'Live Music', 'Музика на живо', 'music_note'),
('pet-friendly', 'Pet Friendly', 'Разрешени домашни любимци', 'pets'),
('wheelchair', 'Wheelchair Accessible', 'Достъпно за инвалиди', 'accessible'),
('smoking-area', 'Smoking Area', 'Зона за пушене', 'smoking_rooms'),
('private-rooms', 'Private Rooms', 'Частни стаи', 'meeting_room'),
('vegan-options', 'Vegan Options', 'Веган опции', 'eco'),
('gluten-free', 'Gluten Free Options', 'Безглутенови опции', 'no_food');

-- Subscription Plans
INSERT INTO subscription_plans (slug, name_en, name_bg, description_en, description_bg, price_monthly, price_yearly, features, max_family_members, is_popular, sort_order, is_active) VALUES
('basic', 'Basic', 'Основен', 'Perfect for individuals', 'Перфектен за индивидуални потребители', 9.99, 99.99, 
 '["10% discount at all partners", "Access to exclusive deals", "Mobile app access"]'::jsonb, 1, false, 1, true),
('premium', 'Premium', 'Премиум', 'Best value for regular users', 'Най-добра стойност за редовни потребители', 19.99, 199.99,
 '["15% discount at all partners", "Early access to new partners", "Priority support", "Monthly surprise offers"]'::jsonb, 1, true, 2, true),
('family', 'Family', 'Семеен', 'Share savings with your family', 'Споделете спестяванията със семейството си', 29.99, 299.99,
 '["20% discount at all partners", "Up to 4 family members", "Kids eat free at selected venues", "Family exclusive events"]'::jsonb, 4, false, 3, true);

-- Test Users
INSERT INTO users (email, phone, password_hash, first_name, last_name, role, language, is_verified, email_verified_at, created_at) VALUES
-- Admin users
('admin@boomcard.bg', '+359888000001', '$2b$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', 'bg', true, NOW(), NOW() - INTERVAL '1 year'),
('support@boomcard.bg', '+359888000002', '$2b$10$YourHashedPasswordHere', 'Support', 'Team', 'admin', 'en', true, NOW(), NOW() - INTERVAL '11 months'),
-- Partner users
('partner1@restaurant.bg', '+359888100001', '$2b$10$YourHashedPasswordHere', 'Ivan', 'Petrov', 'partner', 'bg', true, NOW(), NOW() - INTERVAL '10 months'),
('partner2@hotel.bg', '+359888100002', '$2b$10$YourHashedPasswordHere', 'Maria', 'Dimitrova', 'partner', 'bg', true, NOW(), NOW() - INTERVAL '9 months'),
('partner3@spa.bg', '+359888100003', '$2b$10$YourHashedPasswordHere', 'George', 'Georgiev', 'partner', 'en', true, NOW(), NOW() - INTERVAL '8 months'),
-- Customer users
('customer1@gmail.com', '+359888200001', '$2b$10$YourHashedPasswordHere', 'Dimitar', 'Nikolov', 'customer', 'bg', true, NOW(), NOW() - INTERVAL '7 months'),
('customer2@gmail.com', '+359888200002', '$2b$10$YourHashedPasswordHere', 'Elena', 'Ivanova', 'customer', 'bg', true, NOW(), NOW() - INTERVAL '6 months'),
('customer3@yahoo.com', '+359888200003', '$2b$10$YourHashedPasswordHere', 'Peter', 'Stoyanov', 'customer', 'en', true, NOW(), NOW() - INTERVAL '5 months'),
('customer4@outlook.com', '+359888200004', '$2b$10$YourHashedPasswordHere', 'Svetlana', 'Todorova', 'customer', 'bg', true, NOW(), NOW() - INTERVAL '4 months'),
('customer5@icloud.com', NULL, '$2b$10$YourHashedPasswordHere', 'Alexander', 'Petkov', 'customer', 'en', false, NULL, NOW() - INTERVAL '3 months');

-- Partners
INSERT INTO partners (
    user_id, business_name, slug, description_en, description_bg, 
    logo_url, cover_url, website, email, phone, 
    discount_percentage, terms_en, terms_bg, 
    is_featured, status, created_at
) VALUES
-- Restaurants
(3, 'The Grand Restaurant', 'the-grand-restaurant', 
 'Fine dining experience in the heart of Sofia', 'Изискано заведение в сърцето на София',
 '/uploads/partners/grand-restaurant-logo.jpg', '/uploads/partners/grand-restaurant-cover.jpg',
 'https://grandrestaurant.bg', 'info@grandrestaurant.bg', '+359888100001',
 15, 'Valid for dine-in only. Not combinable with other offers.', 'Валидно само за консумация на място. Не се комбинира с други оферти.',
 true, 'active', NOW() - INTERVAL '10 months'),
 
(3, 'Pasta Paradise', 'pasta-paradise',
 'Authentic Italian cuisine with a modern twist', 'Автентична италианска кухня с модерен привкус',
 '/uploads/partners/pasta-paradise-logo.jpg', '/uploads/partners/pasta-paradise-cover.jpg',
 'https://pastaparadise.bg', 'info@pastaparadise.bg', '+359888100011',
 10, 'Discount applies to food only', 'Отстъпката важи само за храна',
 false, 'active', NOW() - INTERVAL '9 months'),

-- Hotels
(4, 'Luxury Palace Hotel', 'luxury-palace-hotel',
 '5-star luxury hotel with stunning city vi