import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

// Extend NextApiRequest to include session
export interface NextApiRequestWithSession extends NextApiRequest {
  session: {
    userId?: string;
    destroy: () => Promise<void>;
    save: () => Promise<void>;
  };
}

type Handler<T = any> = NextApiHandler<T>;

export function withSessionRoute(handler: (req: NextApiRequestWithSession, res: NextApiResponse) => Promise<any>) {
  return handler as Handler;
}
