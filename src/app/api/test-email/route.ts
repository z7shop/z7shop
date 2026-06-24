import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const testEmail = 'frankyvack@gmail.com';
  const results: any[] = [];

  const configs = [
    { label: 'port465-ssl', port: 465, secure: true },
    { label: 'port587-starttls', port: 587, secure: false },
  ];

  for (const cfg of configs) {
    const start = Date.now();
    try {
      const t = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: cfg.port,
        secure: cfg.secure,
        connectionTimeout: 12000,
        socketTimeout: 12000,
        greetingTimeout: 12000,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await t.sendMail({
        from: `"Z7shop" <${process.env.SMTP_USER}>`,
        to: testEmail,
        subject: `Test ${cfg.label}`,
        text: `Test from ${cfg.label}`,
      });
      results.push({ ...cfg, success: true, elapsed: `${Date.now() - start}ms` });
    } catch (err: any) {
      results.push({ ...cfg, success: false, error: err.message, code: err.code, elapsed: `${Date.now() - start}ms` });
    }
  }

  return NextResponse.json({
    results,
    smtpUser: process.env.SMTP_USER ? 'set' : 'NOT SET',
    smtpPass: process.env.SMTP_PASS ? 'set' : 'NOT SET',
  });
}
