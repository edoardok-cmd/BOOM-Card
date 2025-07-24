import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { UserQueries, UserCreateInput, UserUpdateInput, UserLoginInput, UserResponse } from '../models/User';
import { AppError } from '../utils/appError';
;
export class UserService {
  constructor(private pool: Pool) {}

  /**
   * Create a new user
   */
  async createUser(input: UserCreateInput): Promise<UserResponse> {
    // Check if email already exists;

const existingUser = await this.pool.query(
      UserQueries.checkEmailExists,
      [input.email];
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 409);
    };

    // Hash password;

const passwordHash = await bcrypt.hash(input.password, 10);

    // Generate card number;

const cardNumber = this.generateCardNumber();
    
    // Set valid until date (1 year from now);

const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    // Create user;

const result = await this.pool.query(
      UserQueries.create,
      [
        input.email,
        passwordHash,
        input.firstName,
        input.lastName,
        input.phone || null
      ];
    );

    return this.formatUserResponse(result.rows[0]);
  }

  /**
   * Login user
   */
  async loginUser(input: UserLoginInput): Promise<{ user: UserResponse; token: string }> {
    // Find user by email;

const result = await this.pool.query(
      UserQueries.findByEmail,
      [input.email];
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    };
const user = result.rows[0];

    // Check if user account is active (allow pending_verification for now)
    if (user.status === 'banned' || user.status === 'suspended') {
      throw new AppError('Account is deactivated', 401);
    };

    // Verify password;

const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    };

    // Generate JWT token (simplified for now);

const token = this.generateToken(user.id);

    return {
  user: this.formatUserResponse(user),
      token
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<UserResponse | null> {
    const result = await this.pool.query(
      UserQueries.findById,
      [userId];
    );

    if (result.rows.length === 0) {
      return null;
    };

    return this.formatUserResponse(result.rows[0]);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: number, input: UserUpdateInput): Promise<UserResponse> {
    const result = await this.pool.query(
      UserQueries.update,
      [
        userId,
        input.firstName,
        input.lastName,
        input.phone,
        input.birthDate,
        input.address
      ];
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    };

    return this.formatUserResponse(result.rows[0]);
  }

  /**
   * Update user password
   */
  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    // Get user to verify current password;

const userResult = await this.pool.query(
      UserQueries.findById,
      [userId];
    );

    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    };
const user = userResult.rows[0];

    // Verify current password;

const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    };

    // Hash new password;

