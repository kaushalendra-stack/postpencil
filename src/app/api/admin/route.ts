import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { users, posts, reports, downloads } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.deletedAt} IS NULL`);

    const totalPosts = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(sql`${posts.deletedAt} IS NULL`);

    const pendingReports = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.status, 'pending'));

    const totalDownloads = await db
      .select({ count: sql<number>`count(*)` })
      .from(downloads);

    const totalBannedUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isBanned, true));

    return NextResponse.json({
      totalUsers: totalUsers[0]?.count || 0,
      totalPosts: totalPosts[0]?.count || 0,
      pendingReports: pendingReports[0]?.count || 0,
      totalDownloads: totalDownloads[0]?.count || 0,
      totalBannedUsers: totalBannedUsers[0]?.count || 0,
    }, { status: 200 });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
