import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory rate limiter (for production, use Redis)
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;

  return (req: NextApiRequest, res: NextApiResponse): boolean => {
    const forwardedFor = req.headers['x-forwarded-for'];
    const key = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });

    // Get or create entry for this IP
    if (!store[key]) {
      store[key] = { count: 0, resetTime: now + windowMs };
    }

    const entry = store[key];

    // Reset if window has passed
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000));
      res.status(429).json({ error: message });
      return false;
    }

    // Increment counter
    entry.count++;
    return true;
  };
}

// Predefined rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again in 15 minutes.'
});

export const generateRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 generations per minute
  message: 'Too many generation requests, please wait a moment before trying again.'
});

export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.'
});
