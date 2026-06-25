import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { sendEmail, resetPasswordEmailHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset email was sent.' }, { status: 200 });
    }

    await db.delete(verificationTokens)
      .where(eq(verificationTokens.identifier, `reset:${user.id}`));

    const token = randomUUID();

    await db.insert(verificationTokens).values({
      identifier: `reset:${user.id}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    sendEmail({
      to: email,
      subject: 'Reset your password - PostPencil',
      html: resetPasswordEmailHtml(user.name || 'User', token, user.id),
      purpose: 'password_reset',
      userId: user.id,
    }).catch(console.error);

    return NextResponse.json({ message: 'If an account exists, a reset email was sent.' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
