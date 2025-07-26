import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({
      plans: [
        {
          id: 'basic',
          name: 'Basic',
          price: 0,
          interval: 'month',
          features: [
            'Access to 50+ partners',
            'Up to 15% discounts',
            'Email support'
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          price: 19.99,
          interval: 'month',
          features: [
            'Access to 200+ partners',
            'Up to 30% discounts',
            'Priority support',
            'Exclusive deals',
            'Early access to new partners'
          ],
          popular: true
        },
        {
          id: 'vip',
          name: 'VIP',
          price: 49.99,
          interval: 'month',
          features: [
            'Access to all partners',
            'Up to 50% discounts',
            '24/7 VIP support',
            'Exclusive VIP events',
            'Personal account manager',
            'Custom deals negotiation'
          ]
        }
      ]
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}