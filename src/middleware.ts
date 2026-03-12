import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limiter";
import { securityHeaders } from "./lib/security-headers";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers
  const response = NextResponse.next();
  securityHeaders(response);

  // Rate limiting
  const rateLimitResult = await rateLimit(request);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later."
      },
      { status: 429 }
    );
  }

  // Debug endpoint protection - disable in production
  if (process.env.NODE_ENV === 'production') {
    if (pathname.startsWith('/api/debug/')) {
      return NextResponse.json(
        {
          error: "Endpoint not found",
          message: "Debug endpoints are disabled in production"
        },
        { status: 404 }
      );
    }
  }

  // Allow access to auth pages, API routes, and static files
  if (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // For now, we'll handle admin protection at the page level
  // The dashboard redirect logic will handle routing
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
