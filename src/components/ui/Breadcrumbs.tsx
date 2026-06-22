'use client';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  const { dir } = useLocale();
  const Arrow = dir === 'rtl' ? HiChevronLeft : HiChevronRight;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <Arrow className="w-3.5 h-3.5 text-gold/50 flex-shrink-0" />}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="hover:text-gold transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-gray-300 font-medium' : ''}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
