import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Middleware(Now called Proxy) to protect routes and ensure user is authenticated
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // If no session exists, redirect to login page
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
// Apply this middleware/proxy to all routes except for the specified ones
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|forgot-password|reset-password).*)",
  ],
};
