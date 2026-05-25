import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { setAuthCookie, signToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseBody } from "@/lib/validate";
import { loginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = parseBody(loginSchema, body);

    const user = await db.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(parsed.password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await signToken({ id: user.id, email: user.email });
    const response = NextResponse.json({
      user: { id: user.id, email: user.email },
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log in.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
