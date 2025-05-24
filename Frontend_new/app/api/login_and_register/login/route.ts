import { NextRequest, NextResponse } from 'next/server'
import { openDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body

  const db = await openDB()

  const user = await db.get(
    'SELECT * FROM users WHERE username = ?',
    username
  )

  if (!user) {
    return NextResponse.json({ code: 'user-not-exist' })
  }

  if (user.passwordHash !== password) {
    return NextResponse.json({ code: 'password-wrong' })
  }

  const response = NextResponse.json({ code: 'login-success' })
  response.cookies.set('username', username)
  return response
}

