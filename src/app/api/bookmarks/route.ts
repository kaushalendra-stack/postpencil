import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { bookmarks, posts, users, files, postTags, tags } from '@/lib/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const collectionId = searchParams.get('collectionId');
    const offset = (page - 1) * limit;

    const whereClause = collectionId
      ? and(eq(bookmarks.userId, session.user.id), eq(bookmarks.collectionId, collectionId))
      : eq(bookmarks.userId, session.user.id);

    const data = await db
      .select({
        bookmarkId: bookmarks.id,
        createdAt: bookmarks.createdAt,
        post: {
          id: posts.id,
          title: posts.title,
          description: posts.description,
          resourceType: posts.resourceType,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          downloadsCount: posts.downloadsCount,
          viewsCount: posts.viewsCount,
          createdAt: posts.createdAt,
          user: {
            id: users.id,
            name: users.name,
            username: users.username,
            image: users.image,
          },
        },
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .innerJoin(users, eq(posts.userId, users.id))
      .where(whereClause)
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    const postIds = data.map((d) => d.post.id);

    const postFiles = postIds.length
      ? await db.query.files.findMany({
          where: sql`${files.postId} IN (${sql.join(postIds.map((id) => sql`${id}`), sql`, `)})`,
        })
      : [];

    const postTagsData = postIds.length
      ? await db
          .select({
            postId: postTags.postId,
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
          })
          .from(postTags)
          .innerJoin(tags, eq(postTags.tagId, tags.id))
          .where(sql`${postTags.postId} IN (${sql.join(postIds.map((id) => sql`${id}`), sql`, `)})`)
      : [];

    const result = data.map((item) => ({
      ...item,
      post: {
        ...item.post,
        files: postFiles
          .filter((f) => f.postId === item.post.id)
          .map((f) => ({
            id: f.id,
            fileName: f.fileName,
            originalName: f.originalName,
            fileUrl: f.fileUrl,
            fileSize: f.fileSize,
            mimeType: f.mimeType,
            fileType: f.fileType,
            thumbnailUrl: f.thumbnailUrl,
          })),
        tags: postTagsData
          .filter((t) => t.postId === item.post.id)
          .map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      },
    }));

    const totalResult = await db
      .select({ count: count() })
      .from(bookmarks)
      .where(eq(bookmarks.userId, session.user.id));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    }, { status: 200 });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
