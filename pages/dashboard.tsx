import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Header from '../components/Header';
import GenerationForm from '../components/GenerationForm';
import GenerationHistory from '../components/GenerationHistory';

interface SessionResponse {
  user: {
    id: string;
    email: string;
    isPro: boolean;
    resumeCount: number;
  } | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to load session');
  }
  return res.json();
};

export default function DashboardPage() {
  const { data, error, mutate } = useSWR<SessionResponse>('/api/me', fetcher, {
    revalidateOnFocus: false
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (error) {
      window.location.href = '/login';
    }
  }, [error]);

  useEffect(() => {
    if (data && !data.user) {
      window.location.href = '/login';
    }
  }, [data]);

  if (!data?.user) {
    return null;
  }

  const remaining = Math.max(0, 2 - data.user.resumeCount);

  const handleGenerated = () => {
    mutate();
    setRefreshKey((value) => value + 1);
  };

  const handleUpgrade = async () => {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST'
    });
    if (!response.ok) {
      alert('Unable to start checkout. Please try again later.');
      return;
    }
    const data = await response.json();
    window.location.href = data.url;
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '3rem 0 5rem', display: 'grid', gap: '2rem' }}>
        <section>
          <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, {data.user.email}</h1>
          <p style={{ color: 'var(--muted)' }}>
            {data.user.isPro
              ? 'You have unlimited tailored resumes with your Pro membership.'
              : `You can tailor ${remaining} more resume${remaining === 1 ? '' : 's'} for free.`}
          </p>
          {!data.user.isPro && (
            <button className="primary" type="button" style={{ marginTop: '1rem' }} onClick={handleUpgrade}>
              Upgrade to Pro for unlimited resumes
            </button>
          )}
        </section>

        <GenerationForm isPro={data.user.isPro} remaining={remaining} onGenerated={handleGenerated} />

        <GenerationHistory refreshKey={refreshKey} />
      </main>
    </>
  );
}
