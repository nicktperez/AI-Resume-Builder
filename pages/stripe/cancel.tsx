import Link from 'next/link';
import Header from '../../components/Header';

export default function StripeCancelPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: '4rem 0 6rem', textAlign: 'center' }}>
        <div className="card" style={{ margin: '0 auto', maxWidth: '520px' }}>
          <h1>Checkout cancelled</h1>
          <p style={{ color: 'var(--muted)' }}>
            No worries—your account is still on the free plan. You can continue tailoring up to two
            resumes or upgrade when you&apos;re ready.
          </p>
          <Link href="/dashboard">
            <button className="primary" type="button">
              Back to dashboard
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
