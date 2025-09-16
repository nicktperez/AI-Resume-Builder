import Link from 'next/link';
import Header from '../components/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="container" style={{ maxWidth: '720px' }}>
            <div className="badge" style={{ margin: '0 auto 1.5rem', justifyContent: 'center' }}>
              AI-powered matching • ATS friendly
            </div>
            <h1>Instantly tailor your resume to any job description.</h1>
            <p>
              Paste a job posting and your resume. AI Resume Tailor rewrites your experience to match
              the role&apos;s keywords, tone, and required skills—all in seconds.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/register">
                <button className="primary" type="button">
                  Start for free
                </button>
              </Link>
              <Link href="/login">See dashboard</Link>
            </div>
          </div>
        </section>

        <section style={{ paddingBottom: '4rem' }}>
          <div className="container grid grid-2">
            <div className="card">
              <h3>Smart keyword alignment</h3>
              <p style={{ color: 'var(--muted)' }}>
                We analyse the job description, highlight critical keywords, and ensure your resume
                mirrors the required tone and skills.
              </p>
            </div>
            <div className="card">
              <h3>Freemium friendly</h3>
              <p style={{ color: 'var(--muted)' }}>
                Tailor two resumes on the free plan. When you&apos;re ready for unlimited rewrites, upgrade
                with a single click powered by Stripe Checkout.
              </p>
            </div>
            <div className="card">
              <h3>Privacy-first history</h3>
              <p style={{ color: 'var(--muted)' }}>
                Your tailored resumes are stored securely so you can revisit and export your favourite
                versions anytime.
              </p>
            </div>
            <div className="card">
              <h3>Built for speed</h3>
              <p style={{ color: 'var(--muted)' }}>
                Our serverless architecture pairs OpenAI text generation with Next.js edge caching for
                lightning-fast responses.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
