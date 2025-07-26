import { boomApi } from './boomApi';
import { 
  User,
  UserStats,
  Transaction,
  Activity,
  Achievement,
  QRCodeData,
  ConnectedAccount
} from '../types';
import { AppError } from '../utils/errorHandler';

class UserService {
  private userStatsCache: UserStats | null = null;
  private achievementsCache: Achievement[] | null = null;
  private qrCodeCache: QRCodeData | null = null;
  private connectedAccountsCache: ConnectedAccount[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 300000; // 5 minutes

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const updatedUser = await boomApi.updateProfile(data);
      
      // Clear related caches
      this.userStatsCache = null;
      
      return updatedUser;
    } catch (error) {
      throw new AppError('Failed to update profile', 'PROFILE_UPDATE_FAILED', 400);
    }
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<string> {
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      throw new AppError('File size must be less than 5MB', 'FILE_TOO_LARGE', 400);
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new AppError('Invalid file type. Use JPEG, PNG, GIF, or WebP', 'INVALID_FILE_TYPE', 400);
    }
    
    try {
      const avatarUrl = await boomApi.uploadAvatar(file);
      return avatarUrl;
    } catch (error) {
      throw new AppError('Failed to upload avatar', 'AVATAR_UPLOAD_FAILED', 400);
    }
  }

  // Update preferences
  async updatePreferences(preferences: Partial<User['preferences']>): Promise<User> {
    try {
      const updatedUser = await boomApi.updatePreferences(preferences);
      
      // Update language in localStorage if changed
      if (preferences.language) {
        localStorage.setItem('language', preferences.language);
      }
      
      return updatedUser;
    } catch (error) {
      throw new AppError('Failed to update preferences', 'PREFERENCES_UPDATE_FAILED', 400);
    }
  }

  // Get user statistics
  async getUserStats(forceRefresh: boolean = false): Promise<UserStats> {
    const now = Date.now();
    
    // Return cached stats if available and not expired
    if (!forceRefresh && 
        this.userStatsCache && 
        (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.userStatsCache;
    }
    
    try {
      const stats = await boomApi.getUserStats();
      
      // Update cache
      this.userStatsCache = stats;
      this.cacheTimestamp = now;
      
      return stats;
    } catch (error) {
      throw new AppError('Failed to load statistics', 'STATS_LOAD_FAILED', 400);
    }
  }

  // Get user transactions
  async getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    partnerId?: string;
    status?: string;
  }): Promise<Transaction[]> {
    try {
      return await boomApi.getTransactions(filters);
    } catch (error) {
      throw new AppError('Failed to load transactions', 'TRANSACTIONS_LOAD_FAILED', 400);
    }
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      return await boomApi.getActivities(limit);
    } catch (error) {
      console.error('Failed to load activities:', error);
      return [];
    }
  }

  // Get achievements
  async getAchievements(forceRefresh: boolean = false): Promise<Achievement[]> {
    if (!forceRefresh && this.achievementsCache) {
      return this.achievementsCache;
    }
    
    try {
      const achievements = await boomApi.getAchievements();
      this.achievementsCache = achievements;
      return achievements;
    } catch (error) {
      console.error('Failed to load achievements:', error);
      return [];
    }
  }

  // Get QR code
  async getQRCode(forceRefresh: boolean = false): Promise<QRCodeData> {
    if (!forceRefresh && this.qrCodeCache) {
      return this.qrCodeCache;
    }
    
    try {
      const qrCode = await boomApi.getQRCode();
      this.qrCodeCache = qrCode;
      return qrCode;
    } catch (error) {
      throw new AppError('Failed to load QR code', 'QR_LOAD_FAILED', 400);
    }
  }

  // Regenerate QR code
  async regenerateQRCode(): Promise<QRCodeData> {
    try {
      const qrCode = await boomApi.regenerateQRCode();
      this.qrCodeCache = qrCode;
      return qrCode;
    } catch (error) {
      throw new AppError('Failed to regenerate QR code', 'QR_REGENERATE_FAILED', 400);
    }
  }

  // Get connected accounts
  async getConnectedAccounts(forceRefresh: boolean = false): Promise<ConnectedAccount[]> {
    if (!forceRefresh && this.connectedAccountsCache) {
      return this.connectedAccountsCache;
    }
    
    try {
      const accounts = await boomApi.getConnectedAccounts();
      this.connectedAccountsCache = accounts;
      return accounts;
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
      return [];
    }
  }

  // Calculate user level based on activity
  calculateUserLevel(stats: UserStats): {
    level: number;
    progress: number;
    nextLevelPoints: number;
  } {
    // Simple level calculation based on points
    const pointsPerLevel = 1000;
    const level = Math.floor(stats.pointsBalance / pointsPerLevel) + 1;
    const currentLevelPoints = (level - 1) * pointsPerLevel;
    const nextLevelPoints = level * pointsPerLevel;
    const progress = ((stats.pointsBalance - currentLevelPoints) / pointsPerLevel) * 100;
    
    return {
      level,
      progress,
      nextLevelPoints
    };
  }

  // Get savings summary
  async getSavingsSummary(): Promise<{
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    total: number;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    
    try {
      const [stats, transactions] = await Promise.all([
        this.getUserStats(),
        this.getTransactions({ status: 'completed' })
      ]);
      
      // Calculate savings for different periods
      let today = 0, thisWeek = 0, thisMonth = 0, thisYear = 0;
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.timestamp);
        const savings = transaction.savings;
        
        if (date >= todayStart) today += savings;
        if (date >= weekStart) thisWeek += savings;
        if (date >= monthStart) thisMonth += savings;
        if (date >= yearStart) thisYear += savings;
      });
      
      return {
        today,
        thisWeek,
        thisMonth,
        thisYear,
        total: stats.totalSavings
      };
    } catch (error) {
      console.error('Failed to calculate savings summary:', error);
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        thisYear: 0,
        total: 0
      };
    }
  }

  // Get activity insights
  async getActivityInsights(): Promise<{
    mostVisitedCategory: string;
    averageDiscount: number;
    peakVisitTime: string;
    favoriteLocation: string;
  }> {
    try {
      const [stats, transactions] = await Promise.all([
        this.getUserStats(),
        this.getTransactions({ status: 'completed' })
      ]);
      
      // Analyze transactions for insights
      const categoryCount: Record<string, number> = {};
      const locationCount: Record<string, number> = {};
      const hourCount: Record<number, number> = {};
      
      transactions.forEach(transaction => {
        // This would need partner details for full analysis
        // For now, return basic stats
        const hour = new Date(transaction.timestamp).getHours();
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      });
      
      // Find peak hour
      let peakHour = 12;
      let maxCount = 0;
      Object.entries(hourCount).forEach(([hour, count]) => {
        if (count > maxCount) {
          maxCount = count;
          peakHour = parseInt(hour);
        }
      });
      
      return {
        mostVisitedCategory: stats.favoriteCategory || 'Restaurants',
        averageDiscount: stats.averageDiscount || 15,
        peakVisitTime: `${peakHour}:00 - ${peakHour + 1}:00`,
        favoriteLocation: 'Sofia' // Would be calculated from transactions
      };
    } catch (error) {
      console.error('Failed to get activity insights:', error);
      return {
        mostVisitedCategory: 'Unknown',
        averageDiscount: 0,
        peakVisitTime: 'Unknown',
        favoriteLocation: 'Unknown'
      };
    }
  }

  // Clear all caches
  clearCache(): void {
    this.userStatsCache = null;
    this.achievementsCache = null;
    this.qrCodeCache = null;
    this.connectedAccountsCache = null;
    this.cacheTimestamp = 0;
  }
}

// Export singleton instance
export const userService = new UserService();

// Export the class for testing
export default UserService;