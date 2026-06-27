import { Metadata } from 'next'
import { db } from '@/lib/db'
import { posts, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { MainLayout } from '@/components/layout/main-layout'
import { ModernPostDetail } from '@/components/post/modern-post-detail'
import { siteMetadata, postJsonLd } from '@/lib/seo'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>
}): Promise<Metadata> {
  const { postId } = await params
  try {
    const post = await db
      .select({
        title: posts.title,
        description: posts.description,
        subject: posts.subject,
        course: posts.course,
        createdAt: posts.createdAt,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        viewsCount: posts.viewsCount,
        user: { name: users.name, username: users.username },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post.length) {
      return siteMetadata('Post Not Found', 'This post does not exist or has been removed.')
    }

    const p = post[0]
    const title = p.title || 'Educational Resource'
    const desc = p.description || `${title} — shared on PostPencil`
    const keywords = [p.subject, p.course, 'notes', 'educational resources'].filter((k): k is string => Boolean(k))

    return {
      ...siteMetadata(title, desc),
      keywords,
      alternates: {
        canonical: `https://postpencil.com/post/${postId}`,
      },
    }
  } catch {
    return siteMetadata()
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  let jsonLd: object | null = null

  try {
    const post = await db
      .select({
        title: posts.title,
        description: posts.description,
        subject: posts.subject,
        course: posts.course,
        createdAt: posts.createdAt,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        viewsCount: posts.viewsCount,
        user: { name: users.name, username: users.username },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId))
      .limit(1)

    if (post.length) {
      jsonLd = postJsonLd(post[0], postId)
    }
  } catch {}

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <MainLayout showBack>
        <ModernPostDetail />
      </MainLayout>
    </>
  )
}
