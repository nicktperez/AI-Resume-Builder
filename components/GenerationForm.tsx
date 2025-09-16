import { FormEvent, useMemo, useState } from 'react';
import ResumeInsights, { InsightSummary } from './ResumeInsights';

interface GenerationFormProps {
  isPro: boolean;
  remaining: number;
  onGenerated: () => void;
}

interface GenerationResponse {
  result: string;
  insights?: InsightSummary;
}

export default function GenerationForm({ isPro, remaining, onGenerated }: GenerationFormProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [result, setResult] = useState('');
  const [insights, setInsights] = useState<InsightSummary | null>(null);
  const [submittedResume, setSubmittedResume] = useState('');
  const [submittedJobDescription, setSubmittedJobDescription] = useState('');
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
        body: JSON.stringify({ jobDescription, resume })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to generate a tailored resume right now.');
      }

      const data: GenerationResponse = await response.json();

      if (!data.result) {
        throw new Error('The tailored resume was missing from the response. Please try again.');
      }

      setResult(data.result);
      setInsights(data.insights ?? null);
      setSubmittedResume(resume);
      setSubmittedJobDescription(jobDescription);
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
          Paste the job description and your current resume. Our AI will highlight the most relevant
          skills, tone, and keywords in seconds.
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
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
            Copy this version directly into your application tracking system or download it as a PDF.
          </p>
          <ResumeInsights
            tailoredResume={result}
            originalResume={submittedResume}
            jobDescription={submittedJobDescription}
            insights={insights}
          />
        </div>
      )}
    </div>
  );
}
