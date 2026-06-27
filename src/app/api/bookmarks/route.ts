import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { bookmarks, posts, users, files, postTags, tags } from '@/lib/db/schema';
import { eq, desc, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const data = await db
      .select({
        bookmarkId: bookmarks.id,
        createdAt: bookmarks.createdAt,
        postId: posts.id,
        title: posts.title,
        description: posts.description,
        resourceType: posts.resourceType,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        downloadsCount: posts.downloadsCount,
        viewsCount: posts.viewsCount,
        postsCreatedAt: posts.createdAt,
        userId: users.id,
        userName: users.name,
        userUsername: users.username,
        userImage: users.image,
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(bookmarks.userId, session.user.id))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    const postIds = data.map((d) => d.postId);

    const postFiles = postIds.length
      ? await db.query.files.findMany({
          where: sql`${files.postId} IN (${sql.join(postIds.map((id: string) => sql`${id}`), sql`, `)})`,
        })
      : [];

    const postTagsData = postIds.length
      ? await db
          .select({ postId: postTags.postId, id: tags.id, name: tags.name, slug: tags.slug })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(sql`${postTags.postId} IN (${sql.join(postIds.map((id: string) => sql`${id}`), sql`, `)})`)
      : [];

    const result = data.map((item) => ({
      ...item,
      post: {
        id: item.postId,
        title: item.title,
        description: item.description,
        resourceType: item.resourceType,
        likesCount: item.likesCount,
        commentsCount: item.commentsCount,
        downloadsCount: item.downloadsCount,
        viewsCount: item.viewsCount,
        createdAt: item.postsCreatedAt,
        user: { id: item.userId, name: item.userName, username: item.userUsername, image: item.userImage },
        files: postFiles.filter((f) => f.postId === item.postId).map((f) => ({ id: f.id, fileName: f.fileName, originalName: f.originalName, fileUrl: f.fileUrl, fileSize: f.fileSize, mimeType: f.mimeType, fileType: f.fileType, thumbnailUrl: f.thumbnailUrl })),
        tags: postTagsData.filter((t) => t.postId === item.postId).map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      },
    }));

    const totalResult = await db.select({ count: count() }).from(bookmarks).where(eq(bookmarks.userId, session.user.id));
    const total = totalResult[0]?.count || 0;

    return NextResponse.json({ data: result, total, page, limit, hasMore: page * limit < total }, { status: 200 });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
