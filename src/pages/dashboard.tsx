// pages/dashboard.tsx
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import React from "react";

type Props = {
  user: {
    id?: string;
    username?: string;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
};

export default function Dashboard({ user }: Props) {
  if (!user) return <div>Redirecting to sign in…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl">Dashboard</h1>
      <p>Signed in as: {user.username ?? user.email}</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: { destination: "/api/auth/signin", permanent: false },
    };
  }

  const user = {
    id: (session.user as any)?.id ?? null,
    username: (session.user as any)?.username ?? null,
    email: (session.user as any)?.email ?? null,
    avatarUrl: (session.user as any)?.avatar ?? null,
  };

  return { props: { user } };
};
