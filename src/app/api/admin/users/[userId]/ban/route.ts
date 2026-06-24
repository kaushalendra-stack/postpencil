import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newBannedState = !user.isBanned;

    await db
      .update(users)
      .set({ isBanned: newBannedState })
      .where(eq(users.id, userId));

    return NextResponse.json({
      banned: newBannedState,
      message: newBannedState ? 'User banned' : 'User unbanned',
    }, { status: 200 });
  } catch (error) {
    console.error('Toggle ban error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
