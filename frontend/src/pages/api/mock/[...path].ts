import type { NextApiRequest, NextApiResponse } from 'next';

// Mock API handler for development/demo purposes
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path;

  // Mock responses for different endpoints
  switch (endpoint) {
    case 'health':
      res.status(200).json({ status: 'ok', message: 'Mock API is running' });
      break;
      
    case 'auth/login':
      res.status(200).json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'demo@boomcard.bg',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user'
        }
      });
      break;
      
    case 'users/profile':
      res.status(200).json({
        id: '1',
        email: 'demo@boomcard.bg',
        firstName: 'Demo',
        lastName: 'User',
        memberSince: '2024-01-01',
        totalSaved: 1847,
        visitsThisYear: 42
      });
      break;
      
    case 'qr/membership':
      res.status(200).json({
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        membershipNumber: 'BC-2024-DEMO'
      });
      break;
      
    case 'users/activity':
      res.status(200).json({
        activities: [
          {
            id: 1,
            partner: 'The Sofia Grand',
            category: 'Fine Dining',
            saved: 67,
            discount: 30,
            date: '2024-01-20'
          }
        ]
      });
      break;
      
    case 'users/stats':
      res.status(200).json({
        totalSaved: 1847,
        visitsThisYear: 42,
        averageSavings: 154,
        favoriteCategory: 'Fine Dining'
      });
      break;
      
    default:
      res.status(404).json({ error: 'Mock endpoint not found' });
  }
}