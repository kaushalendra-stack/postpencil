const PHP_EMAIL_URL = process.env.PHP_EMAIL_URL || 'https://postpencil.protoolvault.in/send-email.php';

interface SendEmailOptions {
  to: string;
  type: string;
  name?: string;
  token?: string;
  userId?: string;
  purpose: string;
  logUserId?: string;
}

export async function sendEmail({ to, type, name, token, userId, purpose, logUserId }: SendEmailOptions) {
  try {
    const res = await fetch(PHP_EMAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, type, name, token, userId, purpose, logUserId }),
      signal: AbortSignal.timeout(30000),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      console.log(`[Email] Sent: ${type} to ${to} (log: ${data.logId})`);
      return true;
    } else {
      console.error('[Email] Failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('[Email] Error:', error instanceof Error ? error.message : error);
    return false;
  }
}
