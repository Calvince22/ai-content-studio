import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { deletePromptSchema } from "@/lib/validations";
import { deleteUserPrompt, getUserPrompts } from "@/services/history.service";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prompts = await getUserPrompts(user.id);

  return NextResponse.json({ prompts });
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = parseBody(deletePromptSchema, body);
    const prompt = await deleteUserPrompt(user.id, parsed.promptId);

    return NextResponse.json({ prompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete prompt.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
