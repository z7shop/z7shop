import fa from './fa';
import en from './en';
import type { Locale } from '@/types';

const dictionaries = { fa, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function toEnglishNumber(str: string): string {
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  return str.replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d)));
}

export function formatPrice(price: number, locale: Locale): string {
  if (locale === 'fa') {
    const formatted = price.toLocaleString('fa-IR');
    return formatted;
  }
  return price.toLocaleString('en-US');
}

export function formatNumber(num: number, locale: Locale): string {
  if (locale === 'fa') {
    return num.toLocaleString('fa-IR');
  }
  return num.toLocaleString('en-US');
}

export function formatPercent(num: number, locale: Locale): string {
  if (locale === 'fa') {
    return toPersianNumber(num) + '٪';
  }
  return num + '%';
}

export function formatDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr);
  if (locale === 'fa') {
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatQuantity(num: number, locale: Locale, unit: string): string {
  if (locale === 'fa') {
    return `${toPersianNumber(num)} ${unit}`;
  }
  return `${num} ${unit}`;
}
