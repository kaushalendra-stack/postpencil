import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { or, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.username, identifier)))
      .limit(1);

    if (!user || !user.password) {
      return NextResponse.json({ verified: false });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ verified: false });
    }

    return NextResponse.json({
      verified: !!user.emailVerified,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Check verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
