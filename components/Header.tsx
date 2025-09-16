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
    <header className="header" role="banner">
      <div className="container header-inner">
        <Link href="/" aria-label="AI Resume Tailor - Home">
          <span className="brand">AI Resume Tailor</span>
        </Link>
        <nav className="nav-links" role="navigation" aria-label="Main navigation">
          <Link href="/#features" aria-label="View features">Features</Link>
          <Link href="/#testimonials" aria-label="Read testimonials">Testimonials</Link>
          <Link href="/#pricing" aria-label="View pricing plans">Pricing</Link>
          <Link href="/#comparison" aria-label="Compare with competitors">Compare</Link>
          {isAuthenticated ? (
            <Link href="/dashboard" aria-label="Go to workspace">Workspace</Link>
          ) : (
            <Link href="/login" aria-label="Sign in to your account">Login</Link>
          )}
        </nav>
        <div className="nav-actions" role="complementary" aria-label="User actions">
          {isAuthenticated ? (
            <>
              <span 
                className={`badge ${isPro ? 'badge-pro' : 'badge-neutral'}`}
                role="status"
                aria-label={`Account status: ${isPro ? 'Pro Member' : 'Free Tier'}`}
              >
                {isPro ? 'Pro Member' : 'Free Tier'}
              </span>
              <Link
                href={isPro ? '/dashboard' : '/#pricing'}
                className={`cta-pro ${isPro ? 'cta-pro--active' : ''}`}
                aria-label={isPro ? 'View Pro benefits' : 'Upgrade to Pro plan'}
              >
                {isPro ? 'View Pro perks' : 'Upgrade to Pro'}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button 
                  type="submit" 
                  className="ghost-button"
                  aria-label="Sign out of your account"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/register">
                <button 
                  type="button" 
                  className="primary"
                  aria-label="Create a free account"
                >
                  Start for free
                </button>
              </Link>
              <Link 
                href="/#pricing" 
                className="cta-pro"
                aria-label="Learn about Pro features"
              >
                Explore Pro
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
