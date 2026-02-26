"use client";

import { useState } from "react";
import { EnrichmentData } from "@/types";

interface EnrichButtonProps {
  domain: string;
  onEnrich: (data: EnrichmentData) => void;
  variant?: "primary" | "secondary";
  // optional callback to notify parent of loading state
  onLoading?: (loading: boolean) => void;
}

export default function EnrichButton({ domain, onEnrich, variant = "primary" }: EnrichButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnrich = async () => {
    setLoading(true);
    setError(null);
    if (onLoading) onLoading(true);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        throw new Error("Failed to enrich company");
      }

      const data = await response.json();
      onEnrich(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      if (onLoading) onLoading(false);
    }
  };

  if (variant === "secondary") {
    return (
      <button
        onClick={handleEnrich}
        disabled={loading}
        className="btn-secondary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Re-enrich...
          </span>
        ) : (
          "Re-enrich from website"
        )}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleEnrich}
        disabled={loading}
        className="btn-primary flex items-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enriching...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Enrich with AI
          </>
        )}
      </button>
      {error && (
        <p className="text-error text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
