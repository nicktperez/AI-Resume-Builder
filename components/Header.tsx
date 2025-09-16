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

  const isAuthenticated = Boolean(data?.user);
  const isPro = Boolean(data?.user?.isPro);

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/">
          <span className="brand">AI Resume Tailor</span>
        </Link>
        <nav className="nav-links">
          <Link href="/#features">Features</Link>
          <Link href="/#testimonials">Testimonials</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/#comparison">Compare</Link>
          {isAuthenticated ? (
            <Link href="/dashboard">Workspace</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className={`badge ${isPro ? 'badge-pro' : 'badge-neutral'}`}>
                {isPro ? 'Pro Member' : 'Free Tier'}
              </span>
              <Link
                href={isPro ? '/dashboard' : '/#pricing'}
                className={`cta-pro ${isPro ? 'cta-pro--active' : ''}`}
              >
                {isPro ? 'View Pro perks' : 'Upgrade to Pro'}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="ghost-button">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/register">
                <button type="button" className="primary">
                  Start for free
                </button>
              </Link>
              <Link href="/#pricing" className="cta-pro">
                Explore Pro
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
