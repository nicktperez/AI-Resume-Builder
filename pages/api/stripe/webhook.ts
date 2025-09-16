import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { prisma } from '../../../lib/prisma';

export const config = {
  api: {
    bodyParser: false
  }
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' }) : null;

export default async function stripeWebhookRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }

  if (!stripe || !webhookSecret) {
    return res.status(500).end('Stripe webhook is not configured');
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).send('Missing Stripe signature');
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed', error);
    return res.status(400).send('Webhook Error: Signature verification failed');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              stripeCustomerId: session.customer?.toString() ?? undefined,
              stripeSubscriptionId: session.subscription?.toString() ?? undefined
            }
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPro: false,
              stripeSubscriptionId: null
            }
          });
        }
        break;
      }
      default: {
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handling failed', error);
    res.status(500).send('Webhook handler failed');
  }
}
