// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  let user: any = null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/get-profile`,
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

    if (data.success) {
      // ✅ correct check
      user = data.data;
    }
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ ADMIN ROUTE
  if (pathname.startsWith("/admin")) {
    if (!user.admin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ✅ USER ROUTE (non-admin only)
  if (pathname.startsWith("/user")) {
    if (user.admin) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

// Apply middleware only to /admin and /user routes
export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
