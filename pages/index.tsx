import Link from 'next/link';
import Header from '../components/Header';
import TestimonialCarousel, { Testimonial } from '../components/TestimonialCarousel';
import PricingTable, { PricingTier } from '../components/PricingTable';
import CompetitorComparison, {
  ComparisonFeature,
  ComparisonProduct
} from '../components/CompetitorComparison';

const testimonials: Testimonial[] = [
  {
    name: 'Jordan Lee',
    role: 'Product Design Lead',
    company: 'Notion',
    quote:
      "AI Resume Tailor reframed my impact with data-backed language. Recruiters started referencing specific bullet points I'd never highlighted before.",
    result: '3x more first-round calls'
  },
  {
    name: 'Priya Desai',
    role: 'Senior Software Engineer',
    company: 'Canva',
    quote:
      'The ATS score jumped from 47 to 92 with the Pro rewrite. I shipped five tailored resumes in under an hour and landed interviews at my top choices.',
    result: '+45 ATS score boost'
  },
  {
    name: 'Morgan Adams',
    role: 'Career Coach',
    company: 'Reframe Bootcamp',
    quote:
      'My cohort needed a collaborative space. Shared folders and coaching annotations inside AI Resume Tailor cut our revision cycles by half.',
    result: '50% faster cohort reviews'
  },
  {
    name: 'Zara Hernández',
    role: 'Marketing Manager',
    company: 'Shopify',
    quote:
      'I finally sound like a marketer instead of a generalist. The tone rewrites sold my narrative to leadership roles without me second-guessing every bullet.',
    result: 'Landed 2 leadership offers'
  }
];

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$0',
    frequency: 'forever free',
    description: 'Experiment with AI-tailored resumes and surface quick wins in your job search.',
    ctaLabel: 'Start for free',
    ctaHref: '/register',
    features: [
      { label: '2 tailored resumes each month' },
      { label: 'Keyword density guidance' },
      { label: 'Export to PDF & Word' },
      { label: 'Secure resume locker' }
    ],
    footnote: 'No credit card required.'
  },
  {
    name: 'Pro',
    price: '$29',
    frequency: 'per month',
    description: 'Unlock unlimited personalization, ATS scoring, and role-specific storytelling.',
    ctaLabel: 'Upgrade to Pro',
    ctaHref: '/register?plan=pro',
    features: [
      { label: 'Unlimited resume & cover letter rewrites', isPro: true },
      { label: 'ATS confidence scoring with guidance', isPro: true },
      { label: 'Leadership, IC, and technical tone rewrites', isPro: true },
      { label: 'Pro-only design templates & exports', isPro: true },
      { label: 'Priority chat support in under 5 minutes', isPro: true }
    ],
    popular: true,
    footnote: 'Cancel anytime. Save 15% with annual billing.'
  },
  {
    name: 'Team',
    price: '$79',
    frequency: 'per month',
    description: 'Share workspaces, collaborate with mentors, and ship polished cohorts at scale.',
    ctaLabel: 'Book a demo',
    ctaHref: 'mailto:hello@airesumetailor.com?subject=Team%20Plan',
    features: [
      { label: 'Everything in Pro', isPro: true },
      { label: 'Shared folders & reviewer annotations' },
      { label: 'Bulk resume uploads (25/month)' },
      { label: 'Analytics dashboard & CSV export' },
      { label: 'Dedicated success manager' }
    ],
    footnote: 'Volume pricing starts at 10 seats.'
  }
];

const comparisonProducts: ComparisonProduct[] = [
  { name: 'AI Resume Tailor', tagline: 'Personalized by role', isPrimary: true },
  { name: 'ResumeGPT', tagline: 'Generic AI writer' },
  { name: 'Template Writer', tagline: 'Static downloads' }
];

