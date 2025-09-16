import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { withSessionRoute } from '../../lib/withSession';

const schema = z.object({
  jobDescription: z.string().min(20, 'Please provide a detailed job description.'),
  resume: z.string().min(50, 'Please paste the full text of your resume.')
});

interface TailoringPayload {
  tailoredResume: string;
  matchedKeywords?: unknown;
  missingSkills?: unknown;
  suggestedImprovements?: unknown;
}

interface TailoringInsights {
  matchedKeywords: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
}

const toStringArray = (value: unknown): string[] => {
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

export default withSessionRoute(async function generateRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: parse.error.errors[0]?.message || 'Invalid request body' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key is not configured.' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user) {
    await req.session.destroy();
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!user.isPro && user.resumeCount >= 2) {
    return res.status(402).json({ error: 'Upgrade to Pro for unlimited resumes.' });
  }

  const { jobDescription, resume } = parse.data;

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.7,
      max_output_tokens: 1600,
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
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text:
                'You are an expert resume writer. Always respond with valid JSON that matches the provided schema. The tailored resume must be concise, achievement-focused, and formatted in Markdown so it can be pasted directly into an ATS.'
            }
          ]
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Job description:\n${jobDescription}`
            },
            {
              type: 'text',
              text: `Candidate resume:\n${resume}`
            },
            {
              type: 'text',
              text:
                'Rewrite the resume so it mirrors the tone and language of the job post, highlights the most relevant experiences with metrics, and keeps a professional, ATS-friendly structure with clear Summary, Experience, Skills, and Education sections.'
            },
            {
              type: 'text',
              text:
                'Also identify which keywords from the job description are reflected in the rewrite, which skills are still missing, and provide practical suggestions the candidate can act on to further tailor the resume.'
            }
          ]
        }
      ]
    });

    const rawOutput = response.output_text?.trim();

    if (!rawOutput) {
      return res.status(500).json({ error: 'The AI response was empty. Please try again.' });
    }

    let payload: TailoringPayload;
    try {
      payload = JSON.parse(rawOutput) as TailoringPayload;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response', parseError, rawOutput);
      return res.status(500).json({ error: 'The AI response was invalid. Please try again.' });
    }

    const tailoredResume = typeof payload.tailoredResume === 'string' ? payload.tailoredResume.trim() : '';

    if (!tailoredResume) {
      return res.status(500).json({ error: 'The AI response was invalid. Please try again.' });
    }

    const insights: TailoringInsights = {
      matchedKeywords: toStringArray(payload.matchedKeywords),
      missingSkills: toStringArray(payload.missingSkills),
      suggestedImprovements: toStringArray(payload.suggestedImprovements)
    };

    await prisma.$transaction([
      prisma.resumeGeneration.create({
        data: {
          jobDescription,
          originalResume: resume,
          generatedResume: tailoredResume,
          insights: JSON.stringify(insights),
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

    return res.status(200).json({ result: tailoredResume, insights });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to tailor your resume. Please try again.' });
  }
});
