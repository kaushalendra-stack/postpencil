import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { emailLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 15000,
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  purpose: string;
  userId?: string;
}

export async function sendEmail({ to, subject, html, purpose, userId }: SendEmailOptions) {
  const id = randomUUID();

  // Always log the attempt to DB first
  try {
    await db.insert(emailLogs).values({
      id,
      userId: userId || null,
      to,
      subject,
      body: html.substring(0, 5000), // Truncate to avoid issues
      purpose,
      status: 'pending',
    });
  } catch (logErr) {
    console.error('[Email] Failed to create log entry:', logErr);
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"PostPencil" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    try {
      await db.update(emailLogs).set({ status: 'sent' }).where(eq(emailLogs.id, id));
    } catch (updateErr) {
      console.error('[Email] Failed to update log status:', updateErr);
    }

    return true;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Email] Send failed:', errMsg);

    try {
      await db.update(emailLogs).set({ status: 'failed', errorMessage: errMsg }).where(eq(emailLogs.id, id));
    } catch (updateErr) {
      console.error('[Email] Failed to update log status:', updateErr);
    }

    return false;
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
    </head>
    <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${APP_URL}" style="text-decoration:none;">
                    <img src="${APP_URL}/logo.svg" alt="PostPencil" width="180" style="display:block;height:auto;" />
                  </a>
                </td>
              </tr>
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1);">
              <tr>
                <td style="padding:40px 36px 32px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding:0 36px 32px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="border-top:1px solid #e5e5e5;padding-top:24px;text-align:center;">
                        <p style="margin:0 0 8px;font-size:13px;color:#a3a3a3;">
                          PostPencil — Share knowledge, learn together
                        </p>
                        <p style="margin:0;font-size:12px;color:#d4d4d4;">
                          &copy; ${new Date().getFullYear()} PostPencil. All rights reserved.
                        </p>
                        <p style="margin:8px 0 0;font-size:11px;color:#d4d4d4;">
                          <a href="${APP_URL}/privacy" style="color:#a3a3a3;text-decoration:underline;">Privacy</a>
                          &nbsp;&middot;&nbsp;
                          <a href="${APP_URL}/terms" style="color:#a3a3a3;text-decoration:underline;">Terms</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function verificationEmailHtml(name: string, token: string, userId: string): string {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}&id=${userId}`;

  const content = `
    <div style="text-align:center;">
      <div style="width:56px;height:56px;margin:0 auto 24px;background-color:#f5f5f4;border-radius:14px;display:flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#171717" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#171717;letter-spacing:-0.025em;">
        Verify your email
      </h1>
      <p style="margin:0 0 32px;font-size:15px;color:#737373;line-height:1.6;">
        Hi ${name}, welcome to PostPencil! Click the button below to verify your email address and get started.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="border-radius:10px;background-color:#171717;">
            <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
              Verify Email Address
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:32px 0 0;font-size:13px;color:#a3a3a3;line-height:1.5;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;
  return emailWrapper(content);
}

export function resetPasswordEmailHtml(name: string, token: string, userId: string): string {
  const resetUrl = `${APP_URL}/api/auth/reset-password?token=${token}&id=${userId}`;

  const content = `
    <div style="text-align:center;">
      <div style="width:56px;height:56px;margin:0 auto 24px;background-color:#f5f5f4;border-radius:14px;display:flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#171717" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#171717;letter-spacing:-0.025em;">
        Reset your password
      </h1>
      <p style="margin:0 0 32px;font-size:15px;color:#737373;line-height:1.6;">
        Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="border-radius:10px;background-color:#171717;">
            <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:32px 0 0;font-size:13px;color:#a3a3a3;line-height:1.5;">
        This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;
  return emailWrapper(content);
}

export function welcomeEmailHtml(name: string): string {
  const content = `
    <div style="text-align:center;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#171717;letter-spacing:-0.025em;">
        Welcome to PostPencil!
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#737373;line-height:1.6;">
        Hi ${name}, your account is all set. Start exploring and sharing educational resources with the community.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="border-radius:10px;background-color:#171717;">
            <a href="${APP_URL}/home" target="_blank" style="display:inline-block;padding:14px 36px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
              Explore PostPencil
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;
  return emailWrapper(content);
}
