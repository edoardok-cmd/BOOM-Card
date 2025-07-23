import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('deals').del();

  // Insert seed entries
  await knex('deals').insert([
    {
      id: 'deal_1',
      partner_id: 'partner_1',
      discount_percentage: 20,
      title: { en: 'Weekend Special - 20% Off', bg: 'Уикенд Специална Оферта - 20% Отстъпка' },
      description: { 
        en: 'Enjoy 20% off on all main courses during weekends', 
        bg: 'Насладете се на 20% отстъпка за всички основни ястия през уикенда' 
      },
      terms_and_conditions: {
        en: 'Valid Friday to Sunday. Not combinable with other offers. Minimum order 50 BGN.',
        bg: 'Валидно от петък до неделя. Не се комбинира с други оферти. Минимална поръчка 50 лв.'
      },
      valid_from: new Date('2024-01-01'),
      valid_until: new Date('2024-12-31'),
      days_of_week: ['friday', 'saturday', 'sunday'],
      time_restrictions: { start: '12:00', end: '22:00' },
      minimum_spend: 50,
      maximum_discount_amount: 100,
      usage_limit_per_user: 4,
      total_usage_limit: 1000,
      requires_reservation: false,
      advance_booking_hours: 0,
      categories: ['dining', 'weekend'],
      applicable_items: ['main_courses'],
      excluded_items: ['beverages', 'desserts'],
      is_active: true,
      is_featured: true,
      priority: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'deal_2',
      partner_id: 'partner_2',
      discount_percentage: 15,
      title: { en: 'Spa Day Relaxation Package', bg: 'Спа Ден Релаксиращ Пакет' },
      description: { 
        en: 'Full day spa access with 15% discount on all treatments', 
        bg: 'Целодневен достъп до спа с 15% отстъпка за всички процедури' 
      },
      terms_and_conditions: {
        en: 'Advance booking required. Valid for selected treatments only.',
        bg: 'Изисква се предварителна резервация. Валидно само за избрани процедури.'
      },
      valid_from: new Date('2024-01-01'),
      valid_until: new Date('2024-06-30'),
      days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      time_restrictions: { start: '09:00', end: '18:00' },
      minimum_spend: 100,
      maximum_discount_amount: 150,
      usage_limit_per_user: 2,
      total_usage_limit: 500,
      requires_reservation: true,
      advance_booking_hours: 24,
      categories: ['wellness', 'spa'],
      applicable_items: ['massage', 'facial', 'body_treatment'],
      excluded_items: ['products'],
      is_active: true,
      is_featured: false,
      priority: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'deal_3',
      partner_id: 'partner_3',
      discount_percentage: 25,
      title: { en: 'Happy Hour Cocktails', bg: 'Щастлив Час Коктейли' },
      description: { 
        en: '25% off all cocktails during happy hour', 
        bg: '25% отстъпка за всички коктейли през щастливия час' 
      },
      terms_and_conditions: {
        en: 'Valid daily 17:00-19:00. Maximum 4 cocktails per person.',
        bg: 'Валидно всеки ден 17:00-19:00. Максимум 4 коктейла на човек.'
      },
      valid_from: new Date('2024-01-01'),
      valid_until: new Date('2024-12-31'),
      days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      time_restrictions: { start: '17:00', end: '19:00' },
      minimum_spend: 0,
      maximum_discount_amount: 50,
      usage_limit_per_user: null,
      total_usage_limit: null,
      requires_reservation: false,
      advance_booking_hours: 0,
      categories: ['nightlife', 'drinks'],
      applicable_items: ['cocktails'],
      excluded_items: ['premium_spirits'],
      is_active: true,
      is_featured: true,
      priority: 3,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'deal_4',
      partner_id: 'partner_4',
      discount_percentage: 30,
      title: { en: 'Early Bird Hotel Booking', bg: 'Ранна Резервация Хотел' },
      description: { 
        en: '30% off for bookings made 30+ days in advance', 
        bg: '30% отстъпка за резервации направени 30+ дни предварително' 
      },
      terms_and_conditions: {
        en: 'Non-refundable. Subject to availability. Minimum 2 nights stay.',
        bg: 'Невъзстановима. При наличност. Минимум 2 нощувки.'
      },
      valid_from: new Date('2024-01-01'),
      valid_until: new Date('2024-12-31'),
      days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      time_restrictions: null,
      minimum_spend: 200,
      maximum_discount_amount: 500,
      usage_limit_per_user: 3,
      total_usage_limit: 200,
      requires_reservation: true,
      advance_booking_hours: 720, // 30 days
      categories: ['accommodation', 'hotels'],
      applicable_items: ['standard_room', 'deluxe_room'],
      excluded_items: ['suite', 'penthouse'],
      is_active: true,
      is_featured: false,
      priority: 4,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'deal_5',
      partner_id: 'partner_5',
      discount_percentage: 10,
      title: { en: 'Escape Room Team Challenge', bg: 'Escape Room Отборно Предизвикателство' },
      description: { 
        en: '10% off for groups of 4 or more', 
        bg: '10% отстъпка за групи от 4 или повече' 
      },
      terms_and_conditions: {
        en: 'Advance booking required. Valid for all rooms except VIP experience.',
        bg: 'Изисква се предварителна резервация. Валидно за всички стаи освен VIP преживяване.'
      },
      valid_from: new Date('2024-01-01'),
      valid_until: new Date('2024-12-31'),
      days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      time_restrictions: { start: '10:00', end: '22:00' },
      minimum_spend: 80,
      maximum_discount_amount: 40,
      usage_limit_per_user: 5,
      total_usage_limit: 1000,
      requires_reservation: true,
      advance_booking_hours: 2,
      categories: ['entertainment', 'experiences'],
      applicable_items: ['standard_room', 'horror_room', 'mystery_room'],
      excluded_items: ['vip_experience'],
      is_active: true,
      is_featured: false,
      priority: 5,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'deal_6',
      partner_id: 'partner_6',
      discount_percentage: 50,
      title: { en: 'Birthday Month Special', bg: 'Специална Оферта за Рожден Ден' },
      description: { 
        en: '50% off during your birthday month', 
        bg: '50% отстъпка през месеца на вашия рожден ден' 
      },
      terms_and_conditions: {
        en: 'Valid ID required. One use per birthday month. Cannot be combined.',
        bg: 'Изисква се валидна лична карта. Еднократна употреба за месец. Не се комбинира.'
      },
      valid_from: new Date('2024-01-01'),
      valid_until: new Date('2024-12-31'),
      days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      time_restrictions: null,
      minimum_spend: 50,
      maximum_discount_amount: 100,
      usage_limit_per_user: 1,
      total_usage_limit: null,
      requires_reservation: true,
      advance_booking_hours: 0,
      categories: ['special_occasion'],
      applicable_items: null,
      excluded_items: ['alcohol', 'tobacco'],
      is_active: true,
      is_featured: true,
      priority: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 'deal_7',
      partner_id: 'partner_7',
      discount_percentage: 20,
      title: { en: 'Wine Tasting Experience', bg: 'Дегустация на Вино' },
      description: { 
        en: '20% off wine tasting sessions with sommelier', 
        bg: '20% отстъпка за дегустация на вино със сомелиер' 
      },
      terms_and_conditions: {
        en: 'Minimum 2 persons. Includes 5 wine samples and appetizers.',
        bg: 'Минимум 2 
}}}