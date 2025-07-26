import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      categories: [
        { id: 'restaurants', name: 'Restaurants', count: 87 },
        { id: 'hotels', name: 'Hotels', count: 42 },
        { id: 'wellness', name: 'Wellness & Spa', count: 35 },
        { id: 'entertainment', name: 'Entertainment', count: 28 },
        { id: 'shopping', name: 'Shopping', count: 56 },
        { id: 'services', name: 'Services', count: 31 },
        { id: 'education', name: 'Education', count: 19 },
        { id: 'travel', name: 'Travel', count: 23 }
      ]
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}