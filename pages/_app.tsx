import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import '../styles/globals.css';
import { injectCriticalCSS } from '../lib/criticalCSS';
import ErrorBoundary from '../components/ErrorBoundary';

// Initialize Sentry
if (typeof window !== 'undefined') {
  import('../lib/sentry');
}

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Inject critical CSS for better performance
    injectCriticalCSS();
  }, []);

  return (
    <ErrorBoundary>
      <Head>
        <title>AI Resume Tailor</title>
        <meta
          name="description"
          content="Tailor your resume to any job instantly with AI resume rewriting."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </Head>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
