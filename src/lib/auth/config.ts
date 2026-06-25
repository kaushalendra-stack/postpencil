import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq, or, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, accounts, sessions, verificationTokens } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const identifier = credentials.identifier as string;

        const [user] = await db
          .select()
          .from(users)
          .where(or(eq(users.email, identifier), eq(users.username, identifier)))
          .limit(1);

        if (!user || !user.password) return null;
        if (user.isBanned) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;
      if (account.provider === 'credentials') {
        return true;
      }
      if (!user?.email) return false;

      // Check if user already exists with this email
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (existingUser) {
        // Check if this OAuth account is already linked
        const [existingAccount] = await db
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.provider, account.provider),
              eq(accounts.providerAccountId, account.providerAccountId)
            )
          )
          .limit(1);

        if (!existingAccount) {
          // Link OAuth account to existing user
          await db.insert(accounts).values({
            id: randomUUID(),
            userId: existingUser.id,
            type: 'oauth',
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          });
        }

        // Update user's provider info and image
        await db
          .update(users)
          .set({
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            image: user.image || existingUser.image,
            emailVerified: existingUser.emailVerified || new Date(),
          })
          .where(eq(users.id, existingUser.id));

      } else {
        // Create new user
        const name = user.name || user.email.split('@')[0];
        const baseUsername = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
        let username = baseUsername;
        let counter = 1;

        while (true) {
          const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
          if (!existing) break;
          username = `${baseUsername}${counter}`;
          counter++;
        }

        const [newUser] = await db.insert(users).values({
          id: user.id as string,
          name: name as string,
          username,
          email: user.email,
          image: user.image || null,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          emailVerified: new Date(),
        }).$returningId();

        if (newUser) {
          sendEmail({
            to: user.email,
            type: 'welcome',
            name: name as string,
            purpose: 'welcome',
            logUserId: user.id as string,
          }).catch(console.error);
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account) token.provider = account.provider;
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        const [dbUser] = await db.select().from(users).where(eq(users.id, token.id as string)).limit(1);
        if (dbUser) {
          session.user.name = dbUser.name ?? session.user.name;
          session.user.email = dbUser.email ?? session.user.email;
          session.user.image = dbUser.image ?? session.user.image;
          (session.user as any).username = dbUser.username;
          (session.user as any).role = dbUser.role;
          (session.user as any).provider = dbUser.provider;
          (session.user as any).isBanned = dbUser.isBanned;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
