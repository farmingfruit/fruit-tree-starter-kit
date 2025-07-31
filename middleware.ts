import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  
  // Check for development mode bypass
  const isDevMode = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  const hasDevSession = request.cookies.get('dev-session')?.value === 'true';

  // /api/payments/webhooks is a webhook endpoint that should be accessible without authentication
  if (pathname.startsWith("/api/payments/webhooks")) {
    return NextResponse.next();
  }

  // Check if user has valid session (real or dev)
  const hasValidSession = sessionCookie || (isDevMode && hasDevSession);

  if (hasValidSession && ["/sign-in", "/sign-up"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!hasValidSession && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
