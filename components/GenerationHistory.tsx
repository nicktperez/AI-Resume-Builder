import useSWR from 'swr';

interface GenerationItem {
  id: string;
  jobDescription: string;
  generatedResume: string;
  createdAt: string;
  tone: 'professional' | 'friendly' | 'bold';
  seniority: 'entry-level' | 'mid-level' | 'senior';
  format: 'traditional' | 'modern' | 'compact';
  includeCoverLetter: boolean;
}

interface HistoryResponse {
  generations: GenerationItem[];
}

const toneLabels: Record<GenerationItem['tone'], string> = {
  professional: 'Professional polish',
  friendly: 'Friendly & warm',
  bold: 'Bold & energetic'
};

const seniorityLabels: Record<GenerationItem['seniority'], string> = {
  'entry-level': 'Entry-level focus',
  'mid-level': 'Mid-level contributor',
  senior: 'Senior leadership'
};

const formatLabels: Record<GenerationItem['format'], string> = {
  traditional: 'Traditional chronological',
  modern: 'Modern impact-driven',
  compact: 'Compact one-page'
};

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
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>
              Tone: <strong style={{ color: 'var(--foreground)' }}>{toneLabels[generation.tone]}</strong> · Focus:{' '}
              <strong style={{ color: 'var(--foreground)' }}>{seniorityLabels[generation.seniority]}</strong> · Format:{' '}
              <strong style={{ color: 'var(--foreground)' }}>{formatLabels[generation.format]}</strong> · Cover letter:{' '}
              <strong style={{ color: 'var(--foreground)' }}>{generation.includeCoverLetter ? 'Included' : 'Not included'}</strong>
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
