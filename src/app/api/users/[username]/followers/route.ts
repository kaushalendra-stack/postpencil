import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'
import { users, follows } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'followers'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (type === 'followers') {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
          bio: users.bio,
          followersCount: users.followersCount,
          postsCount: users.postsCount,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followerId, users.id))
        .where(eq(follows.followingId, user.id))
        .limit(limit)
        .offset(offset)

      return NextResponse.json({ data: result, type: 'followers' }, { status: 200 })
    } else {
      const result = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
          bio: users.bio,
          followersCount: users.followersCount,
          postsCount: users.postsCount,
        })
        .from(follows)
        .innerJoin(users, eq(follows.followingId, users.id))
        .where(eq(follows.followerId, user.id))
        .limit(limit)
        .offset(offset)

      return NextResponse.json({ data: result, type: 'following' }, { status: 200 })
    }
  } catch (error) {
    console.error('Get followers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
