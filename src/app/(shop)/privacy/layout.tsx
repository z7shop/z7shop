import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست حفظ حریم خصوصی فروشگاه Z7shop. نحوه جمع‌آوری، استفاده و محافظت از اطلاعات شخصی کاربران.',
  alternates: { canonical: 'https://z7shop.ir/privacy' },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
