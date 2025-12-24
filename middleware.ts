import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();

  const isSkagit =
    host.includes("skagithappyhours.com") || host.includes("skagit");

  const url = req.nextUrl.clone();
  url.pathname = isSkagit
    ? "/icons/skagit/favicon.ico"
    : "/icons/bellingham/favicon.ico";

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/favicon.ico"],
};
