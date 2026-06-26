import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { posts, users, files } from '@/lib/db/schema';
import { eq, and, sql, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const currentPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    });

    if (!currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const threadId = currentPost.threadId || postId;

    const threadPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        subject: posts.subject,
        course: posts.course,
        semester: posts.semester,
        threadOrder: posts.threadOrder,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        downloadsCount: posts.downloadsCount,
        viewsCount: posts.viewsCount,
        createdAt: posts.createdAt,
        userId: users.id,
        userName: users.name,
        userUsername: users.username,
        userImage: users.image,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.threadId, threadId))
      .orderBy(asc(posts.threadOrder));

    const postIds = threadPosts.map((p) => p.id);

    const postFiles = postIds.length
      ? await db.query.files.findMany({
          where: sql`${files.postId} IN (${sql.join(postIds.map((id) => sql`${id}`), sql`, `)})`,
        })
      : [];

    const result = threadPosts.map((post) => ({
      id: post.id,
      title: post.title,
      description: post.description,
      subject: post.subject,
      course: post.course,
      semester: post.semester,
      threadOrder: post.threadOrder,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      downloadsCount: post.downloadsCount,
      viewsCount: post.viewsCount,
      createdAt: post.createdAt,
      user: { id: post.userId, name: post.userName, username: post.userUsername, image: post.userImage },
      files: postFiles.filter((f) => f.postId === post.id).map((f) => ({
        id: f.id,
        fileName: f.fileName,
        originalName: f.originalName,
        fileUrl: f.fileUrl,
        fileSize: f.fileSize,
        fileType: f.fileType,
      })),
    }));

    return NextResponse.json({
      threadId,
      threadTitle: threadPosts[0]?.title || '',
      posts: result,
      count: result.length,
    });
  } catch (error) {
    console.error('Get thread error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
