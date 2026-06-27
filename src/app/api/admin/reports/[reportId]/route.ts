import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { reports, auditLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  try {
    const { reportId } = await params;
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { status } = await request.json();

    if (!status || !['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const report = await db.query.reports.findFirst({
      where: eq(reports.id, reportId),
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    await db
      .update(reports)
      .set({
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
      })
      .where(eq(reports.id, reportId));

    await db.insert(auditLogs).values({
      id: randomUUID(),
      adminId: session.user.id,
      action: `report_${status}`,
      targetType: 'report',
      targetId: reportId,
      details: `Report ${status} (type: ${report.targetType})`,
    });

    return NextResponse.json({ message: 'Report updated' }, { status: 200 });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
