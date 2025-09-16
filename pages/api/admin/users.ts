import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { withSessionRoute, NextApiRequestWithSession } from '../../../lib/withSession';
import { withAdminAuth } from '../../../lib/adminAuth';

export default withSessionRoute(withAdminAuth(async function usersRoute(
  req: NextApiRequestWithSession,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          isPro: true,
          resumeCount: true,
          createdAt: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          _count: {
            select: {
              generations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { userId, isPro } = req.body;

      if (!userId || typeof isPro !== 'boolean') {
        return res.status(400).json({ error: 'userId and isPro are required' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isPro },
        select: {
          id: true,
          email: true,
          name: true,
          isPro: true,
          resumeCount: true,
          createdAt: true,
          _count: {
            select: {
              generations: true
            }
          }
        }
      });

      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ error: 'Method not allowed' });
}));
