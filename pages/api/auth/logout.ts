import type { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute, NextApiRequestWithSession } from '../../../lib/withSession';

export default withSessionRoute(async function logoutRoute(
  req: NextApiRequestWithSession,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await req.session.destroy();
  res.redirect(302, '/');
});
