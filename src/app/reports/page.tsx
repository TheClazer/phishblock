// src/app/reports/new/page.tsx
"use client";

import React, { useState } from "react";

/**
 * Minimal client page for submitting a report.
 * - Declares all state variables (including `title`) so "title is not defined" stops.
 * - Robust handleSubmit: prints server responses to console and shows user-friendly messages.
 * - Uses window.location.href for redirect (safe fallback).
 */

export default function NewReportPageClient() {
  // REQUIRED state variables used by the form and submit handler
  const [title, setTitle] = useState(""); // <--- this fixes "title is not defined"
  const [targetUrl, setTargetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, targetUrl, evidenceUrl }),
      });

      // Defensive parse
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        data = { ok: res.ok, text };
      }

      if (!res.ok) {
        console.error("Server returned error:", res.status, data);
        setMessage(data?.error ?? data?.text ?? `Server error: ${res.status}`);
        return;
      }

      console.log("Create report response:", data);
      setMessage("Report submitted! Redirecting...");
      setTimeout(() => {
        // safe redirect (works whether you're using App Router or Pages Router)
        window.location.href = "/";
      }, 900);
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setMessage(`Network / fetch error: ${err?.message ?? String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Submit a Report</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <div className="font-medium">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded p-2"
            placeholder="Short title (e.g., 'Phishing landing page for bank X')"
          />
        </label>

        <label className="block">
          <div className="font-medium">Target URL</div>
          <input
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            required
            type="url"
            className="w-full border rounded p-2"
            placeholder="https://short.url/abc or https://example.com/phish"
          />
        </label>

        <label className="block">
          <div className="font-medium">Description (optional)</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded p-2"
            rows={4}
            placeholder="What did you notice? forms? suspicious domain? etc."
          />
        </label>

        <label className="block">
          <div className="font-medium">Evidence URL (optional)</div>
          <input
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            type="url"
            className="w-full border rounded p-2"
            placeholder="Link to an image or screenshot hosted elsewhere"
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>

        {message && <div className="mt-2 text-sm">{message}</div>}
      </form>
    </div>
  );
}
