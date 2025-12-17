import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const onDashboard = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/room');
      
      if (onDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
          // Redirect to home if already logged in
          return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.name && session.user) {
          session.user.name = token.name;
      }
      if (typeof token.score === 'number' && session.user) {
          session.user.score = token.score;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
        if (user) {
            token.sub = user.id;
            token.name = user.name;
            token.score = user.score;
        }
        
        if (trigger === "update" && session?.name) {
            token.name = session.name;
        }
        
        // Handle score update if needed via update(), or just rely on re-login/re-fetch?
        // Usually score updates in DB, so we might need a way to refresh it.
        // For now, let's keep it simple.
        
        return token;
    }
  },
  providers: [], 
} satisfies NextAuthConfig;
