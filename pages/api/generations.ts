import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { withSessionRoute } from '../../lib/withSession';

export default withSessionRoute(async function generationsRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const generations = await prisma.resumeGeneration.findMany({
    where: { userId: req.session.userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return res.status(200).json({ generations });
});
