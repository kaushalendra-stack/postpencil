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

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        image: users.image,
        banner: users.banner,
        bio: users.bio,
        college: users.college,
        course: users.course,
        semester: users.semester,
        twitterUrl: users.twitterUrl,
        githubUrl: users.githubUrl,
        linkedinUrl: users.linkedinUrl,
        websiteUrl: users.websiteUrl,
        role: users.role,
        isPrivate: users.isPrivate,
        isBanned: users.isBanned,
        followersCount: users.followersCount,
        followingCount: users.followingCount,
        postsCount: users.postsCount,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await auth();
    const isOwnProfile = session?.user?.id === user.id;

    if (user.isPrivate && !isOwnProfile && session?.user?.role !== 'admin') {
      const { email: _, ...publicProfile } = user;
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

    const [user] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

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

    const MAX_LENGTHS: Record<string, number> = {
      name: 100, bio: 300, college: 200, course: 100, semester: 20,
      twitterUrl: 500, githubUrl: 500, linkedinUrl: 500, websiteUrl: 500,
      image: 500, banner: 500,
    };

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        const value = body[field];
        const maxLen = MAX_LENGTHS[field];
        if (maxLen && typeof value === 'string' && value.length > maxLen) {
          return NextResponse.json({ error: `${field} must be ${maxLen} characters or less` }, { status: 400 });
        }
        updates[field] = value;
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
