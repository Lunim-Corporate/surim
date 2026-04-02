import { NextRequest, NextResponse } from "next/server";

const subdomainRoutes: Record<string, string> = {
  ai: "/ai-automation",
  ux: "/ux",
  "video-next": "/video",
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  const subdomain = hostname.split(".")[0];
  const targetPath = subdomainRoutes[subdomain];

  if (!targetPath || hostname.startsWith("www")) {
    return NextResponse.next();
  }

  if (pathname === targetPath || pathname.startsWith(`${targetPath}/`)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `${targetPath}${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
