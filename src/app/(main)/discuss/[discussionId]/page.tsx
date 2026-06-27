import { Metadata } from 'next'
import { db } from '@/lib/db'
import { discussions, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { MainLayout } from '@/components/layout/main-layout'
import { DiscussionDetail } from '@/components/discuss/discussion-detail'
import { siteMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ discussionId: string }>
}): Promise<Metadata> {
  const { discussionId } = await params
  try {
    const [discussion] = await db
      .select({
        content: discussions.content,
        user: { name: users.name, username: users.username },
      })
      .from(discussions)
      .innerJoin(users, eq(discussions.userId, users.id))
      .where(eq(discussions.id, discussionId))
      .limit(1)

    if (!discussion) {
      return siteMetadata('Discussion Not Found', 'This discussion does not exist.')
    }

    const title = discussion.content?.slice(0, 60) || 'Discussion'
    const desc = discussion.content?.slice(0, 160) || `Discussion on PostPencil`

    return {
      ...siteMetadata(title, desc),
      alternates: {
        canonical: `https://postpencil.com/discuss/${discussionId}`,
      },
    }
  } catch {
    return siteMetadata()
  }
}

export default async function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ discussionId: string }>
}) {
  const { discussionId } = await params
  return (
    <MainLayout showBack>
      <DiscussionDetail discussionId={discussionId} />
    </MainLayout>
  )
}
