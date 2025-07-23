import { v4 as uuidv4 } from 'uuid';

/**
 * @interface ILocalizedString
 * @description Represents a string that can be localized in multiple languages.
 */
interface ILocalizedString {
  en: string;
  bg: string;
}

/**
 * @enum {string} DayOfWeek
 * @description Represents the days of the week for scheduling.
 */
enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

/**
 * @interface IWorkingHours
 * @description Defines the working hours for a specific day.
 * Times are expected in HH:mm format.
 */
interface IWorkingHours {
  day: DayOfWeek;
  openTime: string; // e.g., "09:00"
  closeTime: string; // e.g., "17:00"
  isClosed: boolean;
}

/**
 * @enum {string} PartnerCategory
 * @description Defines the main categories for partners as per project specification.
 */
enum PartnerCategory {
  FOOD_DRINK = 'FOOD_DRINK',
  ENTERTAINMENT_NIGHTLIFE = 'ENTERTAINMENT_NIGHTLIFE',
  ACCOMMODATION = 'ACCOMMODATION',
  EXPERIENCES_SERVICES = 'EXPERIENCES_SERVICES',
}

/**
 * @interface IPartner
 * @description Represents the structure of a partner entity in the system.
 * This interface defines all necessary fields for a partner, including localization
 * and operational details.
 */
export interface IPartner {
  id: string;
  name: ILocalizedString;
  description: ILocalizedString;
  address: ILocalizedString;
  city: ILocalizedString;
  country: ILocalizedString;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string; // Optional field for partner website
  category: PartnerCategory;
  subcategories: ILocalizedString[]; // e.g., ['Fine Dining', 'Casual Dining']
  logoUrl: string; // URL to the partner's logo image
  coverImageUrl: string; // URL to a main cover image for the partner
  discountPercentage: number; // The percentage discount offered (e.g., 10, 15, 20)
  discountDescription: ILocalizedString; // Detailed description of the discount
  isActive: boolean; // Indicates if the partner is currently active on the platform
  isFeatured: boolean; // Indicates if the partner should be highlighted (e.g., on homepage)
  createdAt: string; // ISO 8601 string timestamp of creation
  updatedAt: string; // ISO 8601 string timestamp of last update
  workingHours: IWorkingHours[]; // Array detailing daily working hours
  dietaryOptions?: ILocalizedString[]; // Optional: e.g., ['Vegan', 'Gluten-Free'] for Food & Drink
  cuisineTypes?: ILocalizedString[]; // Optional: e.g., ['Bulgarian', 'Italian'] for Food & Drink
}

// Helper function to generate current ISO date strings for `createdAt` and `updatedAt`.
const now = new Date().toISOString();

/**
 * @constant {IPartner[]} partners
 * @description An array of mock partner data for testing purposes.
 * This data adheres to the IPartner interface and includes localized strings,
 * detailed working hours, and specific category/subcategory assignments
 * based on the project specification. This provides diverse examples
 * for various test scenarios.
 */
