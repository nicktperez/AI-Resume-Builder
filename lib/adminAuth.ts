import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithSession } from './withSession';

// Admin email - you can change this to your actual email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';

export function isAdmin(req: NextApiRequestWithSession): boolean {
  // Check if user is logged in and has admin email
  return !!(req.session.userId && req.session.email === ADMIN_EMAIL);
}

export function requireAdmin(req: NextApiRequestWithSession, res: NextApiResponse): boolean {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }
  
  if (!isAdmin(req)) {
    res.status(403).json({ error: 'Admin access required' });
    return false;
  }
  
  return true;
}

export function withAdminAuth(handler: (req: NextApiRequestWithSession, res: NextApiResponse) => Promise<any>) {
  return async (req: NextApiRequestWithSession, res: NextApiResponse) => {
    if (!requireAdmin(req, res)) {
      return;
    }
    return handler(req, res);
  };
}
