import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, verificationTokens } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const id = searchParams.get('id')

    if (!token || !id) {
      return NextResponse.redirect(new URL('/verify-email?error=missing-params', request.url))
    }

    const verificationToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, `verify:${id}`),
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date()),
      ),
    })

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid-token', request.url))
    }

    await db.update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, id))

    await db.delete(verificationTokens)
      .where(eq(verificationTokens.id, verificationToken.id))

    return NextResponse.redirect(new URL('/login?verified=true', request.url))
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(new URL('/verify-email?error=server', request.url))
  }
}
