// pages/protected-client.tsx
import React, { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

export default function ProtectedClient() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") signIn("github");
  }, [status]);

  if (status === "loading") return <div>Loading…</div>;
  if (!session) return <div>Redirecting to sign in…</div>;

  return <div>Protected content for {(session.user as any)?.username}</div>;
}
