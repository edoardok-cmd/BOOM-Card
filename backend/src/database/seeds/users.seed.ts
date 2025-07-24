import { Knex } from 'knex';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
;
interface User {
  id: string;
  email: string,
  password_hash: string,
  first_name: string,
  last_name: string,
  phone: string | null,
  date_of_birth: Date | null,
  gender: 'male' | 'female' | 'other' | null,
  language_preference: 'en' | 'bg',
  role: 'consumer' | 'partner' | 'admin' | 'super_admin',
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification',
  email_verified: boolean,
  phone_verified: boolean,
  avatar_url: string | null,
  address_line1: string | null,
  address_line2: string | null,
  city: string | null,
  state_province: string | null,
  postal_code: string | null,
  country: string,
  notification_preferences: {
  email_marketing: boolean,
  sms_marketing: boolean,
  push_notifications: boolean,
  partner_updates: boolean,
  transaction_alerts: boolean,
  weekly_digest: boolean,
  },
    privacy_settings: {
  profile_visibility: 'public' | 'private' | 'friends_only',
  show_savings_stats: boolean,
  allow_reviews_public: boolean,
  },
    referral_code: string,
  referred_by: string | null,
  total_savings: number,
  total_transactions: number,
  member_since: Date,
  last_login_at: Date | null,
  last_activity_at: Date | null,
  password_reset_token: string | null,
  password_reset_expires: Date | null,
  two_factor_enabled: boolean,
  two_factor_secret: string | null,
  metadata: Record<string, any>;,
  created_at: Date,
  updated_at: Date,
}
export async function seed(knex: Knex): Promise<void> {
  // Check if users table already has data;

const existingUsers = await knex('users').select('id').limit(1);
  if (existingUsers.length > 0) {
    console.log('Users table already seeded, skipping...');
    return;
  };
const now = new Date();

  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Hash passwords for all users (using a common password for seed data);

const defaultPassword = await bcrypt.hash('Password123!', 10);

  const adminPassword = await bcrypt.hash('AdminSecure123!', 10);
;

const users: Partial<User>[] = [
    // Super Admin
    {
  id: uuidv4(),
      email: 'super.admin@boomcard.bg',
      password_hash: adminPassword,
      first_name: 'Super',
      last_name: 'Admin',
      phone: '+359888100001',
      date_of_birth: new Date('1980-01-15'),
      gender: 'male',
      language_preference: 'en',
      role: 'super_admin',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
      city: 'Sofia',
      country: 'BG',
      notification_preferences: {
  email_marketing: false,
        sms_marketing: false,
        push_notifications: true,
        partner_updates: true,
        transaction_alerts: true,
        weekly_digest: false
      },
      privacy_settings: {
  profile_visibility: 'private',
        show_savings_stats: false,
        allow_reviews_public: false
      },
      referral_code: 'SUPERADMIN',
      total_savings: 0,
      total_transactions: 0,
      member_since: oneYearAgo,
      last_login_at: now,
      last_activity_at: now,
      two_factor_enabled: true,
      metadata: { department: 'IT', access_level: 'full' },
      created_at: oneYearAgo,
      updated_at: now
    },

    // Regular Admins
    {
  id: uuidv4(),
      email: 'admin.operations@boomcard.bg',
      password_hash: adminPassword,
      first_name: 'Maria',
      last_name: 'Petrova',
      phone: '+359888100002',
      date_of_birth: new Date('1985-03-22'),
      gender: 'female',
      language_preference: 'bg',
      role: 'admin',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mariapetrova',
      city: 'Sofia',
      country: 'BG',
      notification_preferences: {
  email_marketing: false,
        sms_marketing: false,
        push_notifications: true,
        partner_updates: true,
        transaction_alerts: true,
        weekly_digest: true
      },
      privacy_settings: {
  profile_visibility: 'private',
        show_savings_stats: false,
        allow_reviews_public: false
      },
      referral_code: 'ADMIN002',
      total_savings: 0,
      total_transactions: 0,
      member_since: sixMonthsAgo,
      last_login_at: oneWeekAgo,
      last_activity_at: oneWeekAgo,
      two_factor_enabled: true,
      metadata: { department: 'Operations', access_level: 'standard' },
      created_at: sixMonthsAgo,
      updated_at: oneWeekAgo
    },

    {
  id: uuidv4(),
      email: 'admin.support@boomcard.bg',
      password_hash: adminPassword,
      first_name: 'Ivan',
      last_name: 'Dimitrov',
      phone: '+359888100003',
      date_of_birth: new Date('1990-07-10'),
      gender: 'male',
      language_preference: 'bg',
      role: 'admin',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ivandimitrov',
      city: 'Plovdiv',
      country: 'BG',
      notification_preferences: {
  email_marketing: false,
        sms_marketing: false,
        push_notifications: true,
        partner_updates: false,
        transaction_alerts: true,
        weekly_digest: false
      },
      privacy_settings: {
  profile_visibility: 'private',
        show_savings_stats: false,
        allow_reviews_public: false
      },
      referral_code: 'ADMIN003',
      total_savings: 0,
      total_transactions: 0,
      member_since: threeMonthsAgo,
      last_login_at: now,
      last_activity_at: now,
      two_factor_enabled: false,
      metadata: { department: 'Customer Support', access_level: 'support' },
      created_at: threeMonthsAgo,
      updated_at: now
    },

    // Partner Users
    {
  id: uuidv4(),
      email: 'restaurant.sofia@partner.com',
      password_hash: defaultPassword,
      first_name: 'Georgi',
      last_name: 'Georgiev',
      phone: '+359888200001',
      date_of_birth: new Date('1982-11-05'),
      gender: 'male',
      language_preference: 'bg',
      role: 'partner',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=georgigeorgiev',
      address_line1: 'ul. Vitosha 15',
      city: 'Sofia',
      postal_code: '1000',
      country: 'BG',
      notification_preferences: {
  email_marketing: true,
        sms_marketing: false,
        push_notifications: true,
        partner_updates: true,
        transaction_alerts: true,
        weekly_digest: true
      },
      privacy_settings: {
  profile_visibility: 'public',
        show_savings_stats: true,
        allow_reviews_public: true
      },
      referral_code: 'PARTNER001',
      total_savings: 0,
      total_transactions: 0,
      member_since: sixMonthsAgo,
      last_login_at: oneWeekAgo,
      last_activity_at: oneWeekAgo,
      two_factor_enabled: false,
      metadata: { business_type: 'restaurant', verified_business: true },
      created_at: sixMonthsAgo,
      updated_at: oneWeekAgo
    },

    {
  id: uuidv4(),
      email: 'hotel.plovdiv@partner.com',
      password_hash: defaultPassword,
      first_name: 'Elena',
      last_name: 'Todorova',
      phone: '+359888200002',
      date_of_birth: new Date('1978-04-18'),
      gender: 'female',
      language_preference: 'bg',
      role: 'partner',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elenatodorova',
      address_line1: 'bul. Tsar Boris III 54',
      city: 'Plovdiv',
      postal_code: '4000',
      country: 'BG',
      notification_preferences: {
  email_marketing: true,
        sms_marketing: true,
        push_notifications: true,
        partner_updates: true,
        transaction_alerts: true,
        weekly_digest: false
      },
      privacy_settings: {
  profile_visibility: 'public',
        show_savings_stats: true,
        allow_reviews_public: true
      },
      referral_code: 'PARTNER002',
      total_savings: 0,
      total_transactions: 0,
      member_since: oneYearAgo,
      last_login_at: oneMonthAgo,
      last_activity_at: oneMonthAgo,
      two_factor_enabled: true,
      metadata: { business_type: 'hotel', verified_business: true, star_rating: 4 },
      created_at: oneYearAgo,
      updated_at: oneMonthAgo
    },

    // Active Consumer Users
    {
  id: uuidv4(),
      email: 'peter.nikolov@gmail.com',
      password_hash: defaultPassword,
      first_name: 'Peter',
      last_name: 'Nikolov',
      phone: '+359888300001',
      date_of_birth: new Date('1995-06-12'),
      gender: 'male',
      language_preference: 'bg',
      role: 'consumer',
      status: 'active',
      email_verified: true,
      phone_verified: true,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=peternikolov',
      address_line1: 'zh.k. Mladost 1',
      city: 'Sofia',
      postal_code: '1784',
      country: 'BG',
      notification_preferences: {
  email_marketing: true,
        sms_marketing: false,
        push_notifications: true,
        partner_updates: true,
        transaction_alerts: true,
        weekly_digest: true
      },
      privacy_settings: {
  profile_visibility: 'public',
        show_savings_stats: true,
        allow_reviews_public: true
      },
      referral_code: 'PETER001',
      referred_by: 'PARTNER001'
}

}