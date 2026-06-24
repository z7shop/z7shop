import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const testCode = '123456';
  const testEmail = 'frankyvack@gmail.com';

  const startTime = Date.now();
  try {
    const result = await sendVerificationEmail(testEmail, testCode);
    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      success: result,
      elapsed: `${elapsed}ms`,
      smtpUser: process.env.SMTP_USER ? 'set' : 'NOT SET',
      smtpPass: process.env.SMTP_PASS ? 'set' : 'NOT SET',
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    });
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      error: err.message,
      elapsed: `${elapsed}ms`,
      smtpUser: process.env.SMTP_USER ? 'set' : 'NOT SET',
      smtpPass: process.env.SMTP_PASS ? 'set' : 'NOT SET',
    }, { status: 500 });
  }
}
