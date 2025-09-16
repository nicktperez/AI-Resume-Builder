import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { withSessionRoute, NextApiRequestWithSession } from '../../lib/withSession';
import { generateRateLimit } from '../../lib/rateLimit';
import logger, { logError, logInfo, logWarn } from '../../lib/logger';
import cache, { cacheKeys, cacheTTL } from '../../lib/cache';
import { setSecurityHeaders, sanitizeInput } from '../../lib/security';

const toneSchema = z.enum(['professional', 'friendly', 'bold']);
const senioritySchema = z.enum(['entry-level', 'mid-level', 'senior']);
const formatSchema = z.enum(['traditional', 'modern', 'compact']);

const toneGuidance: Record<z.infer<typeof toneSchema>, string> = {
  professional: 'Adopt a polished, executive tone that feels confident yet approachable.',
  friendly: 'Use a warm, collaborative voice while staying professional and clear.',
  bold: 'Lean into an energetic, results-driven tone that spotlights ambitious achievements.'
};

const seniorityGuidance: Record<z.infer<typeof senioritySchema>, string> = {
  'entry-level':
    'Emphasize transferable skills, coursework, internships, and early wins suited for an entry-level candidate.',
  'mid-level':
    'Balance strategic contributions with hands-on execution that a mid-level professional is expected to demonstrate.',
  senior:
    'Highlight leadership, vision, cross-functional impact, and decision-making expected from senior talent.'
};

const formatGuidance: Record<z.infer<typeof formatSchema>, string> = {
  traditional: 'Use a traditional chronological structure with clearly separated roles and bullet points.',
  modern: 'Use a modern, accomplishment-led layout that foregrounds impact statements and key wins.',
  compact: 'Keep sections concise and skimmable so the resume comfortably fits on a single page.'
};

const schema = z.object({
  jobDescription: z.string().min(20, 'Please provide a detailed job description.'),
  resume: z.string().min(50, 'Please paste the full text of your resume.'),
  tone: toneSchema,
  seniority: senioritySchema,
  format: formatSchema,
  includeCoverLetter: z.boolean()
});

const stringListSchema = z
  .array(z.union([z.string(), z.number()]))
  .optional()
  .default([])
  .transform((items) =>
    items
      .map((item) => (typeof item === 'number' ? String(item) : item))
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
  );

const tailoringPayloadSchema = z.object({
  tailoredResume: z.string().trim().min(1, 'The tailored resume was missing from the response.'),
  matchedKeywords: stringListSchema,
  missingSkills: stringListSchema,
  suggestedImprovements: stringListSchema
});

type TailoringPayload = z.infer<typeof tailoringPayloadSchema>;

type TailoringInsights = Omit<TailoringPayload, 'tailoredResume'>;

