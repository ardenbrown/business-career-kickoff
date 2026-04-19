import NextAuth from "next-auth";
import type { Session } from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

function normalizeRuntimeUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

const normalizedAuthUrl =
  normalizeRuntimeUrl(process.env.AUTH_URL) ??
  normalizeRuntimeUrl(process.env.AUTHJS_URL) ??
  normalizeRuntimeUrl(process.env.NEXTAUTH_URL) ??
  normalizeRuntimeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeRuntimeUrl(process.env.VERCEL_URL);

if (normalizedAuthUrl) {
  process.env.AUTH_URL = normalizedAuthUrl;
  process.env.AUTHJS_URL = normalizedAuthUrl;
  process.env.NEXTAUTH_URL = normalizedAuthUrl;
}

const initAuth = NextAuth as unknown as (config: any) => {
  handlers: any;
  auth: any;
  signIn: any;
  signOut: any;
};

export const { handlers, auth, signIn, signOut } = initAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/sign-in",
    verifyRequest: "/auth/verify",
  },
  providers: [
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.AUTH_EMAIL_FROM,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: { sub?: string; id?: string }; user?: { id: string } }) => {
      if (user?.id) {
        token.id = user.id;
      }

      return token;
    },
    session: async ({
      session,
      user,
      token,
    }: {
      session: Session;
      user?: { id: string };
      token?: { sub?: string; id?: string };
    }) => {
      if (session.user) {
        session.user.id = user?.id ?? token?.id ?? token?.sub ?? "";
      }

      return session;
    },
  },
});
