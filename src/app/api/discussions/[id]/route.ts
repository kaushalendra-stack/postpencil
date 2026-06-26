import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { discussions, users, discussionLikes, discussionReplies } from '@/lib/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const discussion = await db
      .select({
        id: discussions.id,
        content: discussions.content,
        imageUrl: discussions.imageUrl,
        likesCount: discussions.likesCount,
        repliesCount: discussions.repliesCount,
        viewsCount: discussions.viewsCount,
        isPublished: discussions.isPublished,
        createdAt: discussions.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
        },
      })
      .from(discussions)
      .innerJoin(users, eq(discussions.userId, users.id))
      .where(eq(discussions.id, id))
      .limit(1);

    if (!discussion.length) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 });
    }

    await db.update(discussions)
      .set({ viewsCount: sql`${discussions.viewsCount} + 1` })
      .where(eq(discussions.id, id));

    let isLiked = false;
    if (userId) {
      const like = await db.query.discussionLikes.findFirst({
        where: and(eq(discussionLikes.userId, userId), eq(discussionLikes.discussionId, id)),
      });
      isLiked = !!like;
    }

    const replies = await db
      .select({
        id: discussionReplies.id,
        content: discussionReplies.content,
        likesCount: discussionReplies.likesCount,
        createdAt: discussionReplies.createdAt,
        parentId: discussionReplies.parentId,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
        },
      })
      .from(discussionReplies)
      .innerJoin(users, eq(discussionReplies.userId, users.id))
      .where(eq(discussionReplies.discussionId, id))
      .orderBy(desc(discussionReplies.createdAt));

    return NextResponse.json({ ...discussion[0], isLiked, replies }, { status: 200 });
  } catch (error) {
    console.error('Get discussion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
