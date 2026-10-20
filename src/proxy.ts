import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, isValidSessionToken } from "@/lib/session";

// Runs before every request (except the ones excluded in `matcher` below) and
// sends logged-out visitors to the login page. Server actions and data reads
// check the session again with requireSession(), so the data stays safe even
// if this check is ever skipped.
export function proxy(request: NextRequest) {
  if (isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

// Everything needs the password except the login page, robots.txt, the tab
// icon and Next.js's own files.
export const config = {
  matcher: ["/((?!login|robots\\.txt|icon\\.svg|_next/static|_next/image).*)"],
};