const comparisonFeatures: ComparisonFeature[] = [
  {
    label: 'Keyword mirroring',
    description: "Matches the hiring manager's language automatically.",
    values: [true, true, false]
  },
  {
    label: 'ATS confidence score',
    description: 'Benchmark every draft against the job description.',
    values: [true, false, false]
  },
  {
    label: 'Tone & narrative rewrite',
    description: 'Dial voice for leadership, product, or technical roles.',
    values: [true, false, false]
  },
  {
    label: 'Collaboration workspace',
    description: 'Comment, version, and share resumes in one place.',
    values: [true, false, false]
  },
  {
    label: 'Data privacy',
    description: 'Enterprise-grade encryption with SOC2 controls.',
    values: ['SOC2-ready', 'Unknown', 'Email delivery']
  },
  {
    label: 'Pricing flexibility',
    description: 'Only upgrade to Pro when you need unlimited tailoring.',
    values: ['Free + $29 Pro', '$49/mo', '$19/template']
  }
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero hero-gradient" id="hero">
          <div className="container hero-inner">
            <div className="hero-content">
              <div className="badge hero-badge">AI-powered matching • ATS friendly</div>
              <h1>Instantly tailor your resume to any job description.</h1>
              <p>
                Paste a job posting and your resume. AI Resume Tailor rewrites your experience to
                match the role&apos;s keywords, tone, and required skills—all in seconds.
              </p>
              <div className="hero-actions">
                <Link href="/register">
                  <button className="primary" type="button">
                    Start for free
                  </button>
                </Link>
                <Link href="/#pricing" className="cta-pro hero-cta">
                  See Pro benefits
                </Link>
              </div>
              <div className="hero-subtext">
                Trusted by job seekers from Canva, Atlassian, Shopify, and 12,000+ growing teams.
              </div>
              <div className="grid hero-metrics">
                <div className="metric-card">
                  <span>92%</span>
                  <p>report more recruiter replies after their first tailored resume.</p>
                </div>
                <div className="metric-card">
                  <span>45 min</span>
                  <p>saved per application with reusable role-specific snippets.</p>
                </div>
                <div className="metric-card">
                  <span>4.8★</span>
                  <p>average rating from career coaches and talent partners.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-surface" id="features">
          <div className="container">
            <div className="section-heading">
              <span className="section-eyebrow">Features</span>
              <h2>Every resume rewrite is personalized for the job at hand.</h2>
              <p>
                Our AI mirrors the hiring manager&apos;s language, showcases measurable impact, and keeps
                your personal data secure at every step.
              </p>
            </div>
            <div className="grid feature-grid">
              <div className="card feature-card">
                <h3>Smart keyword alignment</h3>
                <p>
                  Analyse any job description, highlight critical keywords, and mirror the required
                  tone with confidence scores you can act on immediately.
                </p>
              </div>
              <div className="card feature-card">
                <h3>Freemium friendly</h3>
                <p>
                  Tailor two resumes on the free plan. When you&apos;re ready for unlimited rewrites,
                  upgrade to Pro or a team workspace with a single click.
                </p>
              </div>
              <div className="card feature-card">
                <h3>Privacy-first history</h3>
                <p>
                  Securely store tailored drafts, revert to previous versions, and auto-expire
                  documents when a hiring cycle is complete.
                </p>
              </div>
              <div className="card feature-card">
                <h3>Built for speed</h3>
                <p>
                  Our serverless architecture pairs OpenAI text generation with Next.js edge caching
                  for lightning-fast responses on every edit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-gradient-soft" id="testimonials">
          <div className="container">
            <div className="section-heading">
              <span className="section-eyebrow">Testimonials &amp; case studies</span>
              <h2>See how modern teams land interviews faster.</h2>
              <p>
                From individual contributors to full bootcamp cohorts, AI Resume Tailor delivers
                measurable impact the first week you onboard.
              </p>
            </div>
            <div className="grid testimonial-stats">
              <div className="stat-card">
                <span>3.2×</span>
                <p>increase in first-round interviews for Pro members within 30 days.</p>
              </div>
              <div className="stat-card">
                <span>65%</span>
                <p>of teams collaborate inside shared workspaces instead of email threads.</p>
              </div>
              <div className="stat-card">
                <span>24 hrs</span>
                <p>average time-to-offer reduction reported by coaching partners.</p>
              </div>
            </div>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>

        <section className="section section-pricing" id="pricing">
          <div className="container">
            <div className="section-heading">
              <span className="section-eyebrow">Pricing</span>
              <h2>Simple plans that scale with your job search momentum.</h2>
              <p>
                Start for free, then unlock unlimited personalization and collaboration tools when
                you&apos;re ready to accelerate.
              </p>
            </div>
            <PricingTable tiers={pricingTiers} />
            <p className="pricing-footnote">
              Need enterprise compliance or 50+ seats?{' '}
              <Link href="mailto:hello@airesumetailor.com?subject=Enterprise%20Inquiry">Talk to us</Link>.
            </p>
          </div>
        </section>

        <section className="section section-surface" id="comparison">
          <div className="container">
            <div className="section-heading">
              <span className="section-eyebrow">Why AI Resume Tailor</span>
              <h2>Outperform generic writers and inflexible templates.</h2>
              <p>
                We pair job-specific context with recruiter-ready structure so every submission feels
                hand-crafted—without sacrificing speed.
              </p>
            </div>
            <CompetitorComparison products={comparisonProducts} features={comparisonFeatures} />
          </div>
        </section>
      </main>
    </>
  );
}
