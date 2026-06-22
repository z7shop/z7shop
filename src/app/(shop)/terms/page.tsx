'use client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';

export default function TermsPage() {
  const { locale } = useLocale();
  const fa = locale === 'fa';

  const sections = fa ? [
    {
      title: 'شرایط عمومی',
      items: [
        'استفاده از خدمات Z7shop به منزله پذیرش این قوانین و مقررات است.',
        'Z7shop حق تغییر قیمت‌ها و شرایط فروش را در هر زمان برای خود محفوظ می‌دارد.',
        'مسئولیت صحت اطلاعات ثبت‌شده (آدرس، شماره تلفن و...) بر عهده کاربر است.',
        'هرگونه سوءاستفاده از سایت منجر به مسدود شدن حساب کاربری خواهد شد.',
      ],
    },
    {
      title: 'سیاست ارسال',
      items: [
        'ارسال سفارش‌ها از ۱ تا ۵ روز کاری پس از تایید سفارش انجام می‌شود.',
        'ارسال رایگان برای سفارش‌های بالای ۵۰۰,۰۰۰ تومان.',
        'هزینه ارسال عادی ۲۵,۰۰۰ تومان و ارسال سریع ۴۵,۰۰۰ تومان می‌باشد.',
        'ارسال به تمامی نقاط ایران انجام می‌شود.',
        'پس از ارسال، کد پیگیری مرسوله برای شما ارسال خواهد شد.',
      ],
    },
    {
      title: 'سیاست بازگشت کالا',
      items: [
        'امکان بازگشت کالا تا ۷ روز پس از دریافت وجود دارد.',
        'کالا باید در بسته‌بندی اصلی و بدون استفاده باشد.',
        'هزینه ارسال بازگشت بر عهده خریدار است مگر اینکه کالا معیوب باشد.',
        'مبلغ کالای بازگشتی ظرف ۳ تا ۵ روز کاری به حساب شما واریز می‌شود.',
        'کالاهای تخفیف‌دار ویژه قابل بازگشت نیستند.',
      ],
    },
    {
      title: 'شرایط پرداخت',
      items: [
        'پرداخت از طریق درگاه آنلاین بانکی انجام می‌شود.',
        'تمامی تراکنش‌ها از طریق درگاه امن SSL انجام می‌شوند.',
        'قیمت‌ها به تومان و شامل مالیات بر ارزش افزوده می‌باشند.',
        'در صورت عدم موفقیت تراکنش، مبلغ ظرف ۷۲ ساعت به حساب شما بازگردانده می‌شود.',
      ],
    },
    {
      title: 'حریم خصوصی',
      items: [
        'اطلاعات شخصی شما نزد ما محرمانه خواهد ماند.',
        'از اطلاعات شما فقط برای پردازش سفارش و بهبود خدمات استفاده می‌شود.',
        'اطلاعات شما بدون رضایت شما به هیچ شخص ثالثی ارائه نمی‌شود.',
        'برای جزئیات بیشتر به صفحه حریم خصوصی مراجعه کنید.',
      ],
    },
  ] : [
    {
      title: 'General Terms',
      items: [
        'By using Z7shop services, you agree to these terms and conditions.',
        'Z7shop reserves the right to change prices and sales conditions at any time.',
        'Users are responsible for the accuracy of their registered information (address, phone, etc.).',
        'Any misuse of the website will result in account suspension.',
      ],
    },
    {
      title: 'Shipping Policy',
      items: [
        'Orders are shipped within 1-5 business days after confirmation.',
        'Free shipping for orders over 500,000 Tomans.',
        'Standard shipping costs 25,000 Tomans and express shipping costs 45,000 Tomans.',
        'We ship to all locations across Iran.',
        'A tracking code will be sent to you after shipment.',
      ],
    },
    {
      title: 'Return Policy',
      items: [
        'Items can be returned within 7 days of receipt.',
        'Items must be in original packaging and unused condition.',
        'Return shipping costs are the buyer\'s responsibility unless the item is defective.',
        'Refunds are processed within 3-5 business days.',
        'Special discounted items are non-returnable.',
      ],
    },
    {
      title: 'Payment Terms',
      items: [
        'Payments are processed through secure online banking gateways.',
        'All transactions are conducted through secure SSL gateways.',
        'Prices are in Tomans and include VAT.',
        'Failed transactions are refunded within 72 hours.',
      ],
    },
    {
      title: 'Privacy',
      items: [
        'Your personal information will remain confidential.',
        'Your data is only used for order processing and service improvement.',
        'Your information will not be shared with third parties without your consent.',
        'For more details, please visit our Privacy Policy page.',
      ],
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
              {fa ? 'قوانین و ' : 'Terms & '}
              <span className="text-gradient">{fa ? 'مقررات' : 'Conditions'}</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-lg animate-slide-up-delay-1">
              {fa ? 'لطفاً قبل از خرید این شرایط را مطالعه فرمایید' : 'Please read these terms before making a purchase'}
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i} className="card p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-sm font-black">{i + 1}</span>
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
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
