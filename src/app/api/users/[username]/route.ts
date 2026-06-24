import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        banner: true,
        bio: true,
        college: true,
        course: true,
        semester: true,
        twitterUrl: true,
        githubUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        role: true,
        isPrivate: true,
        isBanned: true,
        followersCount: true,
        followingCount: true,
        postsCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await auth();
    const isOwnProfile = session?.user?.id === user.id;

    if (user.isPrivate && !isOwnProfile && session?.user?.role !== 'admin') {
      const { email, ...publicProfile } = user;
      return NextResponse.json(publicProfile, { status: 200 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      'name', 'bio', 'college', 'course', 'semester',
      'twitterUrl', 'githubUrl', 'linkedinUrl', 'websiteUrl',
      'image', 'banner', 'isPrivate',
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

    await db.update(users).set(updates).where(eq(users.id, user.id));

    return NextResponse.json({ message: 'Profile updated' }, { status: 200 });
  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
