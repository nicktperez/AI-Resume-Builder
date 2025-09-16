import useSWR from 'swr';

interface GenerationItem {
  id: string;
  jobDescription: string;
  generatedResume: string;
  createdAt: string;
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
      <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
        {data.generations.map((generation) => (
          <div key={generation.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {new Date(generation.createdAt).toLocaleString()}
            </p>
            <details>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>View tailored resume</summary>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  marginTop: '1rem'
                }}
              >
                {generation.generatedResume}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
