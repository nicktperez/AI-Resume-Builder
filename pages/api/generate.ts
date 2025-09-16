import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { withSessionRoute } from '../../lib/withSession';

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

  const { jobDescription, resume, tone, seniority, format, includeCoverLetter } = parse.data;

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `You are an expert resume writer. Rewrite the following resume so it is perfectly tailored for the job description.\n\nJob description:\n${jobDescription}\n\nCandidate resume:\n${resume}\n\nPersonalization targets:\n- ${toneGuidance[tone]}\n- ${seniorityGuidance[seniority]}\n- ${formatGuidance[format]}\n\nRewrite requirements:\n- Mirror the most important keywords, tools, and priorities from the job description.\n- Use Markdown with clear section headings: Summary, Experience, Skills, Education.\n- Keep bullet points concise, achievement-focused, and supported by metrics when possible.\n- Maintain ATS-friendly formatting with consistent spacing and capitalization.\n${includeCoverLetter ? '- After the resume, add a new section titled "## Cover Letter" with 2-3 short paragraphs that extend the same tone and connect the candidate to the role.\n' : '- Do not include a cover letter or mention one unless explicitly asked.\n'}- Ensure the final document reads cohesively and feels written by one person.`;

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      input: prompt,
      temperature: 0.7,
      max_output_tokens: 1400
    });

    const result = response.output_text?.trim();

    if (!result) {
      return res.status(500).json({ error: 'The AI response was empty. Please try again.' });
    }

    await prisma.$transaction([
      prisma.resumeGeneration.create({
        data: {
          jobDescription,
          originalResume: resume,
          generatedResume: result,
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

    return res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to tailor your resume. Please try again.' });
  }
});
