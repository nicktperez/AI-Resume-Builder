export type ComparisonValue = boolean | string;

export interface ComparisonProduct {
  name: string;
  tagline?: string;
  isPrimary?: boolean;
}

export interface ComparisonFeature {
  label: string;
  description?: string;
  values: ComparisonValue[];
}

interface CompetitorComparisonProps {
  products: ComparisonProduct[];
  features: ComparisonFeature[];
}

export default function CompetitorComparison({
  products,
  features
}: CompetitorComparisonProps) {
  return (
    <div className="comparison-table" role="region" aria-label="Competitor comparison">
      <table>
        <thead>
          <tr>
            <th scope="col">Capability</th>
            {products.map((product) => (
              <th key={product.name} scope="col" className={product.isPrimary ? 'is-primary' : ''}>
                <div>
                  <span>{product.name}</span>
                  {product.tagline && <small>{product.tagline}</small>}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.label}>
              <th scope="row">
                <span>{feature.label}</span>
                {feature.description && <small>{feature.description}</small>}
              </th>
              {feature.values.map((value, index) => (
                <td key={`${feature.label}-${products[index]?.name ?? index}`}>
                  {typeof value === 'boolean' ? (
                    <span className={`comparison-indicator ${value ? 'is-yes' : 'is-no'}`}>
                      {value ? '✓' : '—'}
                    </span>
                  ) : (
                    <span className="comparison-value">{value}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
