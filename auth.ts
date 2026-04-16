import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { validateUser } from "@/lib/users";
import { getServerSession } from "next-auth/next";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await validateUser(email, password);

        if (!user) return null;

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};

// Convenience helper used by server components (e.g. `app/page.tsx`).
export function auth() {
  return getServerSession(authOptions);
}