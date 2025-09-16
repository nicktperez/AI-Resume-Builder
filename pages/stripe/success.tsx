import Link from 'next/link';
import Header from '../../components/Header';

export default function StripeSuccessPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: '4rem 0 6rem', textAlign: 'center' }}>
        <div className="card" style={{ margin: '0 auto', maxWidth: '520px' }}>
          <h1>Welcome to Pro!</h1>
          <p style={{ color: 'var(--muted)' }}>
            Your payment was successful. We&apos;ve upgraded your account to Pro so you can tailor
            unlimited resumes.
          </p>
          <Link href="/dashboard">
            <button className="primary" type="button">
              Return to dashboard
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
