import * as Sentry from '@sentry/nextjs';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  beforeSend(event) {
    // Filter out non-error events in production
    if (process.env.NODE_ENV === 'production' && event.level !== 'error') {
      return null;
    }
    return event;
  },
});

export default Sentry;
