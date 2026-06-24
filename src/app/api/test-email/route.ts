import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  const result = await sendVerificationEmail('frankyvack@gmail.com', '123456');
  return NextResponse.json({
    success: result,
    elapsed: `${Date.now() - start}ms`,
    method: process.env.RESEND_API_KEY ? 'resend' : 'smtp',
  });
}
