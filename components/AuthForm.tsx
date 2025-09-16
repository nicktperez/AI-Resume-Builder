import { FormEvent, useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload =
        mode === 'register'
          ? { email, password, name }
          : {
              email,
              password
            };

      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to authenticate');
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card" style={{ maxWidth: '420px', margin: '3rem auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>
        {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        {mode === 'login'
          ? 'Pick up where you left off and tailor your next resume.'
          : 'Start with two tailored resumes for free. Upgrade any time for unlimited access.'}
      </p>

      {mode === 'register' && (
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Avery Candidate"
            required
          />
        </div>
      )}

      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a secure password"
          minLength={8}
          required
        />
      </div>

      <button type="submit" className="primary" disabled={isLoading}>
        {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  );
}
