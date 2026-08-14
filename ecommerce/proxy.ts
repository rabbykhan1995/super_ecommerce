import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/user") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/cart", "/checkout"],
};