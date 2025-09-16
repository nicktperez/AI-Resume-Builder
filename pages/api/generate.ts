import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { withSessionRoute } from '../../lib/withSession';

const schema = z.object({
  jobDescription: z.string().min(20, 'Please provide a detailed job description.'),
  resume: z.string().min(50, 'Please paste the full text of your resume.')
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

  const { jobDescription, resume } = parse.data;

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `You are an expert resume writer. Rewrite the following resume so it is perfectly tailored for the job description.\n\nJob description:\n${jobDescription}\n\nCandidate resume:\n${resume}\n\nRewrite the resume to:\n- Mirror the tone and language of the job post\n- Highlight the most relevant experiences, metrics, and keywords\n- Keep a professional, ATS-friendly structure\n- Output in Markdown with clear section headings (Summary, Experience, Skills, Education)\n`;

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
