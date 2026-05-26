import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("elphex-session")?.value;
  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = ["/", "/tasks", "/focus", "/sprints", "/store", "/leaderboard", "/payment"];
  
  // Auth pages
  const authPaths = ["/login", "/register", "/verify"];

  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
  const isAuthPage = authPaths.some(path => pathname === path || pathname.startsWith(path + "/"));

  // Exclude API routes and public static files
  if (pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (!sessionId && isProtected) {
    // Redirect unauthenticated user to login page
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (sessionId && isAuthPage) {
    // Redirect authenticated user to dashboard/home page
    const dashboardUrl = new URL("/", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Config to specify matchers
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