export const partners: IPartner[] = [
  {
    id: uuidv4(),
    name: { en: 'The Gourmet Palace', bg: 'Дворецът на Гурметата' },
    description: {
      en: 'An exquisite fine dining experience with a focus on modern European cuisine.',
      bg: 'Изящно гурме изживяване с акцент върху модерната европейска кухня.',
    },
    address: { en: '10 Vitosha Blvd', bg: 'бул. Витоша 10' },
    city: { en: 'Sofia', bg: 'София' },
    country: { en: 'Bulgaria', bg: 'България' },
    latitude: 42.696552,
    longitude: 23.32601,
    phone: '+359881234567',
    email: 'info@gourmetpalace.com',
    website: 'https://www.gourmetpalace.com',
    category: PartnerCategory.FOOD_DRINK,
    subcategories: [
      { en: 'Fine Dining', bg: 'Изискана кухня' },
      { en: 'Restaurants', bg: 'Ресторанти' },
    ],
    logoUrl: 'https://cdn.example.com/logos/gourmet_palace_logo.png',
    coverImageUrl: 'https://cdn.example.com/covers/gourmet_palace_cover.jpg',
    discountPercentage: 15,
    discountDescription: {
      en: '15% off total food bill, excluding special promotions and alcoholic beverages.',
      bg: '15% отстъпка от общата сметка за храна, без специални промоции и алкохолни напитки.',
    },
    isActive: true,
    isFeatured: true,
    createdAt: now,
    updatedAt: now,
    workingHours: [
      { day: DayOfWeek.MONDAY, openTime: '18:00', closeTime: '23:00', isClosed: false },
      { day: DayOfWeek.TUESDAY, openTime: '18:00', closeTime: '23:00', isClosed: false },
      { day: DayOfWeek.WEDNESDAY, openTime: '18:00', closeTime: '23:00', isClosed: false },
      { day: DayOfWeek.THURSDAY, openTime: '18:00', closeTime: '23:00', isClosed: false },
      { day: DayOfWeek.FRIDAY, openTime: '18:00', closeTime: '00:00', isClosed: false },
      { day: DayOfWeek.SATURDAY, openTime: '18:00', closeTime: '00:00', isClosed: false },
      { day: DayOfWeek.SUNDAY, openTime: '12:00', closeTime: '16:00', isClosed: false }, // Brunch
    ],
    dietaryOptions: [
      { en: 'Vegetarian', bg: 'Вегетариански' },
      { en: 'Gluten-Free', bg: 'Без глутен' },
    ],
    cuisineTypes: [
      { en: 'European', bg: 'Европейска' },
      { en: 'French', bg: 'Френска' },
    ],
  },
  {
    id: uuidv4(),
    name: { en: 'Grand Central Hotel', bg: 'Хотел Гранд Централ' },
    description: {
      en: 'A luxurious 5-star hotel in the heart of the city, perfect for business and leisure travelers.',
      bg: 'Луксозен 5-звезден хотел в сърцето на града, идеален за бизнес и туристически пътувания.',
    },
    address: { en: '5 Alexander Malinov Blvd', bg: 'бул. Александър Малинов 5' },
    city: { en: 'Sofia', bg: 'София' },
    country: { en: 'Bulgaria', bg: 'България' },
    latitude: 42.6508,
    longitude: 23.3792,
    phone: '+35929876543',
    email: 'reservations@grandcentralhotel.com',
    website: 'https://www.grandcentralhotel.com',
    category: PartnerCategory.ACCOMMODATION,
    subcategories: [
      { en: 'Hotels (5-star)', bg: 'Хотели (5 звезди)' },
      { en: 'Business Hotels', bg: 'Бизнес хотели' },
    ],
    logoUrl: 'https://cdn.example.com/logos/grand_central_hotel_logo.png',
    coverImageUrl: 'https://cdn.example.com/covers/grand_central_hotel_cover.jpg',
    discountPercentage: 20,
    discountDescription: {
      en: '20% off best available room rates for direct bookings, excluding suites.',
      bg: '20% отстъпка от най-добрите налични цени на стаите при директни резервации, без апартаменти.',
    },
    isActive: true,
    isFeatured: true,
    createdAt: now,
    updatedAt: now,
    workingHours: [
      { day: DayOfWeek.MONDAY, openTime: '00:00', closeTime: '23:59', isClosed: false },
      { day: DayOfWeek.TUESDAY, openTime: '00:00', closeTime: '23:59', isClosed: false },
      { day: DayOfWeek.WEDNESDAY, openTime: '00:00', closeTime: '23:59', isClosed: false },
      { day: DayOfWeek.THURSDAY, openTime: '00:00', closeTime: '23:59', isClosed: false },
      { day: DayOfWeek.FRIDAY, openTime: '00:00', closeTime: '23:59', isClosed: false },
      { day: DayOfWeek.SATURDAY, openTime: '00:00', closeTime: '23:59', isClosed: false },
      { day: DayOfWeek.SUNDAY, openTime: '00:00', closeTime: '23:59', isClosed: false },
    ],
  },
  {
    id: uuidv4(),
    name: { en: 'Serenity Spa & Wellness', bg: 'Спа и Уелнес Център Серенити' },
    description: {
      en: 'Indulge in a world of relaxation and rejuvenation with our extensive range of spa treatments and therapies.',
      bg: 'Потопете се в свят на релаксация и подмладяване с нашата широка гама от спа процедури и терапии.',
    },
    address: { en: '1 Tsar Osvoboditel Blvd', bg: 'бул. Цар Освободител 1' },
    city: { en: 'Plovdiv', bg: 'Пловдив' },
    country: { en: 'Bulgaria', bg: 'България' },
    latitude: 42.1471,
    longitude: 24.7599,
    phone: '+359891122334',
    email: 'info@serenityspa.com',
    website: 'https://www.serenityspa.com',
    category: PartnerCategory.EXPERIENCES_SERVICES,
    subcategories: [
      { en: 'Wellness & Spa', bg: 'Уелнес и Спа' },
      { en: 'Beauty Services', bg: 'Козметични услуги' },
    ],
    logoUrl: 'https://cdn.example.com/logos/serenity_spa_logo.png',
    coverImageUrl: 'https://cdn.example.com/covers/serenity_spa_cover.jpg',
    discountPercentage: 10,
    discountDescription: {
      en: '10% off all individual spa treatments and massages. Does not apply to package deals.',
      bg: '10% отстъпка от всички индивидуални спа процедури и масажи. Не важи за пакетни оферти.',
    },
    isActive: true,
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
    workingHours: [
      { day: DayOfWeek.MONDAY, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.TUESDAY, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.WEDNESDAY, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.THURSDAY, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.FRIDAY, openTime: '10:00', closeTime: '21:00', isClosed: false },
      { day: DayOfWeek.SATURDAY, openTime: '09:00', closeTime: '21:00', isClosed: false },
      { day: DayOfWeek.SUNDAY, openTime: '09:00', closeTime: '18:00', isClosed: false },
    ],
  },
  {
    id: uuidv4(),
    name: { en: 'The Electric Pulse Nightclub', bg: 'Нощен Клуб Електрически Пулс' },
    description: {
      en: 'The hottest spot in town for live music and top DJ sets, open until the early hours.',
      bg: 'Най-горещото място в града за музика на живо и топ DJ сетове, отворено до ранните часове.',
    },
    address: { en: '15 Rakovski St', bg: 'ул. Раковски 15' },
    city: { en: 'Varna', bg: 'Варна' },
    country: { en: 'Bulgaria', bg: 'България' },
    latitude: 43.2078,
    longitude: 27.9157,
    phone: '+359877665544',
    email: 'contact@electricpulse.com',
    website: 'https://www.electricpulse.com',
    category: PartnerCategory.ENTERTAINMENT_NIGHTLIFE,
    subcategories: [
      { en: 'Nightclubs', bg: 'Нощни клубове' },
      { en: 'Live Music Venues', bg: 'Места за музика на живо' },
    ],
    logoUrl: 'https://cdn.example.com/logos/electric_pulse_logo.png',
    coverImageUrl: 'https://cdn.example.com/covers/electric_pulse_cover.jpg',
    discountPercentage: 10,
    discountDescription: {
      en: '10% off entry fee and the first standard drink (beer/wine/soft drink).',
      bg: '10% отстъпка от входната такса и първата стандартна напитка (бира/вино/безалкохолно).',
    },
    isActive: true,
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
    workingHours: [
      { day: DayOfWeek.MONDAY, openTime: '00:00', closeTime: '00:00', isClosed: true },
      { day: DayOfWeek.TUESDAY, openTime: '00:00', closeTime: '00:00', isClosed: true },
      { day: DayOfWeek.WEDNESDAY, openTime: '00:00', closeTime: '00:00', isClosed: true },
      { day: DayOfWeek.THURSDAY, openTime: '22:00', closeTime: '04:00', isClosed: false },
      { day: DayOfWeek.FRIDAY, openTime: '22:00', closeTime: '05:00', isClosed: false },
      { day: DayOfWeek.SATURDAY, openTime: '22:00', closeTime: '05:00', isClosed: false },
      { day: DayOfWeek.SUNDAY, openTime: '00:00', closeTime: '00:00', isClosed: true },
    ],
  },
  {
    id: uuidv4(),
    name: { en: 'Cosy Coffee Corner', bg: 'Уютно Кафе Кътче' },
    description: {
      en: 'A charming café offering specialty coffees, fresh pastries, and a relaxed atmosphere, perfect for a quiet afternoon.',
      bg: 'Очарователно кафене, предлагащо специализирани кафета, пресни сладкиши и релаксираща атмосфера, идеално за спокоен следобед.',
    },
    address: { en: '23 Oborishte St', bg: 'ул. Оборище 23' },
    city: { en: 'Sofia', bg: 'София' },
    country: { en: 'Bulgaria', bg: 'България' },
    latitude: 42.6997,
    longitude: 23.3323,
    phone: '+359899001122',
    email: 'info@cosycoffeecorner.com',
    website: 'https://www.cosycoffeecorner.com',
    category: PartnerCategory.FOOD_DRINK,
    subcategories: [
      { en: 'Cafés & Coffee Shops', bg: 'Кафенета и Кафе-сладкарници' },
    ],
    logoUrl: 'https://cdn.example.com/logos/cosy_coffee_logo.png',
    coverImageUrl: 'https://cdn.example.com/covers/cosy_coffee_cover.jpg',
    discountPercentage: 10,
    discountDescription: {
      en: '10% off all hot beverages and pastries. Does not apply to bottled drinks.',
      bg: '10% отстъпка от всички топли напитки и сладкиши. Не важи за бутилирани напитки.',
    },
    isActive: true,
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
    workingHours: [
      { day: DayOfWeek.MONDAY, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.TUESDAY, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.WEDNESDAY, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.THURSDAY, openTime: '08:00', closeTime: '20:00', isClosed: false },
      { day: DayOfWeek.FRIDAY, openTime: '08:00', closeTime: '21:00', isClosed: false },
      { day: DayOfWeek.SATURDAY, openTime: '09:00', closeTime: '21:00', isClosed: false },
      { day: DayOfWeek.SUNDAY, openTime: '09:00', closeTime: '19:00', isClosed: false },
    ],
    dietaryOptions: [
      { en: 'Vegan Options', bg: 'Веган опции' },
      { en: 'Lactose-Free Milk', bg: 'Безлактозно мляко' },
    ],
  },
  {
    id: uuidv4(),
    name: { en: 'Escape Room Adventures', bg: 'Ескейп Стая Приключения' },
    description: {
      en: 'Challenging and immersive escape rooms for friends, families, and team building, with various themed scenarios.',
      bg: 'Предизвикателни и потапящи ескейп стаи за приятели, семейства и тиймбилдинг, с различни тематични сценарии.',
    },
    address: { en: '7 Slaveykov Square', bg: 'пл. Славейков 7' },
    city: { en: 'Sofia', bg: 'София' },
    country: { en: 'Bulgaria', bg: 'България' },
    latitude: 42.6925,
    longitude: 23.3217,
    phone: '+359877112233',
    email: 'info@escaperoomadventures.com',
    website: 'https://www.escaperoomadventures.com',
    category: PartnerCategory.ENTERTAINMENT_NIGHTLIFE, // Categorized under Entertainment based on project spec
    subcategories: [
      { en: 'Escape Rooms', bg: 'Ескейп стаи' },
      { en: 'Gaming Centers', bg: 'Гейминг центрове' },
    ],
    logoUrl: 'https://cdn.example.com/logos/escape_room_logo.png',
    coverImageUrl: 'https://cdn.example.com/covers/escape_room_cover.jpg',
    discountPercentage: 15,
    discountDescription: {
      en: '15% off group bookings (minimum 4 people). Advance booking required.',
      bg: '15% отстъпка за групови резервации (минимум 4 човека). Изисква се предварителна резервация.',
    },
    isActive: true,
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
    workingHours: [
      { day: DayOfWeek.MONDAY, openTime: '14:00', closeTime: '22:00', isClosed: false },
      { day: DayOfWeek.TUESDAY, openTime: '14:00', closeTime: '22:00', isClosed: false },
      { day: DayOfWeek.WEDNESDAY, openTime: '14:00', closeTime: '22:00', isClosed: false },
      { day: DayOfWeek.THURSDAY, openTime: '14:00', closeTime: '23:00', isClosed: false },
      { day: DayOfWeek.FRIDAY, openTime: '12:00', closeTime: '00:00', isClosed: false },
      { day: DayOfWeek.SATURDAY, openTime: '10:00', closeTime: '00:00', isClosed: false },
      { day: DayOfWeek.SUNDAY, openTime: '10:00', closeTime: '22:00', isClosed: false },
    ],
  },
];

