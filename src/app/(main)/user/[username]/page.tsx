import { Metadata } from 'next'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { MainLayout } from '@/components/layout/main-layout'
import { UserProfile } from '@/components/user/user-profile'
import { siteMetadata, profileJsonLd } from '@/lib/seo'

export const revalidate = 120

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        name: true,
        username: true,
        bio: true,
        image: true,
        postsCount: true,
        followersCount: true,
        college: true,
        course: true,
        isBanned: true,
        isPrivate: true,
      },
    })

    if (!user || user.isBanned) {
      return siteMetadata('User Not Found', 'This user profile does not exist.')
    }

    const name = user.name || username
    const desc = user.bio || `${name}'s profile on PostPencil`
    const keywords = [name, 'student', user.college, user.course].filter(Boolean)

    return {
      ...siteMetadata(`${name} (@${username})`, desc),
      keywords,
      alternates: {
        canonical: `https://postpencil.com/user/${username}`,
      },
    }
  } catch {
    return siteMetadata()
  }
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  let jsonLd: object | null = null

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        name: true,
        username: true,
        bio: true,
        image: true,
        postsCount: true,
        followersCount: true,
      },
    })

    if (user) {
      jsonLd = profileJsonLd(user)
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
      <MainLayout>
        <UserProfile />
      </MainLayout>
    </>
  )
}
