import Link from 'next/link';

export interface PricingFeature {
  label: string;
  isPro?: boolean;
}

export interface PricingTier {
  name: string;
  price: string;
  frequency: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  features: PricingFeature[];
  popular?: boolean;
  footnote?: string;
}

interface PricingTableProps {
  tiers: PricingTier[];
}

export default function PricingTable({ tiers }: PricingTableProps) {
  return (
    <div className="pricing-grid">
      {tiers.map((tier) => (
        <article
          key={tier.name}
          className={`pricing-card ${tier.popular ? 'pricing-card--highlight' : ''}`.trim()}
        >
          <header className="pricing-card__header">
            {tier.popular && <span className="badge badge-pill">Most popular</span>}
            <h3>{tier.name}</h3>
            <p>{tier.description}</p>
          </header>
          <div className="pricing-card__price">
            <span className="pricing-card__price-amount">{tier.price}</span>
            <span className="pricing-card__price-frequency">{tier.frequency}</span>
          </div>
          <ul className="pricing-card__features">
            {tier.features.map((feature) => (
              <li key={feature.label}>
                {feature.isPro && <span className="feature-pro-tag">Pro</span>}
                {feature.label}
              </li>
            ))}
          </ul>
          <Link
            href={tier.ctaHref}
            className={`pricing-card__cta ${tier.popular ? 'pricing-card__cta--primary' : ''}`.trim()}
          >
            {tier.ctaLabel}
          </Link>
          {tier.footnote && <p className="pricing-card__footnote">{tier.footnote}</p>}
        </article>
      ))}
    </div>
  );
}
