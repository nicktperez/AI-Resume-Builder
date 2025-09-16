import useSWR from 'swr';
import ResumeInsights, { InsightSummary } from './ResumeInsights';
import styles from './GenerationHistory.module.css';

interface GenerationItem {
  id: string;
  jobDescription: string;
  generatedResume: string;
  originalResume: string;
  createdAt: string;
  insights?: InsightSummary | null;
}

interface HistoryResponse {
  generations: GenerationItem[];
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Unable to load resume history');
  }
  return res.json();
};

export default function GenerationHistory({ refreshKey }: { refreshKey: number }) {
  const { data, isLoading } = useSWR<HistoryResponse>(`/api/generations?key=${refreshKey}`, fetcher, {
    revalidateOnFocus: false
  });

  const formatJobSnippet = (jobDescription: string) => {
    const trimmed = jobDescription.trim();
    if (!trimmed) {
      return 'Job description not available';
    }
    const words = trimmed.split(/\s+/);
    if (words.length <= 24) {
      return trimmed;
    }
    return `${words.slice(0, 24).join(' ')}…`;
  };

  if (isLoading) {
    return <p>Loading your tailored resumes…</p>;
  }

  if (!data?.generations?.length) {
    return (
      <div className="card">
        <h3>Nothing here yet</h3>
        <p style={{ color: 'var(--muted)' }}>
          Tailor a resume and we&apos;ll keep a secure log of your last 10 versions.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Recent tailored resumes</h3>
      <div className={styles.list}>
        {data.generations.map((generation) => (
          <div key={generation.id} className={styles.entry}>
            <details>
              <summary>
                <div className={styles.summary}>
                  <span className={styles.date}>{new Date(generation.createdAt).toLocaleString()}</span>
                  <span className={styles.role}>
                    Tailored for: {formatJobSnippet(generation.jobDescription)}
                  </span>
                </div>
              </summary>
              <div className={styles.content}>
                <ResumeInsights
                  tailoredResume={generation.generatedResume}
                  originalResume={generation.originalResume}
                  jobDescription={generation.jobDescription}
                  insights={generation.insights}
                />
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
