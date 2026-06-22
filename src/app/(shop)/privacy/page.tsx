'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';

export default function PrivacyPage() {
  const { locale } = useLocale();
  const fa = locale === 'fa';

  const sections = fa ? [
    {
      title: 'جمع‌آوری اطلاعات',
      content: 'ما اطلاعاتی را که شما هنگام ثبت‌نام، خرید یا تماس با ما ارائه می‌دهید جمع‌آوری می‌کنیم. این اطلاعات شامل نام، ایمیل، شماره تلفن، آدرس و اطلاعات پرداخت می‌شود. همچنین اطلاعات فنی مانند آدرس IP، نوع مرورگر و سیستم‌عامل شما به صورت خودکار ثبت می‌شود.',
    },
    {
      title: 'استفاده از اطلاعات',
      content: 'اطلاعات شما برای پردازش سفارش‌ها، ارسال کالا، ارائه خدمات پشتیبانی، ارسال اطلاع‌رسانی‌های مرتبط (در صورت رضایت شما)، بهبود تجربه کاربری و تحلیل آماری استفاده می‌شود. ما هرگز از اطلاعات شما برای مقاصد غیرمرتبط استفاده نمی‌کنیم.',
    },
    {
      title: 'کوکی‌ها',
      content: 'وب‌سایت ما از کوکی‌ها برای بهبود تجربه کاربری، ذخیره ترجیحات شما (مانند زبان و تم) و تحلیل ترافیک سایت استفاده می‌کند. شما می‌توانید تنظیمات کوکی مرورگر خود را تغییر دهید، اما این ممکن است بر عملکرد برخی قابلیت‌های سایت تاثیر بگذارد.',
    },
    {
      title: 'اشتراک‌گذاری با اشخاص ثالث',
      content: 'ما اطلاعات شخصی شما را بدون رضایت صریح شما به اشخاص ثالث نمی‌فروشیم یا ارائه نمی‌دهیم. تنها استثنا شامل شرکت‌های حمل و نقل (برای ارسال سفارش) و درگاه‌های پرداخت (برای پردازش تراکنش) می‌شود که فقط اطلاعات ضروری در اختیار آن‌ها قرار می‌گیرد.',
    },
    {
      title: 'امنیت اطلاعات',
      content: 'ما از پروتکل‌های امنیتی SSL/TLS، رمزنگاری داده‌ها و فایروال‌های پیشرفته برای محافظت از اطلاعات شما استفاده می‌کنیم. با این حال، هیچ روش انتقال اطلاعات از طریق اینترنت ۱۰۰% امن نیست و ما نمی‌توانیم امنیت مطلق را تضمین کنیم.',
    },
    {
      title: 'حقوق شما',
      content: 'شما حق دارید به اطلاعات شخصی خود دسترسی داشته باشید، آن‌ها را اصلاح یا حذف کنید. برای این کار می‌توانید از طریق پنل کاربری خود اقدام کنید یا با تیم پشتیبانی ما تماس بگیرید. همچنین می‌توانید در هر زمان از دریافت ایمیل‌های تبلیغاتی انصراف دهید.',
    },
  ] : [
    {
      title: 'Data Collection',
      content: 'We collect information you provide when registering, making purchases, or contacting us. This includes your name, email, phone number, address, and payment information. Technical data such as IP address, browser type, and operating system is also automatically collected.',
    },
    {
      title: 'Use of Information',
      content: 'Your information is used for order processing, shipping, customer support, sending relevant notifications (with your consent), improving user experience, and statistical analysis. We never use your information for unrelated purposes.',
    },
    {
      title: 'Cookies',
      content: 'Our website uses cookies to improve user experience, save your preferences (such as language and theme), and analyze site traffic. You can change your browser\'s cookie settings, but this may affect some site features.',
    },
    {
      title: 'Third-Party Sharing',
      content: 'We do not sell or share your personal information with third parties without your explicit consent. The only exceptions are shipping carriers (for order delivery) and payment gateways (for transaction processing), which only receive necessary information.',
    },
    {
      title: 'Data Security',
      content: 'We use SSL/TLS security protocols, data encryption, and advanced firewalls to protect your information. However, no method of internet data transmission is 100% secure, and we cannot guarantee absolute security.',
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, modify, or delete your personal information. You can do this through your user panel or by contacting our support team. You can also opt out of promotional emails at any time.',
    },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-[#0a0a0d]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.1), transparent)' }} />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 animate-slide-up">
              {fa ? 'حریم ' : 'Privacy '}
              <span className="text-gradient">{fa ? 'خصوصی' : 'Policy'}</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg animate-slide-up-delay-1">
              {fa ? 'حفاظت از اطلاعات شما برای ما اهمیت دارد' : 'Protecting your data matters to us'}
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="card p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-sm font-black">{i + 1}</span>
                  {section.title}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-600 mt-10">
            {fa ? 'آخرین بروزرسانی: تیر ۱۴۰۵' : 'Last updated: June 2026'}
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
