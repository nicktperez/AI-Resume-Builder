import Link from 'next/link';
import Header from '../components/Header';
import AuthForm from '../components/AuthForm';

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: '3rem 0 5rem' }}>
        <AuthForm mode="register" />
        <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </main>
    </>
  );
}
