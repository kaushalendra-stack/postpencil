import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { bookmarkCollections, bookmarks } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await db.query.bookmarkCollections.findMany({
      where: eq(bookmarkCollections.userId, session.user.id),
      orderBy: desc(bookmarkCollections.createdAt),
    });

    const collectionsWithCount = await Promise.all(
      collections.map(async (col) => {
        const result = await db
          .select({ count: count() })
          .from(bookmarks)
          .where(eq(bookmarks.collectionId, col.id));
        return {
          ...col,
          count: result[0]?.count || 0,
        };
      })
    );

    return NextResponse.json(collectionsWithCount, { status: 200 });
  } catch (error) {
    console.error('Get bookmark collections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const id = generateId();
    await db.insert(bookmarkCollections).values({
      id,
      userId: session.user.id,
      name: name.trim(),
      description: description || null,
    });

    return NextResponse.json({ id, name: name.trim(), description }, { status: 201 });
  } catch (error) {
    console.error('Create bookmark collection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