// Security and Production Readiness Considerations:
// 1. Data Validation: In a real application, ensure all incoming partner data
//    is thoroughly validated against the IPartner interface and business rules
//    (e.g., valid email format, phone numbers, URL schemes, percentage range).
// 2. Data Sanitization: For user-submitted data, sanitize all text fields to prevent
//    cross-site scripting (XSS) attacks before storing or displaying.
// 3. Unique IDs: Use robust UUID generation for partner IDs to ensure uniqueness
//    across the system. `uuidv4()` is suitable for this.
// 4. Localization: The `ILocalizedString` interface promotes i18n from the ground up,
//    ensuring text content can be easily translated. In a production environment,
//    ensure a robust i18n framework handles translation retrieval efficiently.
// 5. Image URLs: Ensure image URLs point to a secure (HTTPS) and highly available
//    Content Delivery Network (CDN) for optimal performance and reliability.
// 6. Geographic Coordinates: Validate latitude and longitude values to be within
//    valid ranges.
// 7. Time Handling: Use ISO 8601 format for timestamps (`createdAt`, `updatedAt`)
//    for consistency and ease of parsing across different systems. Time strings
//    for working hours (`openTime`, `closeTime`) should adhere to a strict format (HH:mm).
// 8. Error Handling (Application Logic): While fixtures are static, any operations
//    in the application that interact with partner data (e.g., API endpoints for
//    fetching/creating partners) must include comprehensive error handling,
//    logging, and appropriate responses.