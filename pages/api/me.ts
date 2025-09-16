import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { withSessionRoute } from '../../lib/withSession';

export default withSessionRoute(async function meRoute(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session.userId) {
    return res.status(200).json({ user: null });
  }

  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user) {
    await req.session.destroy();
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      isPro: user.isPro,
      resumeCount: user.resumeCount
    }
  });
});
