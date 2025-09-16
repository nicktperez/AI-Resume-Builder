import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withSessionRoute, NextApiRequestWithSession } from '../../../lib/withSession';
import { withAdminAuth } from '../../../lib/adminAuth';

export default withSessionRoute(withAdminAuth(async function statsRoute(
  req: NextApiRequestWithSession,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [
      totalUsers,
      proUsers,
      freeUsers,
      totalGenerations,
      recentUsers,
      recentGenerations
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isPro: true } }),
      prisma.user.count({ where: { isPro: false } }),
      prisma.resumeGeneration.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.resumeGeneration.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      proUsers,
      freeUsers,
      totalGenerations,
      recentUsers,
      recentGenerations,
      conversionRate: totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0,
      avgGenerationsPerUser: totalUsers > 0 ? totalGenerations / totalUsers : 0
    };

    return res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}));
