// phishblock/src/pages/_app.tsx
// Wrap the app in NextAuth's SessionProvider so useSession() works anywhere.
// Also render the global Navbar (which imports the AuthButton).
//
// Expands acronyms: Open Authorization (OAuth), Application Programming Interface (API),
// InterPlanetary File System (IPFS), PostgreSQL (Postgres), JSON Web Token (JWT)

import React from "react";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import Navbar from "../components/Navbar"; // exact path from src/pages/_app.tsx -> src/components/Navbar
import "../styles/globals.css"; // optional: remove if you don't have this file

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Navbar />
      <main className="min-h-screen">
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
