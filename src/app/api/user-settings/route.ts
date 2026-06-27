import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (!settings) {
      const defaultSettings = {
        id: generateId(),
        userId: session.user.id,
      };
      await db.insert(userSettings).values(defaultSettings);
      const [newSettings] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, session.user.id))
        .limit(1);
      return NextResponse.json(newSettings, { status: 200 });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Get user settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = [
      'emailNotifications', 'pushNotifications', 'likeNotifications',
      'commentNotifications', 'followNotifications', 'downloadNotifications',
      'isPrivate', 'showEmail', 'showFollowers', 'allowComments',
      'appearInSearch', 'theme', 'compactMode',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: userSettings.id })
      .from(userSettings)
      .where(eq(userSettings.userId, session.user.id))
      .limit(1);

    if (!existing) {
      await db.insert(userSettings).values({
        id: generateId(),
        userId: session.user.id,
        ...updates,
      });
    } else {
      await db
        .update(userSettings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(userSettings.userId, session.user.id));
    }

    return NextResponse.json({ message: 'Settings updated' }, { status: 200 });
  } catch (error) {
    console.error('Update user settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
