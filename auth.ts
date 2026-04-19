import NextAuth from "next-auth";
import type { Session } from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

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
