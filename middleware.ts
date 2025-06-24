import { NextRequest, NextResponse } from "next/server";

import { getOptionalSession } from "@/lib/session";

const AUTH_PAGES = ["/sign-in"];

export async function middleware(request: NextRequest) {
  const session = await getOptionalSession();
  console.log("Session:", session);

  if (Object.keys(session).length === 0) {
    // 같은 페이지로 리디렉션되는 경우를 방지
    if (AUTH_PAGES.some((page) => request.nextUrl.pathname.startsWith(page))) {
      return NextResponse.next();
    }

    // 아니면 로그인 페이지로 리디렉션
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 로그인된 상태에서 로그인 페이지에 접근하는 경우
  else if (
    session &&
    AUTH_PAGES.some((page) => request.nextUrl.pathname.startsWith(page))
  ) {
    // 홈 페이지로 리디렉션
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - auth (authentication routes)
     * - images (image routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|auth|images|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
