import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { likes, posts, notifications, users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const existingLike = await db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.postId, postId)),
    });

    if (existingLike) {
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      await db
        .update(posts)
        .set({ likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)` })
        .where(eq(posts.id, postId));

      return NextResponse.json({ liked: false }, { status: 200 });
    }

    await db.insert(likes).values({
      id: generateId(),
      userId,
      postId,
    });

    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (post && post.userId !== userId) {
      const actor = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      await db.insert(notifications).values({
        id: generateId(),
        userId: post.userId,
        actorId: userId,
        type: 'like',
        postId,
        message: `${actor?.name || 'Someone'} liked your post`,
      });
    }

    return NextResponse.json({ liked: true }, { status: 200 });
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