export default withSessionRoute(async function generateRoute(
  req: NextApiRequestWithSession,
  res: NextApiResponse
) {
  // Set security headers
  setSecurityHeaders(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Apply rate limiting
  if (!generateRateLimit(req, res)) {
    logWarn('Rate limit exceeded for generate endpoint', { 
      userId: req.session.userId,
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress 
    });
    return;
  }

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    logWarn('Invalid request body for generate endpoint', { 
      userId: req.session.userId,
      errors: parse.error.errors 
    });
    return res.status(400).json({ error: parse.error.errors[0]?.message || 'Invalid request body' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    logError('OpenAI API key not configured');
    return res.status(500).json({ error: 'OpenAI API key is not configured.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user) {
    await req.session.destroy();
    logWarn('User not found during generation', { userId: req.session.userId });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!user.isPro && user.resumeCount >= 2) {
    logInfo('User hit free limit', { userId: user.id, resumeCount: user.resumeCount });
    return res.status(402).json({ error: 'Upgrade to Pro for unlimited resumes.' });
  }

  const { jobDescription, resume, tone, seniority, format, includeCoverLetter } = parse.data;

  // Sanitize inputs
  const sanitizedJobDescription = sanitizeInput(jobDescription);
  const sanitizedResume = sanitizeInput(resume);

  // Create cache key for this generation
  const inputHash = crypto.createHash('md5')
    .update(`${sanitizedJobDescription}-${sanitizedResume}-${tone}-${seniority}-${format}-${includeCoverLetter}`)
    .digest('hex');
  
  const cacheKey = cacheKeys.resumeGeneration(user.id, inputHash);
  
  // Check cache first
  const cachedResult = cache.get<{ result: string; insights: TailoringInsights }>(cacheKey);
  if (cachedResult) {
    logInfo('Cache hit for resume generation', { userId: user.id, cacheKey });
    return res.status(200).json(cachedResult);
  }

  try {
    logInfo('Starting resume generation', { 
      userId: user.id, 
      isPro: user.isPro,
      tone,
      seniority,
      format,
      includeCoverLetter 
    });

    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
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
                description:
                  'The fully rewritten resume in Markdown with sections for Summary, Experience, Skills, and Education.'
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
                description:
                  'Actionable suggestions the candidate can follow to further improve alignment with the job description.',
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
          content: `Job description:\n${sanitizedJobDescription}\n\nCandidate resume:\n${sanitizedResume}\n\nPersonalization targets:\n- ${toneGuidance[tone]}\n- ${seniorityGuidance[seniority]}\n- ${formatGuidance[format]}\n\nRewrite requirements:\n- Mirror the most important keywords, tools, and priorities from the job description.\n- Use Markdown with clear section headings: Summary, Experience, Skills, Education.\n- Keep bullet points concise, achievement-focused, and supported by metrics when possible.\n- Maintain ATS-friendly formatting with consistent spacing and capitalization.\n${includeCoverLetter ? '- After the resume, add a new section titled "## Cover Letter" with 2-3 short paragraphs that extend the same tone and connect the candidate to the role.\n' : '- Do not include a cover letter or mention one unless explicitly asked.\n'}- Ensure the final document reads cohesively and feels written by one person.\n\nAlso identify which keywords from the job description are reflected in the rewrite, which skills are still missing, and provide practical suggestions the candidate can act on to further tailor the resume.`
        }
      ]
    });

    const rawOutput = response.choices[0]?.message?.content?.trim();

    if (!rawOutput) {
      logError('OpenAI returned empty response', undefined, { userId: user.id });
      return res.status(500).json({ error: 'The AI response was empty. Please try again.' });
    }

    let payload: TailoringPayload;
    try {
      const parsed = JSON.parse(rawOutput);
      payload = tailoringPayloadSchema.parse(parsed);
    } catch (parseError) {
      logError('Failed to parse OpenAI response', parseError as Error, { 
        userId: user.id, 
        rawOutput: rawOutput.substring(0, 500) 
      });
      return res.status(500).json({ error: 'The AI response was invalid. Please try again.' });
    }

    const { tailoredResume, matchedKeywords, missingSkills, suggestedImprovements } = payload;

    const insights: TailoringInsights = {
      matchedKeywords,
      missingSkills,
      suggestedImprovements
    };

    const result = { result: tailoredResume, insights };

    // Cache the result
    cache.set(cacheKey, result, cacheTTL.resumeGeneration);

    await prisma.$transaction([
      prisma.resumeGeneration.create({
        data: {
          jobDescription: sanitizedJobDescription,
          originalResume: sanitizedResume,
          generatedResume: tailoredResume,
          insights: JSON.stringify(insights),
          tone,
          seniority,
          format,
          includeCoverLetter,
          userId: user.id
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          resumeCount: { increment: 1 }
        }
      })
    ]);

    logInfo('Resume generation completed successfully', { 
      userId: user.id, 
      resumeLength: tailoredResume.length,
      matchedKeywordsCount: matchedKeywords.length,
      missingSkillsCount: missingSkills.length
    });

    return res.status(200).json(result);
  } catch (error) {
    logError('Resume generation failed', error as Error, { 
      userId: user.id,
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });
    return res.status(500).json({ error: 'Failed to tailor your resume. Please try again.' });
  }
});
