import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { reports } from '@/lib/db/schema';
import { generateId } from '@/lib/utils';
import { reportSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { targetType, targetId, reason, description } = parsed.data;

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
