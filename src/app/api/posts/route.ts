import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { posts, users, files, postTags, tags, likes, bookmarks } from '@/lib/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject, course, semester, college, tags: tagNames, threadId, threadOrder } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const postId = randomUUID();

    await db.insert(posts).values({
      id: postId,
      userId: session.user.id,
      title: title.trim(),
      description: description || null,
      subject: subject || null,
      course: course || null,
      semester: semester || null,
      college: college || null,
      resourceType: 'document',
      threadId: threadId || null,
      threadOrder: threadOrder || 0,
      isPublished: true,
    });

    // Handle tags
    if (tagNames && Array.isArray(tagNames) && tagNames.length > 0) {
      for (const tagName of tagNames.slice(0, 10)) {
        const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const trimmedName = tagName.trim().slice(0, 100);

        let tag = await db.query.tags.findFirst({
          where: eq(tags.slug, slug),
        });

        if (!tag) {
          const tagId = randomUUID();
          await db.insert(tags).values({ id: tagId, name: trimmedName, slug, postsCount: 1 });
          tag = { id: tagId, name: trimmedName, slug, postsCount: 1 } as any;
        } else {
          await db.update(tags).set({ postsCount: (tag.postsCount || 0) + 1 }).where(eq(tags.id, tag.id));
        }

        await db.insert(postTags).values({ postId, tagId: tag.id }).catch(() => {});
      }
    }

    return NextResponse.json({ id: postId, message: 'Post created' }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const feed = searchParams.get('feed') || 'latest';
    const offset = (page - 1) * limit;

    const session = await auth();
    const userId = session?.user?.id;

    const data = await db
      .select({
        id: posts.id, title: posts.title, description: posts.description,
        subject: posts.subject, course: posts.course, semester: posts.semester,
        college: posts.college, resourceType: posts.resourceType,
        likesCount: posts.likesCount, commentsCount: posts.commentsCount,
        downloadsCount: posts.downloadsCount, bookmarksCount: posts.bookmarksCount,
        viewsCount: posts.viewsCount, trendingScore: posts.trendingScore,
        isPublished: posts.isPublished, createdAt: posts.createdAt, updatedAt: posts.updatedAt,
        userId: users.id, userName: users.name, userUsername: users.username, userImage: users.image,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(and(eq(posts.isPublished, true), sql`${posts.deletedAt} IS NULL`))
      .orderBy(feed === 'trending' ? desc(posts.trendingScore) : desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    const postIds = data.map((p: any) => p.id);
    const postFiles = postIds.length ? await db.query.files.findMany({ where: sql`${files.postId} IN (${sql.join(postIds.map((id: string) => sql`${id}`), sql`, `)})` }) : [];
    const postTagsData = postIds.length ? await db.select({ postId: postTags.postId, id: tags.id, name: tags.name, slug: tags.slug }).from(postTags).innerJoin(tags, eq(postTags.tagId, tags.id)).where(sql`${postTags.postId} IN (${sql.join(postIds.map((id: string) => sql`${id}`), sql`, `)})`) : [];

    let likedPostIds: string[] = [];
    let bookmarkedPostIds: string[] = [];
    if (userId && postIds.length) {
      const userLikes = await db.select({ postId: likes.postId }).from(likes).where(and(eq(likes.userId, userId), sql`${likes.postId} IN (${sql.join(postIds.map((id: string) => sql`${id}`), sql`, `)})`));
      likedPostIds = userLikes.map((l: any) => l.postId);
      const userBookmarks = await db.select({ postId: bookmarks.postId }).from(bookmarks).where(and(eq(bookmarks.userId, userId), sql`${bookmarks.postId} IN (${sql.join(postIds.map((id: string) => sql`${id}`), sql`, `)})`));
      bookmarkedPostIds = userBookmarks.map((b: any) => b.postId);
    }

    const result = data.map((post: any) => ({
      id: post.id, title: post.title, description: post.description, subject: post.subject, course: post.course, semester: post.semester, college: post.college,
      resourceType: post.resourceType, likesCount: post.likesCount, commentsCount: post.commentsCount, downloadsCount: post.downloadsCount,
      bookmarksCount: post.bookmarksCount, viewsCount: post.viewsCount, trendingScore: post.trendingScore, isPublished: post.isPublished,
      createdAt: post.createdAt, updatedAt: post.updatedAt,
      user: { id: post.userId, name: post.userName, username: post.userUsername, image: post.userImage },
      files: postFiles.filter((f: any) => f.postId === post.id).map((f: any) => ({ id: f.id, fileName: f.fileName, originalName: f.originalName, fileUrl: f.fileUrl, fileSize: f.fileSize, mimeType: f.mimeType, fileType: f.fileType, thumbnailUrl: f.thumbnailUrl })),
      tags: postTagsData.filter((t: any) => t.postId === post.id).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
      isLiked: likedPostIds.includes(post.id), isBookmarked: bookmarkedPostIds.includes(post.id),
    }));

    const totalResult = await db.select({ count: count() }).from(posts).where(and(eq(posts.isPublished, true), sql`${posts.deletedAt} IS NULL`));
    const total = totalResult[0]?.count || 0;

    return NextResponse.json({ data: result, total, page, limit, hasMore: page * limit < total });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
