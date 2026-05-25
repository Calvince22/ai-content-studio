"use client";

import { useCallback, useState } from "react";

export type GenerateState = {
  result: string | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  remaining: number | null;
  resetIn: number | null;
  isStreaming: boolean;
};

export function useGenerate() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [resetIn, setResetIn] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const generate = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);
    setResult("");
    setFromCache(false);
    setRemaining(null);
    setResetIn(null);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/generate/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          remaining?: number;
          resetIn?: number;
        };

        throw new Error(payload.error ?? "Unable to generate content.");
      }

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Streaming response is unavailable.");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      const parseEventChunk = (chunk: string) => {
        const eventLine = chunk
          .split("\n")
          .find((line) => line.startsWith("event:"));
        const dataLine = chunk
          .split("\n")
          .find((line) => line.startsWith("data:"));

        if (!eventLine || !dataLine) {
          return null;
        }

        const event = eventLine.replace(/^event:\s*/, "").trim();
        const data = dataLine.replace(/^data:\s*/, "").trim();

        return { event, data };
      };

      while (true) {
        const { done, value } = await reader.read();

        buffer += decoder.decode(value, { stream: true });

        let separatorIndex = buffer.indexOf("\n\n");

        while (separatorIndex !== -1) {
          const rawChunk = buffer.slice(0, separatorIndex);
          buffer = buffer.slice(separatorIndex + 2);
          separatorIndex = buffer.indexOf("\n\n");

          const parsed = parseEventChunk(rawChunk);

          if (!parsed) {
            continue;
          }

          const payload = JSON.parse(parsed.data) as {
            text?: string;
            fromCache?: boolean;
            remaining?: number;
            resetIn?: number;
          };

          if (parsed.event === "meta") {
            setFromCache(Boolean(payload.fromCache));
            setRemaining(typeof payload.remaining === "number" ? payload.remaining : null);
            setResetIn(typeof payload.resetIn === "number" ? payload.resetIn : null);
            continue;
          }

          if (parsed.event === "token" && typeof payload.text === "string") {
            fullResponse += payload.text;
            setResult(fullResponse);
            continue;
          }

          if (parsed.event === "done") {
            setResult(fullResponse);
            continue;
          }

          if (parsed.event === "error") {
            throw new Error(payload.text ?? "Unable to generate content.");
          }
        }

        if (done) {
          break;
        }
      }

      if (buffer.trim()) {
        const parsed = parseEventChunk(buffer);

        if (!parsed) {
          throw new Error("Unable to read the streaming response.");
        }

        const payload = JSON.parse(parsed.data) as {
          text?: string;
          fromCache?: boolean;
          remaining?: number;
          resetIn?: number;
        };

        if (parsed.event === "meta") {
          setFromCache(Boolean(payload.fromCache));
          setRemaining(typeof payload.remaining === "number" ? payload.remaining : null);
          setResetIn(typeof payload.resetIn === "number" ? payload.resetIn : null);
        }

        if (parsed.event === "token" && typeof payload.text === "string") {
          fullResponse += payload.text;
        }

        if (parsed.event === "error") {
          throw new Error(payload.text ?? "Unable to generate content.");
        }
      }

      const finalText = fullResponse.trim();
      setResult(finalText || null);
      return {
        response: finalText,
        fromCache,
        remaining,
        resetIn,
      };
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to generate content.";
      setError(message);
      setResult(null);
      throw caughtError;
    } finally {
      setLoading(false);
      setIsStreaming(false);
    }
  }, [fromCache, remaining, resetIn]);

  return {
    result,
    loading,
    error,
    fromCache,
    remaining,
    resetIn,
    isStreaming,
    generate,
  };
}
