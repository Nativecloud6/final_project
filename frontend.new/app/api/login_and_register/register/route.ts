import { NextRequest, NextResponse } from "next/server"
import { openDB } from "@/lib/db"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body

  if (!username || !password) {
    return NextResponse.json({ code: "missing-fields" })
  }

  const db = await openDB()

  const exists = await db.get("SELECT * FROM users WHERE username = ?", username)
  if (exists) {
    return NextResponse.json({ code: "user-already-exist" })
  }

  const uuid = randomUUID()

  await db.run(
    `INSERT INTO users (uuid, username, passwordHash, userLevel, token)
     VALUES (?, ?, ?, ?, ?)`,
    uuid,
    username,
    password,    // ⚠️ 建議正式環境使用 bcrypt hash
    "user",
    null
  )

  return NextResponse.json({ code: "register-success" })
}

