import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { discussions, discussionLikes } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

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

    const existing = await db.query.discussionLikes.findFirst({
      where: and(eq(discussionLikes.userId, session.user.id), eq(discussionLikes.discussionId, id)),
    });

    if (existing) {
      await db.delete(discussionLikes).where(eq(discussionLikes.id, existing.id));
      await db.update(discussions).set({ likesCount: sql`GREATEST(${discussions.likesCount} - 1, 0)` }).where(eq(discussions.id, id));
      return NextResponse.json({ isLiked: false });
    } else {
      await db.insert(discussionLikes).values({ id: randomUUID(), userId: session.user.id, discussionId: id });
      await db.update(discussions).set({ likesCount: sql`${discussions.likesCount} + 1` }).where(eq(discussions.id, id));
      return NextResponse.json({ isLiked: true });
    }
  } catch (error) {
    console.error('Toggle discussion like error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
