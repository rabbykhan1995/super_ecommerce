import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  if (pathname.startsWith("/user") || pathname.startsWith("/cart") || pathname.startsWith("/checkout")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/get-profile`,
        {
          method: "GET",
          headers: {
            cookie: `token=${token}`,
          },
        },
      );

      if (!response.ok) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const data = await response.json();
      if (!data.success) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/cart", "/checkout"],
};
