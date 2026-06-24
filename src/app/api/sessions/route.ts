import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { loginSessions } from '@/lib/db/schema';
import { eq, and, desc, isNull, ne } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const currentSessionToken = (session.user as any).sessionToken as string | undefined;

    // Ensure a login_sessions row exists for this browser
    if (!currentSessionToken) {
      const userAgent = request.headers.get('user-agent') || '';
      const ua = userAgent.toLowerCase();
      const browser = ua.includes('edg') ? 'Edge' : ua.includes('chrome') ? 'Chrome' : ua.includes('firefox') ? 'Firefox' : ua.includes('safari') ? 'Safari' : 'Unknown';
      const os = ua.includes('windows') ? 'Windows' : ua.includes('mac os') ? 'macOS' : ua.includes('linux') ? 'Linux' : ua.includes('android') ? 'Android' : ua.includes('iphone') || ua.includes('ipad') ? 'iOS' : 'Unknown';
      const device = ua.includes('mobile') || ua.includes('android') ? 'Mobile' : ua.includes('ipad') || ua.includes('tablet') ? 'Tablet' : 'Desktop';
      const newToken = randomUUID();

      await db.insert(loginSessions).values({
        id: randomUUID(),
        userId,
        sessionToken: newToken,
        provider: 'credentials',
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown',
        userAgent,
        device,
        browser,
        os,
        isCurrent: true,
        lastActiveAt: new Date(),
      });
    }

    // Get all non-expired sessions for this user
    const sessions = await db
      .select({
        id: loginSessions.id,
        sessionToken: loginSessions.sessionToken,
        provider: loginSessions.provider,
        ip: loginSessions.ip,
        device: loginSessions.device,
        browser: loginSessions.browser,
        os: loginSessions.os,
        isCurrent: loginSessions.isCurrent,
        lastActiveAt: loginSessions.lastActiveAt,
        createdAt: loginSessions.createdAt,
      })
      .from(loginSessions)
      .where(and(
        eq(loginSessions.userId, userId),
        isNull(loginSessions.expiredAt),
      ))
      .orderBy(desc(loginSessions.lastActiveAt));

    // Mark the matching session as current based on sessionToken
    const result = sessions.map((s) => ({
      ...s,
      isCurrent: currentSessionToken ? s.sessionToken === currentSessionToken : s.isCurrent,
    }));

    // Current session always first
    result.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return 0;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, sessionId } = body;

    if (action === 'heartbeat') {
      const currentSessionToken = (session.user as any).sessionToken as string | undefined;
      if (currentSessionToken) {
        await db
          .update(loginSessions)
          .set({ lastActiveAt: new Date() })
          .where(and(
            eq(loginSessions.userId, session.user.id),
            eq(loginSessions.sessionToken, currentSessionToken),
          ));
      }
      return NextResponse.json({ message: 'Heartbeat recorded' }, { status: 200 });
    }

    if (action === 'revoke' && sessionId) {
      await db
        .update(loginSessions)
        .set({ expiredAt: new Date(), isCurrent: false })
        .where(and(eq(loginSessions.id, sessionId), eq(loginSessions.userId, session.user.id)));

      return NextResponse.json({ message: 'Session revoked' }, { status: 200 });
    }

    if (action === 'revoke_all') {
      const currentSessionToken = (session.user as any).sessionToken as string | undefined;

      if (currentSessionToken) {
        // Expire all sessions EXCEPT the current one
        await db
          .update(loginSessions)
          .set({ expiredAt: new Date(), isCurrent: false })
          .where(and(
            eq(loginSessions.userId, session.user.id),
            isNull(loginSessions.expiredAt),
            ne(loginSessions.sessionToken, currentSessionToken),
          ));
      } else {
        await db
          .update(loginSessions)
          .set({ expiredAt: new Date(), isCurrent: false })
          .where(and(
            eq(loginSessions.userId, session.user.id),
            isNull(loginSessions.expiredAt),
          ));
      }

      return NextResponse.json({ message: 'All other sessions revoked' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Session action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
