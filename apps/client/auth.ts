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
});
