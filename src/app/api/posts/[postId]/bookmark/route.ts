import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { bookmarks, posts } from '@/lib/db/schema';
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
    const { collectionId } = await request.json().catch(() => ({}));

    const existingBookmark = await db.query.bookmarks.findFirst({
      where: and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)),
    });

    if (existingBookmark) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
      await db
        .update(posts)
        .set({ bookmarksCount: sql`GREATEST(${posts.bookmarksCount} - 1, 0)` })
        .where(eq(posts.id, postId));

      return NextResponse.json({ bookmarked: false }, { status: 200 });
    }

    await db.insert(bookmarks).values({
      id: generateId(),
      userId,
      postId,
      collectionId: collectionId || null,
    });

    await db
      .update(posts)
      .set({ bookmarksCount: sql`${posts.bookmarksCount} + 1` })
      .where(eq(posts.id, postId));

    return NextResponse.json({ bookmarked: true }, { status: 200 });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
