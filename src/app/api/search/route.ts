import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts, users, tags } from '@/lib/db/schema';
import { eq, or, like, sql, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!q.trim()) {
      return NextResponse.json({ posts: [], users: [], tags: [] }, { status: 200 });
    }

    const searchTerm = `%${q}%`;

    const results: Record<string, unknown[]> = {};

    if (type === 'all' || type === 'posts') {
      const matchedPosts = await db
        .select({
          id: posts.id,
          title: posts.title,
          description: posts.description,
          resourceType: posts.resourceType,
          likesCount: posts.likesCount,
          viewsCount: posts.viewsCount,
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
        .where(
          and(
            or(
              like(posts.title, searchTerm),
              like(posts.description, searchTerm),
              like(posts.subject, searchTerm),
              like(posts.course, searchTerm),
            ),
            eq(posts.isPublished, true),
            sql`${posts.deletedAt} IS NULL`,
          ),
        )
        .orderBy(desc(posts.trendingScore), desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      results.posts = matchedPosts;
    }

    if (type === 'all' || type === 'users') {
      const matchedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          username: users.username,
          image: users.image,
          bio: users.bio,
          followersCount: users.followersCount,
          postsCount: users.postsCount,
        })
        .from(users)
        .where(
          and(
            or(
              like(users.name, searchTerm),
              like(users.username, searchTerm),
              like(users.bio, searchTerm),
            ),
            sql`${users.deletedAt} IS NULL`,
          ),
        )
        .limit(limit)
        .offset(offset);

      results.users = matchedUsers;
    }

    if (type === 'all' || type === 'tags') {
      const matchedTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          slug: tags.slug,
          postsCount: tags.postsCount,
        })
        .from(tags)
        .where(like(tags.name, searchTerm))
        .orderBy(desc(tags.postsCount))
        .limit(limit)
        .offset(offset);

      results.tags = matchedTags;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
