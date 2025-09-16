import { FormEvent, useMemo, useState } from 'react';

interface GenerationFormProps {
  isPro: boolean;
  remaining: number;
  onGenerated: () => void;
}

interface GenerationResponse {
  result: string;
}

const toneOptions = [
  { value: 'professional', label: 'Professional polish' },
  { value: 'friendly', label: 'Friendly and warm' },
  { value: 'bold', label: 'Bold and energetic' }
];

const seniorityOptions = [
  { value: 'entry-level', label: 'Entry-level focus' },
  { value: 'mid-level', label: 'Mid-level contributor' },
  { value: 'senior', label: 'Senior leadership' }
];

const formatOptions = [
  { value: 'traditional', label: 'Traditional chronological' },
  { value: 'modern', label: 'Modern impact-driven' },
  { value: 'compact', label: 'Compact one-page' }
];

export default function GenerationForm({ isPro, remaining, onGenerated }: GenerationFormProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [tone, setTone] = useState(toneOptions[0].value);
  const [seniority, setSeniority] = useState(seniorityOptions[1].value);
  const [format, setFormat] = useState(formatOptions[1].value);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = useMemo(() => {
    if (isPro) {
      return false;
    }
    return remaining <= 0;
  }, [isPro, remaining]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setResult('');

    if (!isPro && remaining <= 0) {
      setError('You have reached your free limit. Upgrade to Pro for unlimited tailoring.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobDescription, resume, tone, seniority, format, includeCoverLetter })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to generate a tailored resume right now.');
      }

      const data: GenerationResponse = await response.json();
      setResult(data.result);
      onGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ marginTop: 0 }}>Tailor your resume</h2>
        <p style={{ color: 'var(--muted)' }}>
          Paste the job description, choose how bold or friendly you want to sound, and we&apos;ll rework
          your resume to match. You can even append a cover letter in the same pass.
        </p>

        <div className="field">
          <label htmlFor="jobDescription">Job description</label>
          <textarea
            id="jobDescription"
            placeholder="Paste the job listing details here"
            rows={8}
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="resume">Your resume</label>
          <textarea
            id="resume"
            placeholder="Paste your full resume text"
            rows={12}
            value={resume}
            onChange={(event) => setResume(event.target.value)}
            required
          />
        </div>

        <div
          style={{
            margin: '2rem 0',
            padding: '1.5rem',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: '#f8fafc'
          }}
        >
          <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Personalize the rewrite</h3>
          <p style={{ color: 'var(--muted)', margin: '0 0 1.5rem', fontSize: '0.95rem' }}>
            These preferences will be saved with your history so you can revisit what worked best for
            each application.
          </p>

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
            }}
          >
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="tone">Resume tone</label>
              <select id="tone" value={tone} onChange={(event) => setTone(event.target.value)}>
                {toneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="helper">Dial up the polish, warmth, or energy in the language.</p>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="seniority">Seniority focus</label>
              <select
                id="seniority"
                value={seniority}
                onChange={(event) => setSeniority(event.target.value)}
              >
                {seniorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="helper">Make sure accomplishments match the level of the role.</p>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="format">Resume format</label>
              <select id="format" value={format} onChange={(event) => setFormat(event.target.value)}>
                {formatOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="helper">Choose the structure and pacing that fits the audience.</p>
            </div>
          </div>

          <div className="field" style={{ margin: '1.5rem 0 0' }}>
            <label htmlFor="includeCoverLetter" style={{ marginBottom: '0.75rem' }}>
              Cover letter companion
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                id="includeCoverLetter"
                type="checkbox"
                checked={includeCoverLetter}
                onChange={(event) => setIncludeCoverLetter(event.target.checked)}
                style={{ width: '1.2rem', height: '1.2rem' }}
              />
              <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
                Append a tailored cover letter after the resume using the same tone.
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="primary" type="submit" disabled={isLoading || isDisabled}>
            {isLoading ? 'Tailoring…' : 'Tailor now'}
          </button>
          {!isPro && (
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {remaining} free {remaining === 1 ? 'resume' : 'resumes'} left
            </span>
          )}
        </div>

        {error && <p className="error">{error}</p>}
      </form>

      {result && (
        <div style={{ marginTop: '2.5rem' }}>
          <h3>Tailored resume</h3>
          <p style={{ color: 'var(--muted)' }}>
            Copy this version directly into your application tracking system or download it as a PDF.
            If you requested a cover letter, you&apos;ll find it neatly appended below the resume.
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}
          >
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
