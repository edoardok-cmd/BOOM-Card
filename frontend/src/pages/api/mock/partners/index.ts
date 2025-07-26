import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { page = 1, limit = 6 } = req.query;
    
    const allPartners = [
      {
        id: '1',
        name: 'Grand Hotel Sofia',
        category: 'Hotels',
        discount: 30,
        logoUrl: '/images/partners/hotel-1.svg',
        rating: 4.8,
        location: 'Sofia',
        description: 'Luxury 5-star hotel in the heart of Sofia'
      },
      {
        id: '2',
        name: 'Restaurant Panorama',
        category: 'Restaurants',
        discount: 25,
        logoUrl: '/images/partners/restaurant-1.svg',
        rating: 4.6,
        location: 'Sofia',
        description: 'Fine dining with stunning city views'
      },
      {
        id: '3',
        name: 'Spa Wellness Center',
        category: 'Wellness',
        discount: 40,
        logoUrl: '/images/partners/spa-1.svg',
        rating: 4.9,
        location: 'Sofia',
        description: 'Premium spa and wellness treatments'
      },
      {
        id: '4',
        name: 'Cinema City',
        category: 'Entertainment',
        discount: 20,
        logoUrl: '/images/partners/cinema-1.svg',
        rating: 4.5,
        location: 'Sofia',
        description: 'Latest movies in premium theaters'
      },
      {
        id: '5',
        name: 'Fashion Mall',
        category: 'Shopping',
        discount: 15,
        logoUrl: '/images/partners/shopping-1.svg',
        rating: 4.4,
        location: 'Sofia',
        description: 'Premium brands and exclusive collections'
      },
      {
        id: '6',
        name: 'Fitness Plus',
        category: 'Wellness',
        discount: 35,
        logoUrl: '/images/partners/fitness-1.svg',
        rating: 4.7,
        location: 'Sofia',
        description: 'Modern gym with personal trainers'
      }
    ];
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    res.status(200).json({
      partners: allPartners.slice(startIndex, endIndex),
      total: allPartners.length,
      page: pageNum,
      totalPages: Math.ceil(allPartners.length / limitNum)
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}