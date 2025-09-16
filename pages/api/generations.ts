import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { withSessionRoute } from '../../lib/withSession';

interface StoredInsights {
  matchedKeywords?: string[];
  missingSkills?: string[];
  suggestedImprovements?: string[];
}

const parseInsights = (value: string | null): StoredInsights | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed as StoredInsights;
    }
  } catch (error) {
    console.warn('Failed to parse stored insights', error);
  }

  return null;
};

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

  const formatted = generations.map((generation) => ({
    ...generation,
    insights: parseInsights(generation.insights)
  }));

  return res.status(200).json({ generations: formatted });
});
