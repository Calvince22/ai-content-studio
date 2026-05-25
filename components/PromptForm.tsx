"use client";

import { FormEvent, useState } from "react";

export type PromptFormProps = {
  onSubmit: (prompt: string) => Promise<void>;
  loading?: boolean;
};

export function PromptForm({ onSubmit, loading = false }: PromptFormProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim() || loading) {
      return;
    }

    const nextPrompt = prompt.trim();
    setPrompt("");

    await onSubmit(nextPrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-200">
        Prompt
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Write a concise launch summary for a new yoga app..."
          rows={6}
          className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
        />
      </label>

      <button
        type="submit"
        disabled={loading || !prompt.trim()}
        className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        {loading ? "Generating..." : "Generate content"}
      </button>
    </form>
  );
}
