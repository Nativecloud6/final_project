import { NextRequest, NextResponse } from "next/server"
import { openDB } from "@/lib/db" // ensure this points to your db helper

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body

  if (!username || !password) {
    return NextResponse.json({ code: "missing-fields" })
  }

  const db = await openDB()

  // Check if user already exists
  const exists = await db.get("SELECT * FROM users WHERE username = ?", username)
  if (exists) {
    return NextResponse.json({ code: "user-already-exist" })
  }

  // Insert new user
  await db.run(
    "INSERT INTO users (username, passwordHash, userLevel, token) VALUES (?, ?, ?, ?)",
    username,
    password,          // 🔒 In production, hash this!
    "normal",          // default level
    null               // no token yet
  )

  return NextResponse.json({ code: "register-success" })
}

