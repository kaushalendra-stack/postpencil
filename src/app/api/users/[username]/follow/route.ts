import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { follows, users, notifications } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const targetUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.id === userId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const existingFollow = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, userId), eq(follows.followingId, targetUser.id)),
    });

    if (existingFollow) {
      await db.delete(follows).where(eq(follows.id, existingFollow.id));

      await db
        .update(users)
        .set({ followingCount: sql`GREATEST(${users.followingCount} - 1, 0)` })
        .where(eq(users.id, userId));
      await db
        .update(users)
        .set({ followersCount: sql`GREATEST(${users.followersCount} - 1, 0)` })
        .where(eq(users.id, targetUser.id));

      return NextResponse.json({ following: false }, { status: 200 });
    }

    await db.insert(follows).values({
      id: generateId(),
      followerId: userId,
      followingId: targetUser.id,
    });

    await db
      .update(users)
      .set({ followingCount: sql`${users.followingCount} + 1` })
      .where(eq(users.id, userId));
    await db
      .update(users)
      .set({ followersCount: sql`${users.followersCount} + 1` })
      .where(eq(users.id, targetUser.id));

    const actor = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    await db.insert(notifications).values({
      id: generateId(),
      userId: targetUser.id,
      actorId: userId,
      type: 'follow',
      message: `${actor?.name || 'Someone'} started following you`,
    });

    return NextResponse.json({ following: true }, { status: 200 });
  } catch (error) {
    console.error('Toggle follow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
