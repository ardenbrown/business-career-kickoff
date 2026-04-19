import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  RESEND_API_KEY: z.string().optional(),
  AUTH_EMAIL_FROM: z.string().default("Business Career Kickoff <noreply@example.com>"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  ADZUNA_APP_ID: z.string().optional(),
  ADZUNA_APP_KEY: z.string().optional(),
  ADZUNA_COUNTRY: z.string().default("us"),
  DEMO_SEED_EMAIL: z.string().default("demo@kickoff.local"),
});

export const env = envSchema.parse({
  DATABASE_URL:
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL,
  AUTH_SECRET: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  AUTH_EMAIL_FROM: process.env.AUTH_EMAIL_FROM,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  ADZUNA_APP_ID: process.env.ADZUNA_APP_ID,
  ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY,
  ADZUNA_COUNTRY: process.env.ADZUNA_COUNTRY,
  DEMO_SEED_EMAIL: process.env.DEMO_SEED_EMAIL,
});
