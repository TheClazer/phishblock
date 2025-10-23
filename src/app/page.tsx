"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold mb-4">PhishBlock — Report phishing, fast</h1>
        <p className="mb-6 text-gray-300">
          Submit phishing reports and pin evidence to InterPlanetary File System (IPFS).
        </p>

        <div className="flex gap-4 mb-8">
          <Link
            href="/reports/new"
            className="inline-block bg-green-600 text-black px-4 py-2 rounded font-semibold"
          >
            Submit a report
          </Link>

          <Link
            href="/reports"
            className="inline-block border border-gray-600 px-4 py-2 rounded text-gray-200"
          >
            View reports feed
          </Link>
        </div>

        <section className="text-sm text-gray-400">
          <p>
            Dev notes: Logged-in users can create reports. The feed lists reports and links to IPFS evidence CIDs.
          </p>
        </section>
      </div>
    </main>
  );
}
