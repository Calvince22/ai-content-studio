"use client";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Loader } from "@/components/Loader";

export type ResponseCardProps = {
  response: string | null;
  loading?: boolean;
  fromCache?: boolean;
  error?: string | null;
  remaining?: number | null;
  resetIn?: number | null;
  isStreaming?: boolean;
};

export function ResponseCard({
  response,
  loading = false,
  fromCache = false,
  error = null,
  remaining,
  resetIn,
  isStreaming = false,
}: ResponseCardProps) {
  const copyResponse = async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5 shadow-2xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">
            Generated response
          </p>

          <p className="text-xs text-slate-400">
            {isStreaming
              ? "Streaming in real time"
              : "Ready to review"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {fromCache && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              Cached
            </span>
          )}

          {typeof remaining === "number" && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
              {remaining} remaining • resets in {resetIn ?? 0}s
            </span>
          )}

          <button
            type="button"
            disabled={!response}
            onClick={() => void copyResponse()}
            className="rounded-full border border-cyan-400 px-3 py-1 text-xs font-semibold text-cyan-200 disabled:opacity-50"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {/* Streaming loader */}
      {(loading || isStreaming) && (
        <div className="mb-4 space-y-3 py-3 text-center">
          <Loader />
          <p className="text-sm text-slate-300">
            The model is preparing your response...
          </p>
        </div>
      )}

      {/* Actual response */}
      {response?.trim() && (
        <div className="rounded-2xl bg-slate-950/80 p-4">
          <MarkdownRenderer content={response} />
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !isStreaming &&
        !error &&
        !response?.trim() && (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-10 text-center text-sm text-slate-400">
            Create a prompt to generate a fresh response.
          </div>
        )}
    </div>
  );
}