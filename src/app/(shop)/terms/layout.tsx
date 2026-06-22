import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قوانین و مقررات',
  description: 'قوانین و شرایط استفاده از فروشگاه آنلاین Z7shop. شرایط خرید، ارسال، بازگشت کالا و حقوق مشتری.',
  alternates: { canonical: 'https://z7shop.ir/terms' },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
