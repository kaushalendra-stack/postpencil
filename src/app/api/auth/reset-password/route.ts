import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, verificationTokens } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const verificationToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date()),
      ),
    })

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // identifier is "reset:{userId}"
    const userId = verificationToken.identifier?.replace('reset:', '') || ''
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))

    await db.delete(verificationTokens)
      .where(and(eq(verificationTokens.identifier, `reset:${userId}`), eq(verificationTokens.token, token)))

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
