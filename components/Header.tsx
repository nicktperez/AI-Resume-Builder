import Link from 'next/link';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to load session');
  }
  return res.json();
};

interface SessionResponse {
  user: {
    email: string;
    isPro: boolean;
  } | null;
}

export default function Header() {
  const { data } = useSWR<SessionResponse>('/api/me', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  });

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/">
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>AI Resume Tailor</span>
        </Link>
        <nav className="nav-links">
          {data?.user ? (
            <>
              <span className="badge">
                {data.user.isPro ? 'Pro Member' : 'Free Tier'}
              </span>
              <Link href="/dashboard">Dashboard</Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="primary" style={{ padding: '0.5rem 1.25rem' }}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/register">
                <button type="button" className="primary" style={{ padding: '0.5rem 1.25rem' }}>
                  Get started
                </button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
