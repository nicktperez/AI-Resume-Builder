import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>AI Resume Tailor</title>
        <meta
          name="description"
          content="Tailor your resume to any job instantly with AI resume rewriting."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
