import type { NextApiRequest, NextApiResponse } from 'next';


  timestamp;
  services;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services
  });
}