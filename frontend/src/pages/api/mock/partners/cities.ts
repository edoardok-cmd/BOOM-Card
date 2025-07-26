import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      cities: [
        { id: 'sofia', name: 'Sofia', count: 145 },
        { id: 'plovdiv', name: 'Plovdiv', count: 67 },
        { id: 'varna', name: 'Varna', count: 58 },
        { id: 'burgas', name: 'Burgas', count: 43 },
        { id: 'ruse', name: 'Ruse', count: 21 },
        { id: 'stara-zagora', name: 'Stara Zagora', count: 18 },
        { id: 'pleven', name: 'Pleven', count: 15 },
        { id: 'veliko-tarnovo', name: 'Veliko Tarnovo', count: 12 }
      ]
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}