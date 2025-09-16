import { withIronSessionApiRoute } from 'iron-session/next';
import type { NextApiHandler } from 'next';
import { sessionOptions } from './session';

type Handler<T = any> = NextApiHandler<T>;

export function withSessionRoute(handler: Handler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}
