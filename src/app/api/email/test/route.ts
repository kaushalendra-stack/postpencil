import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { to } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject: 'PostPencil SMTP Test',
      html: `
        <h2>SMTP Test Email</h2>
        <p>This is a test email from PostPencil. If you received this, your SMTP configuration is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      purpose: 'smtp_test',
      userId: session.user.id,
    });

    if (result) {
      return NextResponse.json({ message: 'Test email sent successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
