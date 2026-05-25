import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { generateSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/redis";
import { generateContentWithCache } from "@/services/generate.service";

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

  try {
    const body = await request.json().catch(() => null);
    const parsed = parseBody(generateSchema, body);
    const result = await generateContentWithCache(user.id, parsed.prompt);

    return NextResponse.json({
      response: result.response,
      fromCache: result.fromCache,
      remaining: rate.remaining,
      resetIn: rate.resetIn,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate content.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
