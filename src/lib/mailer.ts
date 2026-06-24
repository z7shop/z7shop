async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    return sendViaResend(resendKey, to, subject, html);
  }
  return sendViaSMTP(to, subject, html);
}

async function sendViaResend(apiKey: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const fromDomain = process.env.RESEND_FROM_DOMAIN || 'z7shop.ir';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Z7shop <noreply@${fromDomain}>`,
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', res.status, err);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Resend failed:', (err as Error).message);
    return false;
  }
}

async function sendViaSMTP(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 15000,
      socketTimeout: 15000,
      greetingTimeout: 15000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Z7shop" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('SMTP failed:', (err as Error).message);
    return false;
  }
}

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  return sendEmail(to, 'کد تأیید Z7shop | Verification Code', `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0c0c0f; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
      <div style="background: linear-gradient(135deg, #C9A84C, #B8941F); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 900;">Z7shop</h1>
      </div>
      <div style="padding: 32px 24px; text-align: center;">
        <p style="color: #ccc; font-size: 14px; margin-bottom: 8px;">کد تأیید شما:</p>
        <div style="background: #1a1a1f; border: 2px solid #C9A84C; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <span style="font-size: 36px; font-weight: 900; color: #C9A84C; letter-spacing: 12px; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 16px;">این کد تا ۱۰ دقیقه معتبر است.</p>
        <p style="color: #555; font-size: 11px; margin-top: 24px;">اگر شما درخواست ثبت‌نام نداده‌اید، این ایمیل را نادیده بگیرید.</p>
      </div>
    </div>
  `);
}

export async function sendStockAlertEmail(to: string, productNameFa: string, productNameEn: string, productId: string): Promise<boolean> {
  return sendEmail(to, 'محصول مورد نظر شما موجود شد! | Product Back in Stock!', `
    <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0c0c0f; border-radius: 16px; overflow: hidden; border: 1px solid #222;">
      <div style="background: linear-gradient(135deg, #C9A84C, #B8941F); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 900;">Z7shop</h1>
      </div>
      <div style="padding: 32px 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
        <h2 style="color: #C9A84C; font-size: 20px; margin-bottom: 8px;">محصول موجود شد!</h2>
        <p style="color: #ccc; font-size: 14px; margin-bottom: 4px;">${productNameFa}</p>
        <p style="color: #888; font-size: 12px; margin-bottom: 24px;">${productNameEn}</p>
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/products/${productId}" style="display: inline-block; background: linear-gradient(135deg, #C9A84C, #B8941F); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 14px;">مشاهده و خرید</a>
        <p style="color: #555; font-size: 11px; margin-top: 24px;">این ایمیل به درخواست شما ارسال شده است.</p>
      </div>
    </div>
  `);
}
