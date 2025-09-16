import { useMemo, useState } from 'react';
import { computeLineDiff, DiffSegment } from '../lib/diff';

export interface InsightSummary {
  matchedKeywords?: string[];
  missingSkills?: string[];
  suggestedImprovements?: string[];
}

interface ResumeInsightsProps {
  tailoredResume: string;
  originalResume: string;
  jobDescription?: string;
  insights?: InsightSummary | null;
}

type TabKey = 'resume' | 'diff' | 'keywords';

const tabs: { id: TabKey; label: string }[] = [
  { id: 'resume', label: 'Tailored resume' },
  { id: 'diff', label: 'Before vs. after' },
  { id: 'keywords', label: 'Keyword checklist' }
];

const toTextArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }

      if (typeof item === 'number') {
        return String(item);
      }

      return '';
    })
    .filter(Boolean);
};

const renderDiffLine = (segment: DiffSegment, index: number) => {
  const symbol = segment.type === 'added' ? '+' : segment.type === 'removed' ? '-' : ' ';
  const className = `diff-line diff-${segment.type}`;

  return (
    <div key={`${segment.type}-${index}`} className={className}>
      <span aria-hidden="true" className="diff-symbol">
        {symbol}
      </span>
      <span>{segment.value || ' '}</span>
    </div>
  );
};

const renderBadges = (items: string[], emptyLabel: string, variant: 'success' | 'warning') => {
  if (!items.length) {
    return <p className="muted">{emptyLabel}</p>;
  }

  return (
    <div className="keyword-badges">
      {items.map((item) => (
        <span key={item} className={`badge badge-${variant}`}>
          {item}
        </span>
      ))}
    </div>
  );
};

const renderSuggestions = (items: string[]) => {
  if (!items.length) {
    return <p className="muted">Nothing else to add—your resume already aligns well.</p>;
  }

  return (
    <ul className="insights-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

export default function ResumeInsights({
  tailoredResume,
  originalResume,
  jobDescription,
  insights
}: ResumeInsightsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('resume');

  const normalizedInsights = useMemo(
    () => ({
      matchedKeywords: toTextArray(insights?.matchedKeywords),
      missingSkills: toTextArray(insights?.missingSkills),
      suggestedImprovements: toTextArray(insights?.suggestedImprovements)
    }),
    [insights]
  );

  const diff = useMemo(() => computeLineDiff(originalResume, tailoredResume), [originalResume, tailoredResume]);

  return (
    <div className="insights">
      {jobDescription && (
        <details className="job-context">
          <summary>View job description context</summary>
          <pre>{jobDescription}</pre>
        </details>
      )}

      <div className="tabs" role="tablist" aria-label="Tailored resume insights">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-button ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-panel" role="tabpanel">
        {activeTab === 'resume' && (
          <pre className="resume-output">{tailoredResume}</pre>
        )}
        {activeTab === 'diff' && (
          <div className="diff" aria-live="polite">
            {diff.map((segment, index) => renderDiffLine(segment, index))}
          </div>
        )}
        {activeTab === 'keywords' && (
          <div className="keyword-grid">
            <div className="keyword-section">
              <h4>Matched keywords</h4>
              <p className="muted">These phrases from the job description now appear in your resume.</p>
              {renderBadges(normalizedInsights.matchedKeywords, 'No strong keyword matches yet—consider weaving in more role-specific language.', 'success')}
            </div>
            <div className="keyword-section">
              <h4>Missing skills</h4>
              <p className="muted">Keywords from the job posting that still aren&apos;t covered.</p>
              {renderBadges(normalizedInsights.missingSkills, 'Great news—no important skills appear to be missing.', 'warning')}
            </div>
            <div className="keyword-section">
              <h4>Suggested improvements</h4>
              <p className="muted">Action items to strengthen your next edit.</p>
              {renderSuggestions(normalizedInsights.suggestedImprovements)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
