import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.clean';

const router = Router();

// Get user activity (mock data for now)
router.get('/activity', authenticateToken, (req: any, res: any) => {
  // Mock activity data
  const activities = [
    {
      id: 1,
      partner: 'The Sofia Grand',
      category: 'Fine Dining',
      icon: '🍽️',
      saved: 67,
      discount: 30,
      date: '2 days ago',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 2,
      partner: 'Emerald Resort & Spa',
      category: 'Luxury Hotels',
      icon: '🏨',
      saved: 180,
      discount: 40,
      date: '5 days ago',
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-50'
    }
  ];

  res.json({
    success: true,
    data: activities
  });
});

// Get user favorites (mock data for now)
router.get('/favorites', authenticateToken, (req: any, res: any) => {
  const favorites = [
    {
      name: 'The Sofia Grand',
      slug: 'sofia-grand',
      icon: '🍽️',
      visits: 12,
      totalSaved: 420,
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Coffee Central',
      slug: 'coffee-central',
      icon: '☕',
      visits: 28,
      totalSaved: 168,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50'
    }
  ];

  res.json({
    success: true,
    data: favorites
  });
});

// Get user achievements (mock data for now)
router.get('/achievements', authenticateToken, (req: any, res: any) => {
  const achievements = [
    {
      category: 'savings',
      titleKey: 'Savings Champion',
      descriptionKey: 'Saved over €1000',
      icon: '🏆',
      earned: true,
      progress: 100
    },
    {
      category: 'exploration',
      titleKey: 'Explorer',
      descriptionKey: 'Visited 50+ partners',
      icon: '🌍',
      earned: true,
      progress: 100
    },
    {
      category: 'vip',
      titleKey: 'VIP Member',
      descriptionKey: 'Reach VIP status',
      icon: '👑',
      earned: false,
      progress: 75
    }
  ];

  res.json({
    success: true,
    data: achievements
  });
});

// Get user statistics (mock data for now)
router.get('/stats', authenticateToken, (req: any, res: any) => {
  const stats = {
    totalSaved: 1847,
    visitsThisYear: 52
  };

  res.json({
    success: true,
    data: stats
  });
});

// Download user data (GDPR compliance)
router.get('/download-data', authenticateToken, (req: any, res: any) => {
  const userData = {
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      membershipType: req.user.membershipType,
      joinDate: '2024-01-15T10:30:00Z',
      lastLogin: new Date().toISOString()
    },
    activity: [
      {
        id: 1,
        partner: 'The Sofia Grand',
        category: 'Fine Dining',
        discount: 30,
        saved: 67,
        date: '2024-07-20T19:30:00Z'
      },
      {
        id: 2,
        partner: 'Emerald Resort & Spa',
        category: 'Luxury Hotels',
        discount: 40,
        saved: 180,
        date: '2024-07-18T14:20:00Z'
      }
    ],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      language: 'en',
      currency: 'EUR'
    },
    exportDate: new Date().toISOString(),
    exportVersion: '1.0'
  };

  // Set headers for file download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="boom-card-data-${req.user.id}-${new Date().toISOString().split('T')[0]}.json"`);
  
  res.json(userData);
});

// Delete account
router.delete('/account', authenticateToken, (req: any, res: any) => {
  // In a real implementation, this would:
  // 1. Mark account for deletion (soft delete)
  // 2. Schedule data cleanup
  // 3. Send confirmation email
  // 4. Revoke all tokens
  
  res.json({
    success: true,
    message: 'Account deletion request submitted. Your account will be permanently deleted within 30 days. You can cancel this request by logging in again.',
    deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
});

// Get connected social accounts
router.get('/connected-accounts', authenticateToken, (req: any, res: any) => {
  // Mock connected accounts data
  const connectedAccounts = {
    facebook: {
      connected: false,
      userId: null,
      connectedAt: null
    },
    instagram: {
      connected: false,
      userId: null,
      connectedAt: null
    },
    google: {
      connected: true,
      userId: 'google_user_123',
      connectedAt: '2024-01-15T10:30:00Z'
    }
  };

  res.json({
    success: true,
    data: connectedAccounts
  });
});

// Connect social account
router.post('/connect-social', authenticateToken, (req: any, res: any) => {
  const { provider } = req.body;
  
  if (!provider || !['facebook', 'instagram', 'google'].includes(provider)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid provider. Supported providers: facebook, instagram, google'
    });
  }

  // In a real implementation, this would:
  // 1. Redirect to OAuth provider
  // 2. Handle OAuth callback
  // 3. Store connection in database
  
  res.json({
    success: true,
    message: `${provider} account connected successfully`,
    data: {
      provider,
      connected: true,
      connectedAt: new Date().toISOString()
    }
  });
});

// Disconnect social account
router.delete('/disconnect-social/:provider', authenticateToken, (req: any, res: any) => {
  const { provider } = req.params;
  
  if (!provider || !['facebook', 'instagram', 'google'].includes(provider)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid provider. Supported providers: facebook, instagram, google'
    });
  }

  res.json({
    success: true,
    message: `${provider} account disconnected successfully`,
    data: {
      provider,
      connected: false,
      disconnectedAt: new Date().toISOString()
    }
  });
});

// Health check for users service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Users service is healthy',
    timestamp: new Date().toISOString(),
    service: 'users'
  });
});

export default router;