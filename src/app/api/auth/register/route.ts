import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { sendEmail, verificationEmailHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least one uppercase letter' }, { status: 400 });
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least one lowercase letter' }, { status: 400 });
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least one number' }, { status: 400 });
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json({ error: 'Password must contain at least one special character' }, { status: 400 });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({
      where: or(eq(users.email, email), eq(users.username, username)),
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = randomUUID();

    await db.insert(users).values({
      id: userId,
      name,
      username,
      email,
      password: hashedPassword,
      provider: 'credentials',
    });

    const token = randomUUID();

    await db.insert(verificationTokens).values({
      id: randomUUID(),
      identifier: `verify:${userId}`,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    sendEmail({
      to: email,
      subject: 'Verify your email - PostPencil',
      html: verificationEmailHtml(name, token, userId),
      purpose: 'verification',
      userId,
    }).catch(console.error);

    return NextResponse.json({ message: 'Account created. Please check your email to verify.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
