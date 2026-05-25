import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
];

const AUTH_COOKIE = "auth_token";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "development-secret",
);

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));
    requestHeaders.set("x-user-email", String(payload.email ?? ""));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));

    response.cookies.delete(AUTH_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
