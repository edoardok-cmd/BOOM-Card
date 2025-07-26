import type { NextApiRequest, NextApiResponse } from 'next'

// Force dynamic rendering by creating an API route
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
}

// Export runtime config to force server-side rendering
export const config = {
  runtime: 'nodejs',
}