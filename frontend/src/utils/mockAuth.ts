// Mock authentication for static deployment
export const mockUsers = [
  {
    id: 'user1',
    email: 'edoardok@gmail.com',
    password: 'Test123!',
    firstName: 'Edoardo',
    lastName: 'K',
    phone: '+359888111111',
    membershipType: 'premium',
    membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    discountsUsed: 5,
    totalSavings: 150.75
  },
  {
    id: 'user2',
    email: 'radoslav.tashev@gmail.com',
    password: 'Test123!',
    firstName: 'Radoslav',
    lastName: 'Tashev',
    phone: '+359888222222',
    membershipType: 'premium',
    membershipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    discountsUsed: 8,
    totalSavings: 225.50
  }
];

export const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = btoa(`${user.id}:${Date.now()}`);
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          membershipType: user.membershipType,
          phone: user.phone,
          membershipExpiry: user.membershipExpiry,
          discountsUsed: user.discountsUsed,
          totalSavings: user.totalSavings
        },
        token: token,
        tokens: {
          accessToken: token,
          refreshToken: token + '-refresh'
        }
      }
    };
  }
  
  throw new Error('Invalid credentials');
};

export const mockProfile = async (token: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const [userId] = atob(token).split(':');
    const user = mockUsers.find(u => u.id === userId);
    
    if (user) {
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          membershipType: user.membershipType,
          membershipExpiry: user.membershipExpiry,
          discountsUsed: user.discountsUsed,
          totalSavings: user.totalSavings,
          joinedDate: '2024-03-10',
          membershipStatus: 'active',
          avatarUrl: null,
          preferences: {
            notifications: true,
            newsletter: true,
            language: 'bg'
          }
        }
      };
    }
  } catch (e) {
    // Invalid token
  }
  
  throw new Error('Invalid token');
};