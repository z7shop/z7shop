'use client';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineClipboardCheck, HiOutlineCog, HiOutlineTruck, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface Props {
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

const STEPS = [
  { key: 'pending', icon: HiOutlineClipboardCheck, fa: 'ثبت سفارش', en: 'Order Placed' },
  { key: 'processing', icon: HiOutlineCog, fa: 'در حال پردازش', en: 'Processing' },
  { key: 'shipped', icon: HiOutlineTruck, fa: 'ارسال شده', en: 'Shipped' },
  { key: 'delivered', icon: HiOutlineCheck, fa: 'تحویل داده شده', en: 'Delivered' },
];

const STATUS_INDEX: Record<string, number> = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

export default function OrderTimeline({ status, createdAt, updatedAt }: Props) {
  const { locale } = useLocale();
  const isCancelled = status === 'cancelled';
  const activeIdx = isCancelled ? -1 : (STATUS_INDEX[status] ?? 0);

  return (
    <div className="py-2 animate-fade-in">
      {STEPS.map((step, i) => {
        const done = !isCancelled && i <= activeIdx;
        const current = !isCancelled && i === activeIdx;
        const isLast = i === STEPS.length - 1;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex gap-3">
            {/* Line + Circle */}
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-500 ${
                done ? 'border-gold bg-gold/20 text-gold' : 'border-gray-700 bg-gray-800/50 text-gray-600'
              } ${current ? 'ring-4 ring-gold/20 scale-110' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className={`w-0.5 h-10 my-1 transition-all duration-500 ${
                  done && i < activeIdx ? 'bg-gold' : 'bg-gray-700 border-dashed'
                }`} style={done && i < activeIdx ? {} : { backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 3px, #374151 3px, #374151 6px)' , backgroundColor: 'transparent' }} />
              )}
            </div>

            {/* Label */}
            <div className={`pt-1.5 ${!isLast ? 'pb-4' : ''}`}>
              <p className={`text-sm font-medium ${done ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                {locale === 'fa' ? step.fa : step.en}
              </p>
              {i === 0 && createdAt && (
                <p className="text-[11px] text-gray-600 mt-0.5">{new Date(createdAt).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              )}
              {current && updatedAt && i > 0 && (
                <p className="text-[11px] text-gold/70 mt-0.5">{new Date(updatedAt).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex gap-3 mt-2">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-red-500 bg-red-500/20 text-red-400">
              <HiOutlineX className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1.5">
            <p className="text-sm font-medium text-red-400">{locale === 'fa' ? 'لغو شده' : 'Cancelled'}</p>
            {updatedAt && (
              <p className="text-[11px] text-red-500/60 mt-0.5">{new Date(updatedAt).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
