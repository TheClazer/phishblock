// src/app/layout.tsx
import "./globals.css";
import React from "react";
import Providers from "@/components/Providers";

const bodyClass = `${""} antialiased`; // paste your font variables here if you used them

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={bodyClass} data-ssr-class={bodyClass}>
        {/* Providers is a client component (wraps SessionProvider and runs CleanBodyAttributes) */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
