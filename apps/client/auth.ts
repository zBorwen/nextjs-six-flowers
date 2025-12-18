import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from '@rikka/database';
import { LoginSchema } from '@rikka/shared';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (parsed.success) {
            const { phone, password } = parsed.data;
            const user = await prisma.user.findUnique({
                where: { phone }
            });
            if (!user) return null;
            
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return {
                    id: user.id,
                    name: user.name,
                    score: user.score || 0, // Fallback to 0 if null
                };
            }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
        if (user) {
            token.sub = user.id;
            token.name = user.name;
            token.score = user.score;
        }

        // On every check (Refreshes), fetch fresh data from DB if we have an ID
        // This ensures score is always up to date on page load
        if (token.sub) {
            const freshUser = await prisma.user.findUnique({
                where: { id: token.sub }
            });
            if (freshUser) {
                token.name = freshUser.name;
                token.score = freshUser.score;
            }
        }
        
        if (trigger === "update" && session?.name) {
            token.name = session.name;
        }
        
        return token;
    },
    async session({ session, token }) {
        if (token.sub && session.user) {
            session.user.id = token.sub;
            session.user.score = token.score as number;
        }
        return session;
    }
  },
});
