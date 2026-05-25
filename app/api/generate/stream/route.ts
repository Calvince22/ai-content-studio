import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPromptCacheKey, getCachedResponse, rateLimit, setCachedResponse } from "@/lib/redis";
import { parseBody } from "@/lib/validate";
import { generateSchema } from "@/lib/validations";
import { streamContent } from "@/lib/ai";

function sendEvent(controller: ReadableStreamDefaultController<Uint8Array>, event: string, payload: unknown) {
  const encoder = new TextEncoder();
  const body = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  controller.enqueue(encoder.encode(body));
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await rateLimit(user.id, 10, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded.",
        remaining: rate.remaining,
        resetIn: rate.resetIn,
      },
      { status: 429 },
    );
  }

  let parsed: { prompt: string };

  try {
    const body = await request.json().catch(() => null);
    parsed = parseBody(generateSchema, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to parse prompt.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const cacheKey = createPromptCacheKey(parsed.prompt);
  const cached = await getCachedResponse(cacheKey);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (cached) {
          sendEvent(controller, "meta", {
            fromCache: true,
            remaining: rate.remaining,
            resetIn: rate.resetIn,
          });

          for (const character of cached.response) {
            sendEvent(controller, "token", { text: character });
          }

          sendEvent(controller, "done", { ok: true });
          controller.close();
          return;
        }

        sendEvent(controller, "meta", {
          fromCache: false,
          remaining: rate.remaining,
          resetIn: rate.resetIn,
        });

        let fullResponse = "";

        for await (const token of streamContent(parsed.prompt)) {
          fullResponse += token;
          sendEvent(controller, "token", { text: token });
        }

        await Promise.all([
          setCachedResponse(cacheKey, fullResponse),
          db.prompt.create({
            data: {
              content: parsed.prompt,
              response: fullResponse,
              userId: user.id,
            },
          }),
        ]);

        sendEvent(controller, "done", { ok: true });
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to generate content.";
        sendEvent(controller, "error", { text: message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