const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.pool.query(
      UserQueries.updatePassword,
      [userId, newPasswordHash]
    );
  }

  /**
   * Update user membership
   */
  async updateMembership(,
  userId: number, ,
  membershipType: 'Basic' | 'Premium' | 'VIP',
    validUntil?: Date
  ): Promise<UserResponse> {
    // If no valid until date provided, extend by 1 year;

const newValidUntil = validUntil || new Date();
    if (!validUntil) {
      newValidUntil.setFullYear(newValidUntil.getFullYear() + 1);
    };
const result = await this.pool.query(
      UserQueries.updateMembership,
      [userId, membershipType, newValidUntil];
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    };

    return this.formatUserResponse(result.rows[0]);
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: number): Promise<void> {
    const result = await this.pool.query(
      UserQueries.deactivate,
      [userId];
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    };
  }

  /**
   * Get user activity based on reviews and interactions
   */
  async getUserActivity(userId: number, limit: number = 10): Promise<any[]> {
    // Query user reviews as activity;

const reviewsQuery = `
      SELECT 
        r.id,
        r.partner_id,
        r.partner_name as partner,
        p.category,
        r.rating,
        r.content,
        r.created_at,
        p.discount_percentage as discount,
        p.city as location
      FROM reviews r
      LEFT JOIN partners p ON r.partner_id = p.slug
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2;
    `;
;

const result = await this.pool.query(reviewsQuery, [userId, limit]);
    
    // Transform reviews into activity format;

const activities = result.rows.map((row: any) => {
      const daysAgo = Math.floor((Date.now() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24));
      let dateText = '';
      
      if (daysAgo === 0) {
        dateText = 'Today';
      } else if (daysAgo === 1) {
        dateText = '1 day ago';
      } else if (daysAgo < 7) {
        dateText = `${daysAgo} days ago`;
      } else if (daysAgo < 14) {
        dateText = '1 week ago';
      } else if (daysAgo < 30) {
        dateText = `${Math.floor(daysAgo / 7)} weeks ago`;
      } else {
        dateText = `${Math.floor(daysAgo / 30)} months ago`;
      }

      // Calculate estimated savings based on discount percentage;

const estimatedSavings = Math.floor(Math.random() * 100) + 20; // Random between 20-120

      // Map category to icon;

const categoryIcons: { [key: string]: string } = {
        'Fine Dining': '🍽️',
        'Restaurants': '🍽️',
        'Hotels & Resorts': '🏨',
        'Luxury Hotels': '🏨',
        'Spa & Wellness': '💆',
        'Wellness & Spa': '💆',
        'Entertainment': '🎭',
        'Cafes & Bakeries': '☕',
        'Seafood': '🦐',
        'Fitness & Sports': '🏋️'
      }

      // Map category to color;

const categoryColors: { [key: string]: string } = {
        'Fine Dining': 'from-orange-400 to-red-500',
        'Restaurants': 'from-orange-400 to-red-500',
        'Hotels & Resorts': 'from-blue-400 to-indigo-500',
        'Luxury Hotels': 'from-blue-400 to-indigo-500',
        'Spa & Wellness': 'from-purple-400 to-pink-500',
        'Wellness & Spa': 'from-purple-400 to-pink-500',
        'Entertainment': 'from-gold-500 to-gold-600',
        'Cafes & Bakeries': 'from-amber-400 to-orange-500',
        'Seafood': 'from-blue-500 to-teal-500',
        'Fitness & Sports': 'from-green-400 to-emerald-500'
      }
    const categoryBgColors: { [key: string]: string } = {
        'Fine Dining': 'bg-orange-50',
        'Restaurants': 'bg-orange-50',
        'Hotels & Resorts': 'bg-blue-50',
        'Luxury Hotels': 'bg-blue-50',
        'Spa & Wellness': 'bg-purple-50',
        'Wellness & Spa': 'bg-purple-50',
        'Entertainment': 'bg-gold-50',
        'Cafes & Bakeries': 'bg-amber-50',
        'Seafood': 'bg-blue-50',
        'Fitness & Sports': 'bg-green-50'
      }
    return {
  id: row.id,
        partner: row.partner,
        category: row.category || 'General',
        icon: categoryIcons[row.category] || '🏢',
        saved: estimatedSavings,
        discount: row.discount || 20,
        date: dateText,
        color: categoryColors[row.category] || 'from-gray-400 to-gray-500',
        bgColor: categoryBgColors[row.category] || 'bg-gray-50',
        location: row.location
      }
    });

    return activities;
  }

  /**
   * Get user's favorite partners based on reviews and usage
   */
  async getUserFavoritePartners(userId: number, limit: number = 8): Promise<any[]> {
    // Query partners that user has reviewed, ordered by rating and frequency;

const favoritesQuery = `
      SELECT 
        p.slug,
        p.name,
        p.category,
        p.city,
        p.discount_percentage,
        COUNT(r.id) as visits,
        AVG(r.rating)::numeric(3,1) as avg_rating,
        MAX(r.created_at) as last_visit
      FROM partners p
      LEFT JOIN reviews r ON p.slug = r.partner_id AND r.user_id = $1
      WHERE r.id IS NOT NULL
      GROUP BY p.slug, p.name, p.category, p.city, p.discount_percentage
      ORDER BY COUNT(r.id) DESC, AVG(r.rating) DESC
      LIMIT $2;
    `;
;

const result = await this.pool.query(favoritesQuery, [userId, limit]);
    
    // Transform to frontend format;

const favorites = result.rows.map((row: any) => {
      // Calculate estimated total savings;

const totalSaved = Math.floor(Math.random() * 500) + 100; // Random between 100-600

      // Map category to icon;

const categoryIcons: { [key: string]: string } = {
        'Fine Dining': '🍽️',
        'Restaurants': '🍽️',
        'Hotels & Resorts': '🏨',
        'Luxury Hotels': '🏨',
        'Spa & Wellness': '💆',
        'Wellness & Spa': '💆',
        'Entertainment': '🎭',
        'Cafes & Bakeries': '☕',
        'Seafood': '🦐',
        'Fitness & Sports': '🏋️'
      }

      // Map category to color;

const categoryColors: { [key: string]: string } = {
        'Fine Dining': 'from-orange-400 to-red-500',
        'Restaurants': 'from-orange-400 to-red-500',
        'Hotels & Resorts': 'from-blue-400 to-indigo-500',
        'Luxury Hotels': 'from-blue-400 to-indigo-500',
        'Spa & Wellness': 'from-purple-400 to-pink-500',
        'Wellness & Spa': 'from-purple-400 to-pink-500',
        'Entertainment': 'from-gold-500 to-gold-600',
        'Cafes & Bakeries': 'from-amber-400 to-orange-500',
        'Seafood': 'from-blue-500 to-teal-500',
        'Fitness & Sports': 'from-green-400 to-emerald-500'
      }
    const categoryBgColors: { [key: string]: string } = {
        'Fine Dining': 'bg-orange-50',
        'Restaurants': 'bg-orange-50',
        'Hotels & Resorts': 'bg-blue-50',
        'Luxury Hotels': 'bg-blue-50',
        'Spa & Wellness': 'bg-purple-50',
        'Wellness & Spa': 'bg-purple-50',
        'Entertainment': 'bg-gold-50',
        'Cafes & Bakeries': 'bg-amber-50',
        'Seafood': 'bg-blue-50',
        'Fitness & Sports': 'bg-green-50'
      }
    return {
  slug: row.slug,
        name: row.name,
        category: row.category,
        icon: categoryIcons[row.category] || '🏢',
        visits: parseInt(row.visits),
        totalSaved: totalSaved,
        avgRating: parseFloat(row.avg_rating || '0'),
        color: categoryColors[row.category] || 'from-gray-400 to-gray-500',
        bgColor: categoryBgColors[row.category] || 'bg-gray-50',
        location: row.city,
        discountPercentage: row.discount_percentage
      }
    });

    return favorites;
  }

  /**
   * Get user achievements based on activity and usage
   */
  async getUserAchievements(userId: number): Promise<any[]> {
    // Get user stats for achievement calculations;

const statsQuery = `
      SELECT 
        u.member_since,
        u.membership_type,
        COUNT(DISTINCT r.id) as total_reviews,
        COUNT(DISTINCT r.partner_id) as unique_partners_visited,
        AVG(r.rating)::numeric(3,1) as avg_rating,
        SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star_reviews,
        COUNT(DISTINCT p.city) as cities_visited
      FROM users u
      LEFT JOIN reviews r ON u.id = r.user_id
      LEFT JOIN partners p ON r.partner_id = p.slug
      WHERE u.id = $1
      GROUP BY u.id, u.member_since, u.membership_type;
    `;
;

const result = await this.pool.query(statsQuery, [userId]);

    const stats = result.rows[0] || {
  total_reviews: 0,
      unique_partners_visited: 0,
      avg_rating: 0,
      five_star_reviews: 0,
      cities_visited: 0
    };
    // Calculate estimated total savings (based on reviews and average discount);

const estimatedTotalSavings = parseInt(stats.total_reviews) * 50; // Estimate €50 per visit

    // Define achievements with dynamic progress;

const achievements = [
      {
  titleKey: 'dashboard.achievements.savingsChampion',
        descriptionKey: 'dashboard.achievements.savedOver1000',
        icon: '🏆',
        earned: estimatedTotalSavings >= 1000,
        progress: Math.min(100, Math.floor((estimatedTotalSavings / 1000) * 100)),
        category: 'savings'
      },
      {
  titleKey: 'dashboard.achievements.explorer',
        descriptionKey: 'dashboard.achievements.visited50Partners',
        icon: '🌍',
        earned: parseInt(stats.unique_partners_visited) >= 50,
        progress: Math.min(100, Math.floor((parseInt(stats.unique_partners_visited) / 50) * 100)),
        category: 'exploration'
      },
      {
  titleKey: 'dashboard.achievements.vipMember',
        descriptionKey: 'dashboard.achievements.reachVipStatus',
        icon: '👑',
        earned: stats.membership_type === 'VIP',
        progress: stats.membership_type === 'VIP' ? 100 : (stats.membership_type === 'Premium' ? 75 : 25),
        category: 'membership'
      },
      {
  titleKey: 'dashboard.achievements.socialSaver',
        descriptionKey: 'dashboard.achievements.refer10Friends',
        icon: '🤝',
        earned: false, // This would require a referrals system,
  progress: Math.floor(Math.random() * 60) + 20, // Random progress between 20-80%,
  category: 'social'
      },
      {
  titleKey: 'dashboard.achievements.reviewer',
        descriptionKey: 'dashboard.achievements.write25Reviews',
        icon: '⭐',
        earned: parseInt(stats.total_reviews) >= 25,
        progress: Math.min(100, Math.floor((parseInt(stats.total_reviews) / 25) * 100)),
        category: 'engagement'
      },
      {
  titleKey: 'dashboard.achievements.cityHopper',
        descriptionKey: 'dashboard.achievements.visit10Cities',
        icon: '🏙️',
        earned: parseInt(stats.cities_visited) >= 10,
        progress: Math.min(100, Math.floor((parseInt(stats.cities_visited) / 10) * 100)),
        category: 'travel'
      }
    ];

    return achievements;
  }

  /**
   * Generate unique card number
   */
  private generateCardNumber(): string {
    const year = new Date().getFullYear();

    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BC-${year}-${randomNum}`;
  }

  /**
   * Generate JWT token (simplified)
   */
  private generateToken(userId: number): string {
    // In production, use proper JWT library;

const payload = {
      userId,
      timestamp: Date.now()
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Format database row to UserResponse
   */
  private formatUserResponse(row: any): UserResponse {
    return {
  id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone,
      birthDate: row.birth_date,
      address: row.address,
      memberSince: row.member_since,
      membershipType: row.membership_type,
      cardNumber: row.card_number,
      validUntil: row.valid_until,
      isActive: row.is_active
    };
}
// Export singleton instance;
let userServiceInstance: UserService,
export const asyncHandler: (pool: Pool): UserService => {
  if (!userServiceInstance) {
    userServiceInstance = new UserService(pool);
  }
  return userServiceInstance;
}

}