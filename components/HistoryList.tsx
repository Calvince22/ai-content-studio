"use client";

import { HistoryPrompt } from "@/hooks/useHistory";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { SkeletonCard } from "@/components/SkeletonCard";

export type HistoryListProps = {
  prompts: HistoryPrompt[];
  loading?: boolean;
  onDelete: (promptId: string) => Promise<void>;
};

export function HistoryList({ prompts, loading = false, onDelete }: HistoryListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prompts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-sm text-slate-400">
          Your generation history will appear here.
        </div>
      ) : null}

      {prompts.map((prompt) => (
        <article
          key={prompt.id}
          className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-4"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-100">{prompt.content}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(prompt.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void onDelete(prompt.id)}
              className="rounded-full border border-rose-500/50 px-3 py-1 text-xs font-semibold text-rose-200"
            >
              Delete
            </button>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-4">
            <MarkdownRenderer content={prompt.response} />
          </div>
        </article>
      ))}
    </div>
  );
}
