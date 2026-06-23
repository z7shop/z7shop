'use client';
import { useLocale } from '@/hooks/useLocale';
import StarRating from './StarRating';

interface Props {
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

export default function ReviewCard({ userName, rating, title, comment, date }: Props) {
  const { locale } = useLocale();

  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const relativeDate = () => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (locale === 'fa') {
      if (mins < 60) return 'لحظاتی پیش';
      if (hrs < 24) return `${hrs} ساعت پیش`;
      if (days < 7) return `${days} روز پیش`;
      if (days < 30) return `${Math.floor(days / 7)} هفته پیش`;
      return `${Math.floor(days / 30)} ماه پیش`;
    }
    if (mins < 60) return 'Just now';
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm">{userName}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">{relativeDate()}</span>
          </div>
          <StarRating rating={rating} size="sm" />
          {title && <p className="font-medium text-sm mt-2">{title}</p>}
          {comment && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-6">{comment}</p>}
        </div>
      </div>
    </div>
  );
}
