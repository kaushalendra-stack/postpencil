import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tags } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const trendingTags = await db.query.tags.findMany({
      orderBy: desc(tags.postsCount),
      limit,
    });

    return NextResponse.json(trendingTags, { status: 200 });
  } catch (error) {
    console.error('Get trending tags error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
