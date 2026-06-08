import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// Optimistic session check — reads the next-auth v4 session cookie without hitting the DB.
// Real session validation happens inside route handlers via getServerSession(authOptions).
export function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value // HTTPS/prod

  const { pathname } = request.nextUrl
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register")
  const isApiAuth = pathname.startsWith("/api/auth")

  if (isApiAuth) return NextResponse.next()

  if (!sessionToken && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
