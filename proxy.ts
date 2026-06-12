import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifyAdminToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const isAuth = token ? await verifyAdminToken(token) : false;

  if (!isAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
