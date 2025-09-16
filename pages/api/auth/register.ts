import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';
import { withSessionRoute, NextApiRequestWithSession } from '../../../lib/withSession';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

export default withSessionRoute(async function registerRoute(
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

  const { email, password, name } = parse.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name
    }
  });

  req.session.userId = user.id;
  await req.session.save();

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      isPro: user.isPro,
      resumeCount: user.resumeCount
    }
  });
});
