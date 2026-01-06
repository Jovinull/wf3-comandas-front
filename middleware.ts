import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Cookies setados pelo client no login (UX guard)
  const auth = req.cookies.get("wf3_auth")?.value === "1";
  const role = req.cookies.get("wf3_role")?.value; // MANAGER | WAITER

  if (pathname.startsWith("/login")) {
    if (auth && role) {
      const url = req.nextUrl.clone();
      url.pathname =
        role === "MANAGER" ? "/admin/dashboard" : "/operational/overview";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!auth || role !== "MANAGER") return redirectToLogin(req);
    return NextResponse.next();
  }

  if (pathname.startsWith("/operational")) {
    if (!auth || (role !== "MANAGER" && role !== "WAITER"))
      return redirectToLogin(req);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/operational/:path*", "/login"],
};
