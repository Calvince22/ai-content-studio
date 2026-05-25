"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { HistoryList } from "@/components/HistoryList";
import { PromptForm } from "@/components/PromptForm";
import { ResponseCard } from "@/components/ResponseCard";
import { useAuth } from "@/hooks/useAuth";
import { useGenerate } from "@/hooks/useGenerate";
import { useHistory } from "@/hooks/useHistory";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { prompts, loading: historyLoading, fetchHistory, deletePrompt } = useHistory();
  const { result, loading, error, fromCache, remaining, resetIn, isStreaming, generate } =
    useGenerate();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  if (authLoading || !user) {
    return null;
  }

  const handleGenerate = async (prompt: string) => {
    await generate(prompt);
    await fetchHistory();
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#111827,_#020617_60%)] text-slate-100">
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">AI Content Studio</p>
            <p className="text-xs text-slate-400">Production-ready content generation</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-100">{user.email}</p>
              <p className="text-xs text-slate-400">Authenticated session</p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              New generation
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Create polished content in seconds.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Draft marketing copy, product summaries, and campaign ideas with streaming AI responses,
              Redis caching, and persistent history.
            </p>
          </div>

          <PromptForm onSubmit={handleGenerate} loading={loading || isStreaming} />

          <ResponseCard
            response={result}
            loading={loading}
            fromCache={fromCache}
            error={error}
            remaining={remaining}
            resetIn={resetIn}
            isStreaming={isStreaming}
          />
        </section>

        <section className="space-y-4">
          <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              History
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Review previous prompts and responses, or delete any entry you no longer need.
            </p>
          </div>

          <HistoryList
            prompts={prompts}
            loading={historyLoading}
            onDelete={async (promptId) => {
              await deletePrompt(promptId);
            }}
          />
        </section>
      </main>
    </div>
  );
}
