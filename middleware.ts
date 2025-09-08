import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Public routes: home, login, gallery, images, assets
  const isPublic = ["/", "/login", "/api/auth"].some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Require auth for app routes under /admin and /employee
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Role-gate admin routes
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/employee", request.url));
  }

  // Role-gate employee routes
  if (pathname.startsWith("/employee") && token.role !== "WORKER" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/api/:path*"],
};


