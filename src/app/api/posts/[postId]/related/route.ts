import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, users, files, postTags } from '@/lib/db/schema'
import { eq, and, sql, ne } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params

    const currentPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: { subject: true, course: true, tags: true },
    })

    if (!currentPost) {
      return NextResponse.json({ data: [] }, { status: 200 })
    }

    const currentTags = await db
      .select({ tagId: postTags.tagId })
      .from(postTags)
      .where(eq(postTags.postId, postId))

    const tagIds = currentTags.map((t) => t.tagId)

    let relatedQuery = db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        subject: posts.subject,
        course: posts.course,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        viewsCount: posts.viewsCount,
        createdAt: posts.createdAt,
        userName: users.name,
        userUsername: users.username,
        userImage: users.image,
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(
        and(
          ne(posts.id, postId),
          eq(posts.isPublished, true),
          sql`${posts.deletedAt} IS NULL`
        )
      )
      .orderBy(sql`${posts.trendingScore} DESC`)
      .limit(5)

    if (tagIds.length > 0) {
      relatedQuery = db
        .select({
          id: posts.id,
          title: posts.title,
          description: posts.description,
          subject: posts.subject,
          course: posts.course,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          viewsCount: posts.viewsCount,
          createdAt: posts.createdAt,
          userName: users.name,
          userUsername: users.username,
          userImage: users.image,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .innerJoin(postTags, eq(posts.id, postTags.postId))
        .where(
          and(
            ne(posts.id, postId),
            eq(posts.isPublished, true),
            sql`${posts.deletedAt} IS NULL`,
            sql`${postTags.tagId} IN (${sql.join(tagIds.map((id) => sql`${id}`), sql`, `)})`
          )
        )
        .orderBy(sql`${posts.trendingScore} DESC`)
        .limit(5)
    }

    const related = await relatedQuery

    const postIds = related.map((p) => p.id)
    const postFiles = postIds.length
      ? await db.query.files.findMany({
          where: sql`${files.postId} IN (${sql.join(postIds.map((id) => sql`${id}`), sql`, `)})`,
        })
      : []

    const result = related.map((post) => ({
      ...post,
      user: { name: post.userName, username: post.userUsername, image: post.userImage },
      files: postFiles.filter((f) => f.postId === post.id).map((f) => ({
        id: f.id,
        fileType: f.fileType,
        originalName: f.originalName,
      })),
    }))

    return NextResponse.json({ data: result }, { status: 200 })
  } catch (error) {
    console.error('Get related posts error:', error)
    return NextResponse.json({ data: [] }, { status: 200 })
  }
}
