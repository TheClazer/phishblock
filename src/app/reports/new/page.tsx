"use client";
import React, { useState } from "react";

export default function NewReportPage() {
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // <- absolutely required
    if (submitting) return;
    setSubmitting(true);
    setStatus("Submitting...");

    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetUrl,
          description,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Create report failed", data);
        setStatus(`Error: ${data?.error ?? "Failed to create report"}`);
        setSubmitting(false);
        return;
      }

      setStatus("Report submitted! Redirecting to feed...");
      // small delay so the user sees the success message
      setTimeout(() => {
        window.location.href = "/reports";
      }, 700);
    } catch (err) {
      console.error(err);
      setStatus("Network error while submitting report");
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Submit a Report</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Short title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="url"
          placeholder="Target URL (required)"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          required
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
        />
        <div>
          <button
            type="submit"           // <- ensure button type is "submit"
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>

      {status && <p className="mt-4 text-sm text-gray-300">{status}</p>}
    </div>
  );
}
