"use client";

import { useCallback, useEffect, useState } from "react";

export type HistoryPrompt = {
  id: string;
  content: string;
  response: string;
  createdAt: string;
};

export function useHistory() {
  const [prompts, setPrompts] = useState<HistoryPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/history", {
        method: "GET",
        credentials: "same-origin",
      });

      if (!response.ok) {
        setPrompts([]);
        return;
      }

      const payload = (await response.json()) as { prompts: HistoryPrompt[] };
      setPrompts(payload.prompts ?? []);
    } catch {
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePrompt = useCallback(
    async (promptId: string) => {
      const response = await fetch("/api/history", {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promptId }),
      });

      if (!response.ok) {
        throw new Error("Unable to delete prompt.");
      }

      await fetchHistory();
    },
    [fetchHistory],
  );

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return {
    prompts,
    loading,
    fetchHistory,
    deletePrompt,
  };
}
