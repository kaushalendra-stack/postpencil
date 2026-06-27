import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { discussions, users, discussionLikes } from '@/lib/db/schema';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { discussionSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = discussionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { content, imageUrl } = parsed.data;

    const discussionId = randomUUID();

    await db.insert(discussions).values({
      id: discussionId,
      userId: session.user.id,
      content: content.trim(),
      imageUrl: imageUrl || null,
    });

    return NextResponse.json({ id: discussionId }, { status: 201 });
  } catch (error) {
    console.error('Create discussion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const session = await auth();
    const userId = session?.user?.id;

    const data = await db
      .select({
        id: discussions.id,
        content: discussions.content,
        imageUrl: discussions.imageUrl,
        likesCount: discussions.likesCount,
        repliesCount: discussions.repliesCount,
        viewsCount: discussions.viewsCount,
        isPublished: discussions.isPublished,
        createdAt: discussions.createdAt,
        userId: users.id,
        userName: users.name,
        userUsername: users.username,
        userImage: users.image,
      })
      .from(discussions)
      .innerJoin(users, eq(discussions.userId, users.id))
      .where(and(eq(discussions.isPublished, true), sql`${discussions.deletedAt} IS NULL`))
      .orderBy(desc(discussions.createdAt))
      .limit(limit)
      .offset(offset);

    const discussionIds = data.map((d) => d.id);

    let likedIds: string[] = [];
    if (userId && discussionIds.length) {
      const userLikes = await db
        .select({ discussionId: discussionLikes.discussionId })
        .from(discussionLikes)
        .where(and(
          eq(discussionLikes.userId, userId),
          sql`${discussionLikes.discussionId} IN (${sql.join(discussionIds.map((id) => sql`${id}`), sql`, `)})`
        ));
      likedIds = userLikes.map((l) => l.discussionId);
    }

    const result = data.map((d) => ({
      id: d.id,
      content: d.content,
      imageUrl: d.imageUrl,
      likesCount: d.likesCount,
      repliesCount: d.repliesCount,
      viewsCount: d.viewsCount,
      isPublished: d.isPublished,
      createdAt: d.createdAt,
      user: { id: d.userId, name: d.userName, username: d.userUsername, image: d.userImage },
      isLiked: likedIds.includes(d.id),
    }));

    const totalResult = await db.select({ count: count() }).from(discussions)
      .where(and(eq(discussions.isPublished, true), sql`${discussions.deletedAt} IS NULL`));
    const total = totalResult[0]?.count || 0;

    return NextResponse.json({ data: result, total, page, limit, hasMore: page * limit < total });
  } catch (error) {
    console.error('Get discussions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
