import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { downloads, posts, notifications, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
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

    await db.insert(downloads).values({
      id: generateId(),
      userId,
      postId,
    });

    await db
      .update(posts)
      .set({ downloadsCount: sql`${posts.downloadsCount} + 1` })
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
        type: 'download',
        postId,
        message: `${actor?.name || 'Someone'} downloaded your post`,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Record download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
