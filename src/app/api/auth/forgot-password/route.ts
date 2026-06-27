import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { sendEmail } from '@/lib/email';
import { forgotPasswordSchema } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || 'Invalid email' }, { status: 400 });
    }

    const { email } = parsed.data;

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
      id: randomUUID(),
      identifier: `reset:${user.id}`,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    sendEmail({
      to: email,
      type: 'reset_password',
      name: user.name || 'User',
      token,
      userId: user.id,
      purpose: 'password_reset',
      logUserId: user.id,
    }).catch(console.error);

    return NextResponse.json({ message: 'If an account exists, a reset email was sent.' }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
