import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { posts, users, files, postTags, tags, likes, bookmarks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const post = await db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        subject: posts.subject,
        course: posts.course,
        semester: posts.semester,
        college: posts.college,
        resourceType: posts.resourceType,
        threadId: posts.threadId,
        threadOrder: posts.threadOrder,
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
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await db
      .update(posts)
      .set({ viewsCount: sql`${posts.viewsCount} + 1` })
      .where(eq(posts.id, postId));

    const postFiles = await db.query.files.findMany({
      where: eq(files.postId, postId),
    });

    const postTagsData = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId));

    let isLiked = false;
    let isBookmarked = false;

    if (userId) {
      const userLike = await db.query.likes.findFirst({
        where: eq(likes.userId, userId),
      });
      isLiked = !!userLike && userLike.postId === postId;

      const userBookmark = await db.query.bookmarks.findFirst({
        where: eq(bookmarks.userId, userId),
      });
      isBookmarked = !!userBookmark && userBookmark.postId === postId;
    }

    const result = {
      ...post[0],
      files: postFiles.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        originalName: f.originalName,
        fileUrl: f.fileUrl,
        fileSize: f.fileSize,
        mimeType: f.mimeType,
        fileType: f.fileType,
        thumbnailUrl: f.thumbnailUrl,
      })),
      tags: postTagsData,
      isLiked,
      isBookmarked,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
