import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { setAuthCookie, signToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseBody } from "@/lib/validate";
import { signupSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = parseBody(signupSchema, body);

    const existingUser = await db.user.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const password = await bcrypt.hash(parsed.password, 12);

    const user = await db.user.create({
      data: {
        email: parsed.email,
        password,
      },
    });

    const token = await signToken({ id: user.id, email: user.email });
    const response = NextResponse.json({
      user: { id: user.id, email: user.email },
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign up.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
