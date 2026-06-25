import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { sendEmail } from '@/lib/email';

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
      return NextResponse.json({ message: 'If an account exists, a verification email was sent.' }, { status: 200 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
    }

    await db.delete(verificationTokens)
      .where(eq(verificationTokens.identifier, `verify:${user.id}`));

    const token = randomUUID();

    await db.insert(verificationTokens).values({
      id: randomUUID(),
      identifier: `verify:${user.id}`,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    sendEmail({
      to: email,
      type: 'verification',
      name: user.name || 'User',
      token,
      userId: user.id,
      purpose: 'verification',
      logUserId: user.id,
    }).catch(console.error);

    return NextResponse.json({ message: 'Verification email sent' }, { status: 200 });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
