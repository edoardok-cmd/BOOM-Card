import { apiService } from './api';
import { User, Card, PaginatedResponse } from './api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  updates: boolean;
  reminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
}

export interface UserStats {
  totalCards: number;
  totalSavings: number;
  totalTransactions: number;
  memberSince: string;
  lastActive: string;
}

class UserService {
  async getCurrentUser(): Promise<User> {
    const response = await apiService.getCurrentUser();
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user');
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update profile');
  }

  async uploadAvatar(file: File): Promise<string> {
    
    if (response.success && response.data) {
      return response.data.url;
    }
    
    throw new Error(response.error || 'Failed to upload avatar');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
      currentPassword,
      newPassword
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }

  async getUserStats(): Promise<UserStats> {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user stats');
  }

  async getUserCards(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }): Promise<PaginatedResponse<Card>> {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user cards');
  }

  async getFavoritePartners(): Promise<Partner[]> {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch favorite partners');
  }

  async addFavoritePartner(partnerId: string): Promise<void> {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to add favorite');
    }

  async removeFavoritePartner(partnerId: string): Promise<void> {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove favorite');
    }

  async getNotificationSettings(): Promise<NotificationSettings> {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch notification settings');
  }

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update notification settings');
    }

  async deleteAccount(password: string): Promise<void> {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete account');
    }

  async exportUserData(): Promise<Blob> {
      responseType: 'blob'
    });
    
    if (response.success && response.data) {
      return response.data as Blob;
    }
    
    throw new Error(response.error || 'Failed to export user data');
  }

// Export singleton instance
export const userService = new UserService();

// Export the class for testing
export default UserService;

}
}
}
}
