import { type CSSProperties, useEffect, useState } from 'react';
import useSWR from 'swr';
import Header from '../components/Header';
import GenerationForm from '../components/GenerationForm';
import GenerationHistory from '../components/GenerationHistory';

interface SessionResponse {
  user: {
    id: string;
    email: string;
    isPro: boolean;
    resumeCount: number;
  } | null;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to load session');
  }
  return res.json();
};

export default function DashboardPage() {
  const { data, error, mutate } = useSWR<SessionResponse>('/api/me', fetcher, {
    revalidateOnFocus: false
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('Session error:', error);
      window.location.href = '/login';
    }
  }, [error]);

  useEffect(() => {
    if (data && !data.user) {
      console.log('No user found in session');
      window.location.href = '/login';
    }
  }, [data]);

  if (!data?.user) {
    return null;
  }

  const maxFreeCredits = 2;
  const remaining = Math.max(0, maxFreeCredits - data.user.resumeCount);
  const usedCredits = Math.min(data.user.resumeCount, maxFreeCredits);
  const usagePercent = data.user.isPro
    ? 100
    : Math.round((usedCredits / maxFreeCredits) * 100);
  const progressStyle: CSSProperties = {
    ['--progress' as any]: `${usagePercent}%`
  };

  const proFeatures = [
    {
      title: 'Unlimited keyword gap analysis',
      description: 'Reveal the exact phrases missing from your resume for every job posting.',
      roi: 'Save ~$39/mo versus separate SEO tooling.',
      tooltip:
        'Upgrade to instantly surface ATS keywords so you stop spending hours rewriting each resume.'
    },
    {
      title: '1-click tailored cover letters',
      description: 'Spin up recruiter-ready letters that mirror your resume in seconds.',
      roi: 'Win back 3+ hours every week you would normally spend drafting letters.',
      tooltip:
        'Members report landing interviews twice as fast when their cover letters echo resume keywords.'
    },
    {
      title: 'Priority export & tracking',
      description: 'Export unlimited PDF/Word versions and track which ones perform best.',
      roi: 'Avoid $20/job board fees by reusing your best converting resume instantly.',
      tooltip:
        'Know which tailored resumes convert so you invest time only where interviews happen.'
    }
  ];

  const handleGenerated = () => {
    mutate();
    setRefreshKey((value) => value + 1);
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Checkout error:', errorData);
        
        if (response.status === 401) {
          alert('Please log in again to upgrade your account.');
          window.location.href = '/login';
        } else if (response.status === 500) {
          alert('Stripe is not configured. Please contact support.');
        } else {
          alert(errorData.error || 'Unable to start checkout. Please try again later.');
        }
        return;
      }
      
      const data = await response.json();
      if (!data.url) {
        alert('Invalid checkout response. Please try again.');
        return;
      }
      
      window.location.href = data.url;
    } catch (err) {
      console.error('Upgrade error:', err);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '3rem 0 5rem', display: 'grid', gap: '2rem' }}>
        <section className="dashboard-intro card">
          <div className="intro-copy">
            <h1>Welcome back, {data.user.email}</h1>
            <p className="intro-subhead">
              {data.user.isPro
                ? 'You have unlimited tailored resumes with your Pro membership.'
                : `You can tailor ${remaining} more resume${remaining === 1 ? '' : 's'} for free.`}
            </p>
            {!data.user.isPro && (
              <>
                <button 
                  className="primary upgrade-button" 
                  type="button" 
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? 'Starting checkout...' : 'Upgrade to Pro for unlimited resumes'}
                </button>
                <p className="upgrade-footnote">
                  Unlock unlimited keyword gap analysis, instant cover letters, and export history so each
                  application earns a faster response.
                </p>
              </>
            )}
          </div>
          <div className={`credit-meter${data.user.isPro ? ' credit-meter--pro' : ''}`}>
            <div
              className="credit-ring"
              style={progressStyle}
              role="img"
              aria-label={
                data.user.isPro
                  ? 'You are on Pro. Unlimited credits available.'
                  : `${usagePercent}% of your free credits have been used.`
              }
            >
              <span className="credit-count">
                {data.user.isPro ? '∞' : `${usedCredits}/${maxFreeCredits}`}
              </span>
            </div>
            <p className="credit-meter__label">
              {data.user.isPro ? 'Pro access unlocked' : 'Free credits used'}
            </p>
            {!data.user.isPro && (
              <p className="credit-meter__caption">Upgrade to refill credits and keep your application momentum.</p>
            )}
          </div>
        </section>

        {!data.user.isPro && (
          <>
            <div className="upsell-banner" role="note">
              <strong>Time is money.</strong> Upgrading once saves hours each week and pays for itself after two
              interviews.
            </div>
            <section className="pro-feature-grid" aria-label="Pro plan benefits">
              {proFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className="locked-tile"
                  data-tooltip={feature.tooltip}
                  tabIndex={0}
                >
                  <div className="locked-tile__header">
                    <span className="lock-badge" aria-hidden="true">
                      🔒 Pro
                    </span>
                    <h3>{feature.title}</h3>
                  </div>
                  <p>{feature.description}</p>
                  <p className="feature-roi">{feature.roi}</p>
                </article>
              ))}
            </section>
          </>
        )}

        <GenerationForm isPro={data.user.isPro} remaining={remaining} onGenerated={handleGenerated} />

        <GenerationHistory refreshKey={refreshKey} />
      </main>
    </>
  );
}
