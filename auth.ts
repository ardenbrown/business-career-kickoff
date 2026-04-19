import NextAuth from "next-auth";
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
    strategy: "database",
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
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
});
