// phishblock/src/components/Providers.tsx
"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import CleanBodyAttributes from "./CleanBodyAttributes";

/**
 * Client-side wrapper to provide session/context and run client-only effects.
 * Keep this file minimal — import it from the server layout.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CleanBodyAttributes />
      {children}
    </SessionProvider>
  );
}
