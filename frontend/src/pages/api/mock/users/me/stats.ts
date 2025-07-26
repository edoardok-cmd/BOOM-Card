import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      totalSavings: 2847.50,
      monthlySavings: 347.25,
      discountsUsed: 42,
      monthlyDiscounts: 8,
      favoritePartners: 12,
      memberSince: '2023-01-15',
      totalTransactions: 127,
      monthlyTransactions: 15
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}