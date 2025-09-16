import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { verifyPassword } from '../../../lib/auth';
import { withSessionRoute, NextApiRequestWithSession } from '../../../lib/withSession';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export default withSessionRoute(async function loginRoute(
  req: NextApiRequestWithSession,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { email, password } = parse.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  req.session.email = user.email;
  await req.session.save();

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      isPro: user.isPro,
      resumeCount: user.resumeCount
    }
  });
});
