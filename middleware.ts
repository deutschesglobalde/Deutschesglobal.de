import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin_session")
    if (!adminSession || adminSession.value !== "true") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const response = await updateSession(request)
    const supabaseResponse = response as NextResponse

    // Check if user is authenticated by looking for session
    const sessionCookie = request.cookies.get("sb-access-token") || request.cookies.get("sb-refresh-token")
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
