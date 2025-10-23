// src/components/CleanBodyAttributes.tsx
"use client";
import { useEffect } from "react";

/**
 * Runs only on client mount.
 * 1) cleans known extension-injected attributes
 * 2) reconciles the body class with the server-side class recorded in data-ssr-class
 */
export default function CleanBodyAttributes() {
  useEffect(() => {
    try {
      const body = document.body;
      if (!body) return;

      // 1) Remove extension attributes that commonly cause mismatch
      const ATTRS_TO_REMOVE = [
        "data-new-gr-c-s-check-loaded",
        "data-gr-ext-installed",
        "data-gramm",
        "data-gramm_editor",
        "data-gramm_id",
        "data-reactroot", // not removed by default; added if necessary
      ];
      for (const a of ATTRS_TO_REMOVE) {
        if (body.hasAttribute(a)) body.removeAttribute(a);
      }

      // 2) Reconcile classes: ensure client body class equals server-rendered value
      const ssrClass = body.getAttribute("data-ssr-class") || "";
      const clientClass = body.className || "";

      if (ssrClass !== "" && clientClass !== ssrClass) {
        // Force the body class to the server-rendered class so React's hydration matches.
        // This prevents the hydration mismatch error while preserving server semantics.
        body.className = ssrClass;
      }

      // Optionally remove the data attribute after reconciling
      body.removeAttribute("data-ssr-class");
    } catch (err) {
      // non-fatal — log for debugging
      console.error("CleanBodyAttributes error:", err);
    }
  }, []);

  return null;
}
