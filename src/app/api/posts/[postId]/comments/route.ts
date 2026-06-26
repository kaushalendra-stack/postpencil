import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { comments, users, posts, notifications } from '@/lib/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;

    const data = await db
      .select({
        id: comments.id,
        content: comments.content,
        likesCount: comments.likesCount,
        createdAt: comments.createdAt,
        parentId: comments.parentId,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.postId, postId), sql`${comments.parentId} IS NULL`))
      .orderBy(desc(comments.createdAt));

    const repliesData = await db
      .select({
        id: comments.id,
        content: comments.content,
        likesCount: comments.likesCount,
        createdAt: comments.createdAt,
        parentId: comments.parentId,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.postId, postId), sql`${comments.parentId} IS NOT NULL`))
      .orderBy(desc(comments.createdAt));

    const threaded = data.map((comment) => ({
      ...comment,
      replies: repliesData.filter((r) => r.parentId === comment.id),
    }));

    return NextResponse.json(threaded, { status: 200 });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { content, parentId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const commentId = generateId();

    await db.insert(comments).values({
      id: commentId,
      postId,
      userId: session.user.id,
      parentId: parentId || null,
      content: content.trim(),
    });

    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, postId));

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (post && post.userId !== session.user.id) {
      const actor = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });

      await db.insert(notifications).values({
        id: generateId(),
        userId: post.userId,
        actorId: session.user.id,
        type: 'comment',
        postId,
        message: `${actor?.name || 'Someone'} commented on your post`,
      });
    }

    return NextResponse.json({ commentId }, { status: 201 });
  } catch (error) {
    console.error('Add comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
