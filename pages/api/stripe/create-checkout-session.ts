import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { prisma } from '../../../lib/prisma';
import { withSessionRoute, NextApiRequestWithSession } from '../../../lib/withSession';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceId = process.env.STRIPE_PRICE_ID;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' }) : null;

export default withSessionRoute(async function createCheckoutSessionRoute(
  req: NextApiRequestWithSession,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!stripe || !stripePriceId) {
    return res.status(500).json({ error: 'Stripe is not configured.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user) {
    await req.session.destroy();
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: stripePriceId,
          quantity: 1
        }
      ],
      metadata: {
        userId: user.id
      },
      success_url: `${baseUrl}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/stripe/cancel`,
      customer_email: user.email,
      client_reference_id: user.id
    });

    if (!session.url) {
      return res.status(500).json({ error: 'Stripe did not return a checkout URL.' });
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error', error);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
});
