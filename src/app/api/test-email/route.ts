import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    return NextResponse.json({ error: 'No RESEND_API_KEY', method: 'none' });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Z7shop <noreply@z7shop.ir>`,
        to: 'frankyvack@gmail.com',
        subject: 'Test Z7shop',
        html: '<p>Test from Railway</p>',
      }),
    });
    const data = await res.text();
    return NextResponse.json({
      success: res.ok,
      status: res.status,
      response: data,
      elapsed: `${Date.now() - start}ms`,
      keyPrefix: resendKey.substring(0, 8) + '...',
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: (err as Error).message,
      elapsed: `${Date.now() - start}ms`,
    });
  }
}
