import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { posts, users, files, postTags, tags } from '@/lib/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        subject: posts.subject,
        course: posts.course,
        semester: posts.semester,
        college: posts.college,
        resourceType: posts.resourceType,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        downloadsCount: posts.downloadsCount,
        bookmarksCount: posts.bookmarksCount,
        viewsCount: posts.viewsCount,
        trendingScore: posts.trendingScore,
        isPublished: posts.isPublished,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.userId, user.id), sql`${posts.deletedAt} IS NULL`))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const postIds = data.map((p) => p.id);

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

    const result = data.map((post) => ({
      ...post,
      files: postFiles.filter((f) => f.postId === post.id).map((f) => ({
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
        .filter((t) => t.postId === post.id)
        .map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    }));

    const totalResult = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.userId, user.id), sql`${posts.deletedAt} IS NULL`));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    }, { status: 200 });
  } catch (error) {
    console.error('Get user posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
