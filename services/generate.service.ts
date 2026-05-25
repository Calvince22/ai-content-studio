import { db } from "@/lib/db";
import { generateContent } from "@/lib/ai";
import { createPromptCacheKey, getCachedResponse, setCachedResponse } from "@/lib/redis";

export async function generateContentWithCache(userId: string, prompt: string) {
  const cacheKey = createPromptCacheKey(prompt);
  const cached = await getCachedResponse(cacheKey);

  if (cached) {
    return {
      response: cached.response,
      fromCache: true,
    };
  }

  const response = await generateContent(prompt);

  await Promise.all([
    setCachedResponse(cacheKey, response),
    db.prompt.create({
      data: {
        content: prompt,
        response,
        userId,
      },
    }),
  ]);

  return {
    response,
    fromCache: false,
  };
}
