// pages/api/auth/[...nextauth].ts
// NextAuth.js (Next Authentication) route that uses GitHub Open Authorization (OAuth)
// and upserts into our Prisma `User` table on sign-in.
// We intentionally do NOT use the Prisma adapter here so we can keep your
// existing Prisma schema (User, Report, Vote, Audit, Validator) unchanged.

// Expand acronyms every time: Open Authorization (OAuth), Application Programming Interface (API), InterPlanetary File System (IPFS), PostgreSQL (Postgres)

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "../../../../lib/prisma";



/**
 * Helper to build a stable `oauthId` string for the User table.
 * Format: "<provider>-<providerUserId>" e.g. "github-1234567"
 *
 * Storing oauthProvider separate from oauthId keeps things explicit:
 * - oauthProvider: "github"
 * - oauthId: "github-1234567" (or you can use only providerUserId)
 *
 * NOTE: If you seeded custom oauthId values (like "github-admin-01"),
 * they will not automatically match real GitHub accounts. For demo seeds,
 * keep that in mind.
 */
function makeOauthId(provider: string, providerId: string | number) {
  return `${provider}-${providerId}`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      // Optionally request additional GitHub scopes if you need them:
      // scope: "read:user user:email"
    }),
  ],

  // Use JWT sessions (no server DB sessions required for now).
  session: {
    strategy: "jwt",
  },

  // Secret used to sign cookies and JWTs
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    /**
     * jwt callback runs whenever a token is created or updated.
     * We copy basic profile info into the token so the frontend can use it.
     */
    async jwt({ token, account, profile }) {
      // On first sign in, NextAuth provides `account` and `profile`.
      if (account && profile) {
        const provider = account.provider; // 'github'
        const providerId = (profile as any).id ?? (profile as any).node_id;
        token.provider = provider;
        token.providerId = String(providerId);
        token.oauthId = makeOauthId(provider, providerId);

        // Save some profile fields in token for quick access
        token.username = (profile as any).login ?? (profile as any).name ?? token.username;
        token.email = (profile as any).email ?? token.email;
        token.avatar = (profile as any).avatar_url ?? token.avatar;
      }
      return token;
    },

    /**
     * session callback attaches properties from the token to the session object
     * returned to the client via `useSession()` or `/api/auth/session`.
     */
    async session({ session, token }) {
      // Copy fields we stored in the token
      (session as any).user = {
        ...session.user,
        id: token.oauthId ?? (session.user?.email ?? null),
        oauthId: token.oauthId ?? null,
        provider: token.provider ?? null,
        username: token.username ?? session.user?.name ?? null,
        avatar: token.avatar ?? session.user?.image ?? null,
        email: token.email ?? session.user?.email ?? null,
      };
      return session;
    },
  },

  events: {
    /**
     * signIn event fires after a successful sign-in.
     * We'll upsert the user into our Prisma `User` table so your app
     * always has a corresponding row that matches our schema:
     * User { id, oauthProvider, oauthId, username, email, avatarUrl, reputation, createdAt }
     *
     * We use `oauthId` = "<provider>-<providerUserId>" to avoid collisions
     * and to keep the seeded users / production accounts consistent.
     */
    async signIn({ user, account, profile, isNewUser }) {
      try {
        const provider = (account?.provider as string) ?? "unknown";
        const providerId = (profile as any)?.id ?? (profile as any)?.node_id ?? null;
        const oauthId = makeOauthId(provider, providerId ?? user?.id ?? "unknown");

        // Pull fields from profile or user
        const username =
          (profile as any)?.login ??
          (profile as any)?.name ??
          user?.name ??
          `user-${Math.floor(Math.random() * 100000)}`;

        const email = (profile as any)?.email ?? user?.email ?? null;
        const avatarUrl = (profile as any)?.avatar_url ?? (user as any)?.image ?? null;

        // Upsert into our `User` table
        await prisma.user.upsert({
          where: { oauthId },
          update: {
            username,
            email,
            avatarUrl,
            oauthProvider: provider,
            // keep reputation unchanged on update
          },
          create: {
            oauthProvider: provider,
            oauthId,
            username,
            email,
            avatarUrl,
            // reputation default is 0 in your Prisma schema
          },
        });
      } catch (err) {
        console.error("Error upserting user into Prisma User table on signIn:", err);
        // Do not throw — sign-in should succeed even if our bookkeeping fails.
      }
    },
  },

  // Optional: custom pages (uncomment and create pages if you want)
  // pages: {
  //   signIn: '/auth/signin',
  //   signOut: '/auth/signout',
  //   error: '/auth/error',
  // },

  // Debug during development
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
