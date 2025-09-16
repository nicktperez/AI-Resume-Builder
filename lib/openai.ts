import OpenAI from 'openai';
import logger, { logError, logInfo } from './logger';

interface OpenAIOptions {
  apiKey: string;
  model?: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface GenerationOptions {
  jobDescription: string;
  resume: string;
  tone: string;
  seniority: string;
  format: string;
  includeCoverLetter: boolean;
  toneGuidance: Record<string, string>;
  seniorityGuidance: Record<string, string>;
  formatGuidance: Record<string, string>;
}

interface GenerationResult {
  tailoredResume: string;
  matchedKeywords: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class OptimizedOpenAI {
  private client: OpenAI;
  private model: string;
  private maxRetries: number;
  private retryDelay: number;

  constructor(options: OpenAIOptions) {
    this.client = new OpenAI({ apiKey: options.apiKey });
    this.model = options.model || 'gpt-4o-mini';
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
  }

  async generateResume(options: GenerationOptions): Promise<GenerationResult> {
    const { jobDescription, resume, tone, seniority, format, includeCoverLetter, toneGuidance, seniorityGuidance, formatGuidance } = options;

    const prompt = this.buildPrompt({
      jobDescription,
      resume,
      tone,
      seniority,
      format,
      includeCoverLetter,
      toneGuidance,
      seniorityGuidance,
      formatGuidance
    });

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logInfo('OpenAI API call attempt', { 
          attempt, 
          maxRetries: this.maxRetries,
          model: this.model 
        });

        const response = await this.client.chat.completions.create({
          model: this.model,
          temperature: 0.7,
          max_tokens: 1600,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'resume_tailoring',
              strict: true,
              schema: {
                type: 'object',
                required: ['tailoredResume', 'matchedKeywords', 'missingSkills', 'suggestedImprovements'],
                properties: {
                  tailoredResume: {
                    type: 'string',
                    description: 'The fully rewritten resume in Markdown with sections for Summary, Experience, Skills, and Education.'
                  },
                  matchedKeywords: {
                    type: 'array',
                    description: 'Keywords from the job description that are now clearly reflected in the resume.',
                    items: { type: 'string' }
                  },
                  missingSkills: {
                    type: 'array',
                    description: 'Important skills or keywords from the job description that are still missing.',
                    items: { type: 'string' }
                  },
                  suggestedImprovements: {
                    type: 'array',
                    description: 'Actionable suggestions the candidate can follow to further improve alignment with the job description.',
                    items: { type: 'string' }
                  }
                }
              }
            }
          },
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume writer. Always respond with valid JSON that matches the provided schema. The tailored resume must be concise, achievement-focused, and formatted in Markdown so it can be pasted directly into an ATS.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        const rawOutput = response.choices[0]?.message?.content?.trim();

        if (!rawOutput) {
          throw new Error('OpenAI returned empty response');
        }

        const parsed = JSON.parse(rawOutput);
        
        // Validate the response structure
        if (!parsed.tailoredResume || !Array.isArray(parsed.matchedKeywords)) {
          throw new Error('Invalid response structure from OpenAI');
        }

        const result: GenerationResult = {
          tailoredResume: parsed.tailoredResume,
          matchedKeywords: parsed.matchedKeywords || [],
          missingSkills: parsed.missingSkills || [],
          suggestedImprovements: parsed.suggestedImprovements || [],
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
          } : undefined
        };

        logInfo('OpenAI API call successful', { 
          attempt,
          usage: result.usage,
          resumeLength: result.tailoredResume.length
        });

        return result;

      } catch (error) {
        const isLastAttempt = attempt === this.maxRetries;
        
        logError(`OpenAI API call failed (attempt ${attempt})`, error as Error, {
          attempt,
          maxRetries: this.maxRetries,
          isLastAttempt
        });

        if (isLastAttempt) {
          throw new Error(`OpenAI API failed after ${this.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('This should never be reached');
  }

  private buildPrompt(options: GenerationOptions): string {
    const { jobDescription, resume, tone, seniority, format, includeCoverLetter, toneGuidance, seniorityGuidance, formatGuidance } = options;

    return `Job description:\n${jobDescription}\n\nCandidate resume:\n${resume}\n\nPersonalization targets:\n- ${toneGuidance[tone]}\n- ${seniorityGuidance[seniority]}\n- ${formatGuidance[format]}\n\nRewrite requirements:\n- Mirror the most important keywords, tools, and priorities from the job description.\n- Use Markdown with clear section headings: Summary, Experience, Skills, Education.\n- Keep bullet points concise, achievement-focused, and supported by metrics when possible.\n- Maintain ATS-friendly formatting with consistent spacing and capitalization.\n${includeCoverLetter ? '- After the resume, add a new section titled "## Cover Letter" with 2-3 short paragraphs that extend the same tone and connect the candidate to the role.\n' : '- Do not include a cover letter or mention one unless explicitly asked.\n'}- Ensure the final document reads cohesively and feels written by one person.\n\nAlso identify which keywords from the job description are reflected in the rewrite, which skills are still missing, and provide practical suggestions the candidate can act on to further tailor the resume.`;
  }
}

export default OptimizedOpenAI;
