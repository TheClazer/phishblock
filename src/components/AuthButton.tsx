// components/AuthButton.tsx
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

/**
 * Sign-in / Sign-out button.
 * Uses NextAuth's client helpers and shows current user briefly.
 *
 * Expands: Open Authorization (OAuth), Application Programming Interface (API),
 * InterPlanetary File System (IPFS), PostgreSQL (Postgres), JSON Web Token (JWT)
 */

export default function AuthButton(): JSX.Element {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button className="px-3 py-1 rounded bg-gray-200">Loading...</button>;
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn("github")}
        className="px-3 py-1 rounded bg-black text-white"
        aria-label="Sign in with GitHub"
      >
        Sign in with GitHub
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={(session.user as any)?.avatar ?? (session.user as any)?.image ?? "/favicon.ico"}
        alt="avatar"
        className="w-8 h-8 rounded-full"
      />
      <span>{(session.user as any)?.username ?? (session.user as any)?.name ?? "User"}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="px-2 py-1 rounded border"
      >
        Sign out
      </button>
    </div>
  );
}
