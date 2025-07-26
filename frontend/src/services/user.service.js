import { apiService } from './api';

export 

export 

export 

export 

export 

class UserService {
  async getCurrentUser() {
    const response = await apiService.getCurrentUser();
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user');
  }

  async updateProfile(data: UpdateProfileData) {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update profile');
  }

  async uploadAvatar(file: File) {
    
    if (response.success && response.data) {
      return response.data.url;
    }
    
    throw new Error(response.error || 'Failed to upload avatar');
  }

  async changePassword(currentPassword, newPassword) {
      currentPassword,
      newPassword
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }

  async getUserStats() {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user stats');
  }

  async getUserCards(params?)> {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch user cards');
  }

  async getFavoritePartners() {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch favorite partners');
  }

  async addFavoritePartner(partnerId) {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to add favorite');
    }

  async removeFavoritePartner(partnerId) {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to remove favorite');
    }

  async getNotificationSettings() {
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch notification settings');
  }

  async updateNotificationSettings(settings: Partial) {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update notification settings');
    }

  async deleteAccount(password) {
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete account');
    }

  async exportUserData() {
      responseType: 'blob'
    });
    
    if (response.success && response.data) {
      return response.data;
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
