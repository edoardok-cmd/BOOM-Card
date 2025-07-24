import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
;
interface PartnerSeed {
  id: string;
  business_name: string,
  legal_name: string,
  business_type: 'restaurant' | 'hotel' | 'spa' | 'entertainment' | 'service',
  category: string,
  subcategory?: string,
  description_en: string,
  description_bg: string,
  logo_url?: string
  cover_image_url?: string
  website?: string,
  email: string,
  phone: string,
  registration_number: string,
  vat_number?: string,
  status: 'active' | 'pending' | 'suspended' | 'inactive',
  discount_percentage: number,
  discount_conditions_en?: string
  discount_conditions_bg?: string,
  featured: boolean,
  rating?: number
  price_range?: 1 | 2 | 3 | 4
  amenities?: string[]
  cuisines?: string[]
  dietary_options?: string[]
  opening_hours?: Record<string, { open: string; close: string }>,
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  },
    contract_start_date: Date,
  contract_end_date?: Date,
  commission_rate: number,
  payment_terms: number,
  created_at: Date,
  updated_at: Date,
}
interface LocationSeed {
  id: string;
  partner_id: string,
  name: string,
  address_line1: string,
  address_line2?: string,
  city: string,
  postal_code: string,
  country: string,
  latitude: number,
  longitude: number,
  phone?: string
  email?: string,
  is_primary: boolean,
  created_at: Date,
  updated_at: Date,
}
const partners: PartnerSeed[] = [
  // Restaurants
  {
  id: uuidv4(),
    business_name: 'The Grand Sofia',
    legal_name: 'Grand Sofia Restaurant Ltd.',
    business_type: 'restaurant',
    category: 'food_drink',
    subcategory: 'fine_dining',
    description_en: 'Award-winning fine dining restaurant offering contemporary European cuisine with Bulgarian influences. Elegant atmosphere with panoramic city views.',
    description_bg: 'Награждаван ресторант за изискана кухня, предлагащ съвременна европейска кухня с български влияния. Елегантна атмосфера с панорамна гледка към града.',
    logo_url: '/uploads/partners/grand-sofia-logo.png',
    cover_image_url: '/uploads/partners/grand-sofia-cover.jpg',
    website: 'https://www.grandsofia.bg',
    email: 'info@grandsofia.bg',
    phone: '+359 2 987 6543',
    registration_number: 'BG123456789',
    vat_number: 'BG123456789',
    status: 'active',
    discount_percentage: 20,
    discount_conditions_en: 'Valid for lunch menu Monday-Friday. Not valid on holidays.',
    discount_conditions_bg: 'Валидно за обедно меню понеделник-петък. Не важи в празнични дни.',
    featured: true,
    rating: 4.8,
    price_range: 4,
    amenities: ['parking', 'wifi', 'air_conditioning', 'wheelchair_accessible', 'outdoor_seating'],
    cuisines: ['european', 'bulgarian', 'mediterranean'],
    dietary_options: ['vegetarian', 'vegan', 'gluten_free'],
    opening_hours: {
  monday: { open: '12:00', close: '23:00' },
      tuesday: { open: '12:00', close: '23:00' },
      wednesday: { open: '12:00', close: '23:00' },
      thursday: { open: '12:00', close: '23:00' },
      friday: { open: '12:00', close: '00:00' },
      saturday: { open: '12:00', close: '00:00' },
      sunday: { open: '12:00', close: '22:00' },
    social_media: {
  facebook: 'https://facebook.com/grandsofia',
      instagram: 'https://instagram.com/grandsofia'
    },
    contract_start_date: new Date('2024-01-01'),
    commission_rate: 15,
    payment_terms: 30,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
  id: uuidv4(),
    business_name: 'Sofia Sky Bar',
    legal_name: 'Sky Entertainment Ltd.',
    business_type: 'entertainment',
    category: 'entertainment_nightlife',
    subcategory: 'sky_bar',
    description_en: 'Rooftop bar with stunning 360-degree views of Sofia. Premium cocktails, live DJ sets, and exclusive events.',
    description_bg: 'Бар на покрива с невероятна 360-градусова гледка към София. Премиум коктейли, DJ сетове на живо и ексклузивни събития.',
    logo_url: '/uploads/partners/sky-bar-logo.png',
    cover_image_url: '/uploads/partners/sky-bar-cover.jpg',
    website: 'https://www.sofiaskybar.com',
    email: 'reservations@sofiaskybar.com',
    phone: '+359 2 876 5432',
    registration_number: 'BG987654321',
    vat_number: 'BG987654321',
    status: 'active',
    discount_percentage: 15,
    discount_conditions_en: 'Valid Sunday-Thursday. Not valid for special events.',
    discount_conditions_bg: 'Валидно неделя-четвъртък. Не важи за специални събития.',
    featured: true,
    rating: 4.6,
    price_range: 3,
    amenities: ['wifi', 'air_conditioning', 'live_music', 'outdoor_seating', 'valet_parking'],
    opening_hours: {
  monday: { open: '18:00', close: '02:00' },
      tuesday: { open: '18:00', close: '02:00' },
      wednesday: { open: '18:00', close: '02:00' },
      thursday: { open: '18:00', close: '03:00' },
      friday: { open: '18:00', close: '04:00' },
      saturday: { open: '18:00', close: '04:00' },
      sunday: { open: '18:00', close: '02:00' },
    social_media: {
  facebook: 'https://facebook.com/sofiaskybar',
      instagram: 'https://instagram.com/sofiaskybar',
      twitter: 'https://twitter.com/sofiaskybar'
    },
    contract_start_date: new Date('2024-01-15'),
    commission_rate: 12,
    payment_terms: 30,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
  id: uuidv4(),
    business_name: 'Harmony Spa & Wellness',
    legal_name: 'Harmony Wellness Centers Ltd.',
    business_type: 'spa',
    category: 'experiences_services',
    subcategory: 'wellness_spa',
    description_en: 'Luxury spa offering traditional and modern treatments. Features include sauna, steam room, indoor pool, and expert massage therapists.',
    description_bg: 'Луксозен спа център, предлагащ традиционни и модерни процедури. Включва сауна, парна баня, закрит басейн и експертни масажисти.',
    logo_url: '/uploads/partners/harmony-spa-logo.png',
    cover_image_url: '/uploads/partners/harmony-spa-cover.jpg',
    website: 'https://www.harmonyspa.bg',
    email: 'info@harmonyspa.bg',
    phone: '+359 2 765 4321',
    registration_number: 'BG456789123',
    vat_number: 'BG456789123',
    status: 'active',
    discount_percentage: 25,
    discount_conditions_en: 'Valid for all treatments except promotional packages. Advance booking required.',
    discount_conditions_bg: 'Валидно за всички процедури с изключение на промоционални пакети. Изисква се предварителна резервация.',
    featured: false,
    rating: 4.9,
    price_range: 3,
    amenities: ['parking', 'wifi', 'wheelchair_accessible', 'locker_room', 'shower', 'sauna', 'pool'],
    opening_hours: {
  monday: { open: '09:00', close: '21:00' },
      tuesday: { open: '09:00', close: '21:00' },
      wednesday: { open: '09:00', close: '21:00' },
      thursday: { open: '09:00', close: '21:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '10:00', close: '20:00' },
    social_media: {
  facebook: 'https://facebook.com/harmonyspa',
      instagram: 'https://instagram.com/harmonyspa'
    },
    contract_start_date: new Date('2024-02-01'),
    commission_rate: 18,
    payment_terms: 45,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
  id: uuidv4(),
    business_name: 'Grand Hotel Sofia',
    legal_name: 'Grand Hotels International Bulgaria Ltd.',
    business_type: 'hotel',
    category: 'accommodation',
    subcategory: 'luxury_hotel',
    description_en: '5-star luxury hotel in the heart of Sofia. Features 200 elegantly appointed rooms, conference facilities, spa, and three restaurants.',
    description_bg: '5-звезден луксозен хотел в сърцето на София. Разполага с 200 елегантно обзаведени стаи, конферентни зали, спа център и три ресторанта.',
    logo_url: '/uploads/partners/grand-hotel-logo.png',
    cover_image_url: '/uploads/partners/grand-hotel-cover.jpg',
    website: 'https://www.grandhotelso
}

}
}