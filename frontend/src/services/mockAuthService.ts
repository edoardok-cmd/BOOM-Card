import { User } from '../types';

// Mock users database
const mockUsers = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+359 88 123 4567',
    membershipType: 'premium' as const,
    membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    points: 1250,
    totalSavings: 456.78,
    discountsUsed: 23,
    favoritePartners: ['1', '3', '5']
  },
  {
    id: '2',
    email: 'admin@boomcard.bg',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+359 88 999 8888',
    membershipType: 'vip' as const,
    membershipExpiry: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years from now
    joinedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    points: 5000,
    totalSavings: 2345.67,
    discountsUsed: 156,
    favoritePartners: ['1', '2', '3', '4', '5']
  }
];

export const mockAuthService = {
  async login(credentials: { email: string; password: string }) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate mock tokens
    const accessToken = btoa(JSON.stringify({ userId: user.id, email: user.email }));
    const refreshToken = btoa(JSON.stringify({ userId: user.id, type: 'refresh' }));

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  },

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    if (mockUsers.find(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      ...data,
      membershipType: 'standard' as const,
      membershipExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
      joinedDate: new Date().toISOString(),
      points: 0,
      totalSavings: 0,
      discountsUsed: 0,
      favoritePartners: []
    };

    mockUsers.push(newUser);

    // Generate mock tokens
    const accessToken = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email }));
    const refreshToken = btoa(JSON.stringify({ userId: newUser.id, type: 'refresh' }));

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword as User,
      tokens: {
        accessToken,
        refreshToken
      }
    };
  },

  async logout() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  async refreshToken(refreshToken: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const decoded = JSON.parse(atob(refreshToken));
      const user = mockUsers.find(u => u.id === decoded.userId);
      
      if (!user) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = btoa(JSON.stringify({ userId: user.id, email: user.email }));

      return {
        accessToken,
        refreshToken // Return same refresh token for simplicity
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  },

  async getCurrentUser(token: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const decoded = JSON.parse(atob(token));
      const user = mockUsers.find(u => u.id === decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};

// Export mock credentials for easy testing
export const MOCK_CREDENTIALS = {
  regular: {
    email: 'test@example.com',
    password: 'Test123!'
  },
  admin: {
    email: 'admin@boomcard.bg',
    password: 'Admin123!'
  }
};