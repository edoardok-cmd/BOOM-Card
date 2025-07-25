import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  status: string;
  timestamp: string;
  services: {
    frontend: string;
    backend: string;
    database: string;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      frontend: 'running',
      backend: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002/api',
      database: 'connected'
    }
  });
}