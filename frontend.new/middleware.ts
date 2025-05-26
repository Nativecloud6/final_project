// middleware.ts
import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/((?!api|_next|static|_next/image|favicon.ico).*)"],
}

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl
  const token = req.cookies.get("token")?.value

  // 1️⃣ Not logged in → back to /?code=login-required
  if (!token && pathname !== "/") {
    const url = new URL("/", origin)
    url.searchParams.set("code", "login-required")
    return NextResponse.redirect(url)
  }

  // 2️⃣ Validate the token
  let userLevel: string | null = null
  if (token) {
    const res = await fetch(`${origin}/api/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    if (data.valid) userLevel = data.userLevel
  }

  // 3️⃣ A normal user tried to hit /dashboard → back to /?code=no-permission
  if (userLevel !== "admin" && pathname.startsWith("/dashboard")) {
    const url = new URL("/", origin)
    url.searchParams.set("code", "no-permission")
    return NextResponse.redirect(url)
  }

  // 4️⃣ An admin tried to hit /user-dashboard → back to /?code=no-permission
  if (userLevel !== "user" && pathname.startsWith("/user-dashboard")) {
    const url = new URL("/", origin)
    url.searchParams.set("code", "no-permission")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

