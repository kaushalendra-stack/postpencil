import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'
import { sessions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSessions = await db
      .select({
        sessionToken: sessions.sessionToken,
        expires: sessions.expires,
      })
      .from(sessions)
      .where(eq(sessions.userId, session.user.id))
      .orderBy(desc(sessions.expires))

    return NextResponse.json({ sessions: userSessions }, { status: 200 })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ message: 'Heartbeat acknowledged' }, { status: 200 })
  } catch (error) {
    console.error('Session heartbeat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('token')

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token required' }, { status: 400 })
    }

    const [targetSession] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(eq(sessions.sessionToken, sessionToken))
      .limit(1)

    if (!targetSession || targetSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    await db
      .delete(sessions)
      .where(eq(sessions.sessionToken, sessionToken))

    return NextResponse.json({ message: 'Session revoked' }, { status: 200 })
  } catch (error) {
    console.error('Revoke session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
