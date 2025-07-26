import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      partners: [
        {
          id: '1',
          name: 'Grand Hotel Sofia',
          category: 'Hotels',
          discount: 30,
          logoUrl: '/images/partners/hotel-1.svg',
          rating: 4.8,
          location: 'Sofia'
        },
        {
          id: '2',
          name: 'Restaurant Panorama',
          category: 'Restaurants',
          discount: 25,
          logoUrl: '/images/partners/restaurant-1.svg',
          rating: 4.6,
          location: 'Sofia'
        },
        {
          id: '3',
          name: 'Spa Wellness Center',
          category: 'Wellness',
          discount: 40,
          logoUrl: '/images/partners/spa-1.svg',
          rating: 4.9,
          location: 'Sofia'
        },
        {
          id: '4',
          name: 'Cinema City',
          category: 'Entertainment',
          discount: 20,
          logoUrl: '/images/partners/cinema-1.svg',
          rating: 4.5,
          location: 'Sofia'
        }
      ]
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}