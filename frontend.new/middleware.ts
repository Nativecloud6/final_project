import { NextRequest, NextResponse } from "next/server"

export const config = {
  matcher: ["/((?!api|_next|static|_next/image|favicon.ico).*)"], // 所有非 API 路由都走 middleware
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const pathname = request.nextUrl.pathname

  // 未登入者禁止進入非首頁
  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // 從後端驗證 token 並獲得 userLevel
  let userLevel = null
  if (token) {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/validate`, {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()
    if (data.valid) userLevel = data.userLevel
  }

  // ✅ 使用者誤進 admin 的子頁面，導向 user 的對應頁面
  if (userLevel !== "admin" && pathname.startsWith("/dashboard")) {
    const newPath = pathname.replace("/dashboard", "/user-dashboard")
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // ✅ 管理員誤進 user 的子頁面，導向 admin 的對應頁面
  if (userLevel === "admin" && pathname.startsWith("/user-dashboard")) {
    const newPath = pathname.replace("/user-dashboard", "/dashboard")
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  return NextResponse.next()
}

