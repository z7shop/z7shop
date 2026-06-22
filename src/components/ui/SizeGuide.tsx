'use client';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { toPersianNumber } from '@/i18n';
import { HiOutlineX } from 'react-icons/hi';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SizeGuide({ open, onClose }: Props) {
  const { locale } = useLocale();
  const [tab, setTab] = useState<'tshirt' | 'pants' | 'hats'>('tshirt');

  if (!open) return null;

  const tabs = [
    { key: 'tshirt' as const, label: locale === 'fa' ? 'تی‌شرت' : 'T-Shirts' },
    { key: 'pants' as const, label: locale === 'fa' ? 'شلوار' : 'Pants' },
    { key: 'hats' as const, label: locale === 'fa' ? 'کلاه' : 'Hats' },
  ];

  const tshirtData = [
    { size: 'S', chest: 92, waist: 76, length: 68 },
    { size: 'M', chest: 96, waist: 80, length: 70 },
    { size: 'L', chest: 102, waist: 86, length: 72 },
    { size: 'XL', chest: 108, waist: 92, length: 74 },
    { size: 'XXL', chest: 114, waist: 98, length: 76 },
  ];

  const pantsData = [
    { size: '30', waist: 76, hip: 96, length: 100 },
    { size: '32', waist: 80, hip: 100, length: 102 },
    { size: '34', waist: 86, hip: 106, length: 104 },
    { size: '36', waist: 92, hip: 112, length: 106 },
    { size: '38', waist: 98, hip: 118, length: 108 },
  ];

  const hatsData = [
    { size: 'S', circumference: 54 },
    { size: 'M', circumference: 56 },
    { size: 'L', circumference: 58 },
    { size: 'Free', circumference: '54-60' },
  ];

  const fmt = (v: number | string) => (locale === 'fa' ? toPersianNumber(v) : String(v));

  const headerCls = 'px-4 py-3 text-start text-xs font-bold text-gold uppercase tracking-wider';
  const cellCls = 'px-4 py-3 text-sm';

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[550px] md:max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl z-50 shadow-2xl overflow-y-auto animate-fade-in border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold">
            {locale === 'fa' ? 'راهنمای سایز' : 'Size Guide'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 p-4 pb-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-gold/10 text-gold border border-gold/30'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">
            {locale === 'fa' ? 'اندازه‌ها بر حسب سانتی‌متر' : 'Measurements in centimeters'}
          </p>

          {tab === 'tshirt' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className={headerCls}>{locale === 'fa' ? 'سایز' : 'Size'}</th>
                  <th className={headerCls}>{locale === 'fa' ? 'سینه' : 'Chest'}</th>
                  <th className={headerCls}>{locale === 'fa' ? 'کمر' : 'Waist'}</th>
                  <th className={headerCls}>{locale === 'fa' ? 'قد' : 'Length'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {tshirtData.map((r) => (
                  <tr key={r.size} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className={`${cellCls} font-bold`}>{r.size}</td>
                    <td className={cellCls}>{fmt(r.chest)}</td>
                    <td className={cellCls}>{fmt(r.waist)}</td>
                    <td className={cellCls}>{fmt(r.length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'pants' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className={headerCls}>{locale === 'fa' ? 'سایز' : 'Size'}</th>
                  <th className={headerCls}>{locale === 'fa' ? 'کمر' : 'Waist'}</th>
                  <th className={headerCls}>{locale === 'fa' ? 'باسن' : 'Hip'}</th>
                  <th className={headerCls}>{locale === 'fa' ? 'قد' : 'Length'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {pantsData.map((r) => (
                  <tr key={r.size} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className={`${cellCls} font-bold`}>{r.size}</td>
                    <td className={cellCls}>{fmt(r.waist)}</td>
                    <td className={cellCls}>{fmt(r.hip)}</td>
                    <td className={cellCls}>{fmt(r.length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'hats' && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className={headerCls}>{locale === 'fa' ? 'سایز' : 'Size'}</th>
                  <th className={headerCls}>{locale === 'fa' ? 'دور سر' : 'Circumference'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {hatsData.map((r) => (
                  <tr key={r.size} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className={`${cellCls} font-bold`}>{r.size}</td>
                    <td className={cellCls}>{fmt(r.circumference)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
