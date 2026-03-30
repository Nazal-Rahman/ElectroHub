import { NextRequest, NextResponse } from "next/server";
import { adminCookieName, verifyAdminCookieValue } from "./lib/auth/adminCookie";

async function isAdminAuthed(req: NextRequest) {
  const cookie = req.cookies.get(adminCookieName())?.value;
  if (!cookie) return false;
  return verifyAdminCookieValue(cookie);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await isAdminAuthed(req);

  // Protect admin pages (except the login page itself).
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!authed) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protect project creation only (public read endpoints stay open).
  if (pathname === "/api/projects" && req.method === "POST") {
    if (!authed) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/projects"],
};

