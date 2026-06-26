import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { discussionReplies, discussions, users } from '@/lib/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
      .where(and(eq(discussionReplies.discussionId, id), sql`${discussionReplies.parentId} IS NULL`))
      .orderBy(desc(discussionReplies.createdAt));

    const allReplies = await db
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
      .where(and(eq(discussionReplies.discussionId, id), sql`${discussionReplies.parentId} IS NOT NULL`))
      .orderBy(desc(discussionReplies.createdAt));

    const threaded = replies.map((reply) => ({
      ...reply,
      replies: allReplies.filter((r) => r.parentId === reply.id),
    }));

    return NextResponse.json(threaded, { status: 200 });
  } catch (error) {
    console.error('Get discussion replies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, parentId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    await db.insert(discussionReplies).values({
      id: randomUUID(),
      discussionId: id,
      userId: session.user.id,
      parentId: parentId || null,
      content: content.trim(),
    });

    await db.update(discussions)
      .set({ repliesCount: sql`${discussions.repliesCount} + 1` })
      .where(eq(discussions.id, id));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Add discussion reply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
