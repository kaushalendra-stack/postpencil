import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import { posts, users, tags, files, postTags } from '@/lib/db/schema'
import { eq, desc, sql, and, inArray } from 'drizzle-orm'

export const getCachedPost = unstable_cache(
  async (postId: string) => {
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
      .limit(1)

    if (!post.length) return null

    const postFiles = await db.query.files.findMany({
      where: eq(files.postId, postId),
    })

    const postTagsData = await db
      .select({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId))

    return {
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
    }
  },
  ['post-detail'],
  { revalidate: 60, tags: ['posts'] }
)

export const getCachedUser = unstable_cache(
  async (username: string) => {
    return db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        banner: true,
        bio: true,
        college: true,
        course: true,
        semester: true,
        twitterUrl: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        role: true,
        isPrivate: true,
        isBanned: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        createdAt: true,
      },
    })
  },
  ['user-profile'],
  { revalidate: 120, tags: ['users'] }
)

export const getCachedTags = unstable_cache(
  async () => {
    return db
      .select()
      .from(tags)
      .orderBy(desc(tags.postsCount))
      .limit(20)
  },
  ['trending-tags'],
  { revalidate: 300, tags: ['tags'] }
)

export const getCachedPosts = unstable_cache(
  async (page: number, feed: string) => {
    const limit = 10
    const offset = (page - 1) * limit

    let query = db
      .select({
        id: posts.id,
        title: posts.title,
        description: posts.description,
        subject: posts.subject,
        course: posts.course,
        semester: posts.semester,
        resourceType: posts.resourceType,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        downloadsCount: posts.downloadsCount,
        bookmarksCount: posts.bookmarksCount,
        viewsCount: posts.viewsCount,
        trendingScore: posts.trendingScore,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.isPublished, true))

    if (feed === 'trending') {
      query = query.orderBy(desc(posts.trendingScore))
    } else {
      query = query.orderBy(desc(posts.createdAt))
    }

    const data = await query.limit(limit).offset(offset)

    const postIds = data.map((p) => p.id)
    const postFiles = postIds.length
      ? await db.query.files.findMany({
          where: inArray(files.postId, postIds),
        })
      : []

    const filesByPost = new Map<string, typeof postFiles>()
    for (const f of postFiles) {
      if (!filesByPost.has(f.postId!)) filesByPost.set(f.postId!, [])
      filesByPost.get(f.postId!)!.push(f)
    }

    const enriched = data.map((post) => ({
      ...post,
      files: (filesByPost.get(post.id) || []).map((f) => ({
        id: f.id,
        fileName: f.fileName,
        originalName: f.originalName,
        fileUrl: f.fileUrl,
        fileSize: f.fileSize,
        mimeType: f.mimeType,
        fileType: f.fileType,
        thumbnailUrl: f.thumbnailUrl,
      })),
    }))

    return { data: enriched, page, hasMore: data.length === limit }
  },
  ['posts-feed'],
  { revalidate: 30, tags: ['posts'] }
)
