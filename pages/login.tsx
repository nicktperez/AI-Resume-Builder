import Link from 'next/link';
import Header from '../components/Header';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: '3rem 0 5rem' }}>
        <AuthForm mode="login" />
        <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
          New to AI Resume Tailor? <Link href="/register">Create an account</Link>
        </p>
      </main>
    </>
  );
}
