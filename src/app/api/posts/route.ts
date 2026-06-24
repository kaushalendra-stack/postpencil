import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { posts, users, files, postTags, tags, likes, bookmarks } from '@/lib/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const feed = searchParams.get('feed') || 'latest';
    const offset = (page - 1) * limit;

    const session = await auth();
    const userId = session?.user?.id;

    const feedQuery = db
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
      .where(and(eq(posts.isPublished, true), sql`${posts.deletedAt} IS NULL`))
      .limit(limit)
      .offset(offset);

    let orderedQuery;
    if (feed === 'trending') {
      orderedQuery = feedQuery.orderBy(desc(posts.trendingScore), desc(posts.createdAt));
    } else if (feed === 'following' && userId) {
      const followingIds = db
        .select({ followingId: sql<string>`follower_id` })
        .from(sql`follows`)
        .where(sql`follower_id = ${userId}`);

      orderedQuery = feedQuery
        .where(
          and(
            eq(posts.isPublished, true),
            sql`${posts.deletedAt} IS NULL`,
            sql`${posts.userId} IN (SELECT following_id FROM follows WHERE follower_id = ${userId})`,
          ),
        )
        .orderBy(desc(posts.createdAt));
    } else {
      orderedQuery = feedQuery.orderBy(desc(posts.createdAt));
    }

    const data = await orderedQuery;

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

    let likedPostIds: string[] = [];
    let bookmarkedPostIds: string[] = [];

    if (userId && postIds.length) {
      const userLikes = await db
        .select({ postId: likes.postId })
        .from(likes)
        .where(
          and(
            eq(likes.userId, userId),
            sql`${likes.postId} IN (${sql.join(postIds.map((id) => sql`${id}`), sql`, `)})`,
          ),
        );
      likedPostIds = userLikes.map((l) => l.postId);

      const userBookmarks = await db
        .select({ postId: bookmarks.postId })
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, userId),
            sql`${bookmarks.postId} IN (${sql.join(postIds.map((id) => sql`${id}`), sql`, `)})`,
          ),
        );
      bookmarkedPostIds = userBookmarks.map((b) => b.postId);
    }

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
      isLiked: likedPostIds.includes(post.id),
      isBookmarked: bookmarkedPostIds.includes(post.id),
    }));

    const totalResult = await db
      .select({ count: count() })
      .from(posts)
      .where(and(eq(posts.isPublished, true), sql`${posts.deletedAt} IS NULL`));

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    }, { status: 200 });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, course, semester, college, resourceType, tags: tagNames, files: fileIds } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const postId = generateId();

    await db.insert(posts).values({
      id: postId,
      userId: session.user.id,
      title,
      description,
      subject,
      course,
      semester,
      college,
      resourceType,
    });

    if (fileIds && fileIds.length > 0) {
      await db
        .update(files)
        .set({ postId })
        .where(sql`${files.id} IN (${sql.join(fileIds.map((id: string) => sql`${id}`), sql`, `)})`);
    }

    if (tagNames && tagNames.length > 0) {
      for (const tagName of tagNames as string[]) {
        const slug = tagName.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        let tag = await db.query.tags.findFirst({ where: eq(tags.name, tagName) });

        if (!tag) {
          const tagId = generateId();
          await db.insert(tags).values({ id: tagId, name: tagName, slug, postsCount: 1 });
          tag = { id: tagId, name: tagName, slug, postsCount: 1 };
        } else {
          await db
            .update(tags)
            .set({ postsCount: sql`${tags.postsCount} + 1` })
            .where(eq(tags.id, tag.id));
        }

        await db.insert(postTags).values({
          id: generateId(),
          postId,
          tagId: tag.id,
        });
      }
    }

    await db
      .update(users)
      .set({ postsCount: sql`${users.postsCount} + 1` })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ postId }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
