export default function handler(req, res) {
  res.status(200).json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      database: 'operational',
      auth: 'operational'
    }
  });
}