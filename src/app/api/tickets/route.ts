import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { tickets, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { ticketSchema } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'admin';
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const whereClause = isAdmin
      ? undefined
      : eq(tickets.userId, session.user.id);

    const data = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        category: tickets.category,
        message: tickets.message,
        status: tickets.status,
        priority: tickets.priority,
        adminReply: tickets.adminReply,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
      })
      .from(tickets)
      .where(whereClause)
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ticketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { subject, category, message, priority } = parsed.data;

    const id = generateId();
    await db.insert(tickets).values({
      id,
      userId: session.user.id,
      subject,
      category,
      message,
      priority: priority || 'medium',
    });

    return NextResponse.json({ message: 'Ticket submitted', id }, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = (session.user as any).role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, adminReply, status } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (adminReply) updates.adminReply = adminReply;
    if (status) updates.status = status;

    await db.update(tickets).set(updates).where(eq(tickets.id, id));

    return NextResponse.json({ message: 'Ticket updated' }, { status: 200 });
  } catch (error) {
    console.error('Update ticket error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
