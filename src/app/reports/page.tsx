// src/app/reports/page.tsx
"use client";

import { useEffect, useState } from "react";

type Report = {
  id: string;
  title?: string | null;
  description?: string | null;
  targetUrl?: string | null;
  targetCanonical?: string | null;
  evidenceCid?: string | null;
  createdAt: string;
};

export default function ReportsFeedPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports/list");
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        // Support both shapes: { reports: [...] } OR [...]
        const arr = Array.isArray(data) ? data : data?.reports ?? [];
        if (mounted) setReports(arr);
      } catch (err) {
        console.error("Error fetching reports", err);
        if (mounted) setReports([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchReports();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading reports...</div>;

  if (!reports.length)
    return (
      <div className="p-6 text-gray-400">
        No reports found. Submit one at{" "}
        <a href="/reports/new" className="text-blue-400 underline">
          /reports/new
        </a>
      </div>
    );

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Latest Reports</h1>
      {reports.map((r) => (
        <div
          key={r.id}
          className="border border-gray-700 rounded-lg p-4 bg-gray-900 shadow-md"
        >
          <h2 className="text-lg font-semibold text-white">
            {r.title || r.targetCanonical || "Untitled Report"}
          </h2>

          <p className="text-sm text-gray-400">
            Target:{" "}
            {r.targetCanonical || r.targetUrl ? (
              <a
                href={r.targetCanonical ?? r.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {r.targetCanonical ?? r.targetUrl}
              </a>
            ) : (
              "—"
            )}
          </p>

          {r.description && <p className="text-gray-300 mt-2">{r.description}</p>}

          {r.evidenceCid && (
            <p className="text-sm mt-2">
              Evidence:{" "}
              <a
                href={`https://ipfs.io/ipfs/${r.evidenceCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline"
              >
                {r.evidenceCid}
              </a>
            </p>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Submitted: {new Date(r.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
