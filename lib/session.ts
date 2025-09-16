import { IronSessionOptions } from 'iron-session';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD ?? 'complex_password_at_least_32_characters_long',
  cookieName: 'ai-resume-tailor-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production'
  }
};

export interface SessionData {
  userId?: string;
}
