'use client';
import { useStore } from '@/store/useStore';
import { getDictionary } from '@/i18n';

export function useLocale() {
  const locale = useStore((s) => s.locale);
  const setLocale = useStore((s) => s.setLocale);
  const dict = getDictionary(locale);
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  const toggleLocale = () => {
    setLocale(locale === 'fa' ? 'en' : 'fa');
  };

  return { locale, setLocale, dict, dir, toggleLocale };
}
