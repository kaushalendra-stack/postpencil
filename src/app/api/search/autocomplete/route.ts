import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { posts, tags, postTags } from '@/lib/db/schema'
import { eq, like, or, and, sql, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    if (q.length < 2) {
      return NextResponse.json({ suggestions: [] }, { status: 200 })
    }

    const tagSuggestions = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        type: sql<string>`'tag'`,
        count: tags.postsCount,
      })
      .from(tags)
      .where(like(tags.name, `%${q}%`))
      .orderBy(desc(tags.postsCount))
      .limit(5)

    const postSuggestions = await db
      .select({
        id: posts.id,
        name: posts.title,
        type: sql<string>`'post'`,
        count: posts.likesCount,
      })
      .from(posts)
      .where(
        and(
          eq(posts.isPublished, true),
          or(
            like(posts.title, `%${q}%`),
            like(posts.subject, `%${q}%`),
            like(posts.course, `%${q}%`)
          )
        )
      )
      .orderBy(desc(posts.trendingScore))
      .limit(5)

    return NextResponse.json({
      suggestions: [...tagSuggestions, ...postSuggestions].slice(0, 8),
    }, { status: 200 })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}
