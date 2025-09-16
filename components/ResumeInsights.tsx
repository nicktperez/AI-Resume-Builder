import { useMemo, useState } from 'react';
import { computeLineDiff, DiffSegment } from '../lib/diff';
import styles from './ResumeInsights.module.css';

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

const classNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

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
  const typeClass =
    segment.type === 'added'
      ? styles.diffAdded
      : segment.type === 'removed'
      ? styles.diffRemoved
      : styles.diffUnchanged;

  return (
    <div key={`${segment.type}-${index}`} className={classNames(styles.diffLine, typeClass)}>
      <span aria-hidden="true" className={styles.diffSymbol}>
        {symbol}
      </span>
      <span>{segment.value || ' '}</span>
    </div>
  );
};

const renderBadges = (items: string[], emptyLabel: string, variant: 'success' | 'warning') => {
  if (!items.length) {
    return <p className={styles.muted}>{emptyLabel}</p>;
  }

  const variantClass = variant === 'success' ? styles.badgeSuccess : styles.badgeWarning;

  return (
    <div className={styles.keywordBadges}>
      {items.map((item) => (
        <span key={item} className={classNames(styles.badge, variantClass)}>
          {item}
        </span>
      ))}
    </div>
  );
};

const renderSuggestions = (items: string[]) => {
  if (!items.length) {
    return <p className={styles.muted}>Nothing else to add—your resume already aligns well.</p>;
  }

  return (
    <ul className={styles.insightsList}>
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

  const jobDetails = useMemo(() => jobDescription?.trim() ?? '', [jobDescription]);

  const diff = useMemo(() => computeLineDiff(originalResume, tailoredResume), [originalResume, tailoredResume]);

  return (
    <div className={styles.root}>
      {jobDetails && (
        <details className={styles.jobContext}>
          <summary>View job description context</summary>
          <pre className={styles.jobContextBody}>{jobDetails}</pre>
        </details>
      )}

      <div className={styles.tabs} role="tablist" aria-label="Tailored resume insights">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={classNames(styles.tabButton, activeTab === tab.id && styles.tabButtonActive)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabPanel} role="tabpanel">
        {activeTab === 'resume' && <pre className={styles.resumeOutput}>{tailoredResume}</pre>}
        {activeTab === 'diff' && (
          <div className={styles.diff} aria-live="polite">
            {diff.map((segment, index) => renderDiffLine(segment, index))}
          </div>
        )}
        {activeTab === 'keywords' && (
          <div className={styles.keywordGrid}>
            <div className={styles.keywordSection}>
              <h4>Matched keywords</h4>
              <p className={styles.muted}>These phrases from the job description now appear in your resume.</p>
              {renderBadges(
                normalizedInsights.matchedKeywords,
                'No strong keyword matches yet—consider weaving in more role-specific language.',
                'success'
              )}
            </div>
            <div className={styles.keywordSection}>
              <h4>Missing skills</h4>
              <p className={styles.muted}>Keywords from the job posting that still aren&apos;t covered.</p>
              {renderBadges(
                normalizedInsights.missingSkills,
                'Great news—no important skills appear to be missing.',
                'warning'
              )}
            </div>
            <div className={styles.keywordSection}>
              <h4>Suggested improvements</h4>
              <p className={styles.muted}>Action items to strengthen your next edit.</p>
              {renderSuggestions(normalizedInsights.suggestedImprovements)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
