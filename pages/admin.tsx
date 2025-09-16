import { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
  resumeCount: number;
  createdAt: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  _count: {
    generations: number;
  };
}

interface Stats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalGenerations: number;
  recentUsers: number;
  recentGenerations: number;
  conversionRate: number;
  avgGenerationsPerUser: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ]);

      if (usersRes.status === 403 || statsRes.status === 403) {
        router.push('/login');
        return;
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData.users || []);
      setStats(statsData.stats || null);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserPro = async (userId: string, currentIsPro: boolean) => {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isPro: !currentIsPro
        })
      });

      if (response.ok) {
        const { user } = await response.json();
        setUsers(users.map(u => u.id === userId ? user : u));
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--muted)'
      }}>
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - AI Resume Tailor</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      
      <Header />
      
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.5rem', fontWeight: '700' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem', margin: 0 }}>
            Manage users and monitor platform activity
          </p>
        </div>

        {stats && (
          <div className="grid" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {stats.totalUsers}
              </div>
              <div style={{ color: 'var(--muted)' }}>Total Users</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)', marginBottom: '0.5rem' }}>
                {stats.proUsers}
              </div>
              <div style={{ color: 'var(--muted)' }}>Pro Users</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                {stats.freeUsers}
              </div>
              <div style={{ color: 'var(--muted)' }}>Free Users</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
                {stats.totalGenerations}
              </div>
              <div style={{ color: 'var(--muted)' }}>Total Generations</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {stats.conversionRate.toFixed(1)}%
              </div>
              <div style={{ color: 'var(--muted)' }}>Conversion Rate</div>
            </div>
            
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
                {stats.avgGenerationsPerUser.toFixed(1)}
              </div>
              <div style={{ color: 'var(--muted)' }}>Avg per User</div>
            </div>
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>User Management</h2>
            <button 
              className="primary" 
              onClick={fetchData}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              Refresh
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '800px'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>User</th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>Plan</th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>Resume Count</th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>Generations</th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>Joined</th>
                  <th style={{ textAlign: 'left', padding: '1rem 0.5rem', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {user.name}
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span 
                        className={`badge ${user.isPro ? 'badge-pro' : 'badge-neutral'}`}
                        style={{ 
                          background: user.isPro 
                            ? 'rgba(16, 185, 129, 0.12)' 
                            : 'rgba(148, 163, 184, 0.25)',
                          color: user.isPro 
                            ? 'var(--primary-dark)' 
                            : '#475569'
                        }}
                      >
                        {user.isPro ? 'Pro' : 'Free'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>
                      {user.resumeCount}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {user._count.generations}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                      {formatDate(user.createdAt)}
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <button
                        className={user.isPro ? 'ghost-button' : 'primary'}
                        onClick={() => toggleUserPro(user.id, user.isPro)}
                        disabled={updating === user.id}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.85rem',
                          minWidth: '80px'
                        }}
                      >
                        {updating === user.id ? '...' : user.isPro ? 'Downgrade' : 'Upgrade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem 0', 
              color: 'var(--muted)' 
            }}>
              No users found
            </div>
          )}
        </div>
      </main>
    </>
  );
}
