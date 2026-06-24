import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { reports } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetType, targetId, reason, description } = await request.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'Target type, target ID, and reason are required' }, { status: 400 });
    }

    if (!['post', 'user'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (!['spam', 'inappropriate', 'copyright', 'harassment', 'other'].includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    const report = await db.insert(reports).values({
      id: generateId(),
      reporterId: session.user.id,
      targetType,
      targetId,
      reason,
      description: description || null,
    });

    return NextResponse.json({ message: 'Report submitted' }, { status: 201 });
  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
