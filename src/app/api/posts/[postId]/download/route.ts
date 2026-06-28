import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { downloads, posts, notifications, users, files } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

const DAILY_LIMIT = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const fileId = request.nextUrl.searchParams.get('fileId');

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!fileId) {
      return NextResponse.json({ error: 'fileId required' }, { status: 400 });
    }

    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    const ext = file.originalName.split('.').pop() || file.fileType;
    const safeTitle = (post?.title || 'document').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeTitle}_postpencil.${ext}`;

    const fileRes = await fetch(file.fileUrl);
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 });
    }

    const contentLength = fileRes.headers.get('content-length');
    const contentType = fileRes.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Download proxy error:', error);
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

    const userId = session.user.id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(downloads)
      .where(and(eq(downloads.userId, userId), gte(downloads.createdAt, todayStart)));

    if (count >= DAILY_LIMIT) {
      return NextResponse.json({
        error: `Daily download limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`,
        limit: DAILY_LIMIT,
        used: count,
      }, { status: 429 });
    }

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

    return NextResponse.json({
      success: true,
      downloadsUsed: count + 1,
      downloadsRemaining: DAILY_LIMIT - count - 1,
    }, { status: 200 });
  } catch (error) {
    console.error('Record download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
