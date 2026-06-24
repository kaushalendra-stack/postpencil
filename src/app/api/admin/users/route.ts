import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { users } from '@/lib/db/schema';
import { desc, sql, like, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const whereClause = search
      ? and(
          sql`${users.deletedAt} IS NULL`,
          sql`(${users.name} LIKE ${`%${search}%`} OR ${users.username} LIKE ${`%${search}%`} OR ${users.email} LIKE ${`%${search}%`})`,
        )
      : sql`${users.deletedAt} IS NULL`;

    const data = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        role: users.role,
        isBanned: users.isBanned,
        postsCount: users.postsCount,
        followersCount: users.followersCount,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Get admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
