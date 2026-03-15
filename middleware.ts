import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API auth routes
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Check if route is public
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // Get session token (edge-compatible)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/tasks", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
