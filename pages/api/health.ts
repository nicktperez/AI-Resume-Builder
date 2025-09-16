import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { setSecurityHeaders } from '../../lib/security';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    openai: 'up' | 'down';
    cache: 'up' | 'down';
  };
  uptime: number;
  version: string;
}

export default async function healthCheck(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse | { error: string }>
) {
  // Set security headers
  setSecurityHeaders(res);

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  // Check database connectivity
  let databaseStatus: 'up' | 'down' = 'down';
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'up';
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // Check OpenAI API key
  const openaiStatus: 'up' | 'down' = process.env.OPENAI_API_KEY ? 'up' : 'down';

  // Check cache (always up for in-memory cache)
  const cacheStatus: 'up' | 'down' = 'up';

  const overallStatus = databaseStatus === 'up' && openaiStatus === 'up' ? 'healthy' : 'unhealthy';

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp,
    services: {
      database: databaseStatus,
      openai: openaiStatus,
      cache: cacheStatus,
    },
    uptime: Math.floor(uptime),
    version: process.env.npm_package_version || '1.0.0',
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(response);
}
