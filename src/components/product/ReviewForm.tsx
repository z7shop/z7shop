'use client';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

interface Props {
  productId: string;
  onSubmit: () => void;
}

export default function ReviewForm({ productId, onSubmit }: Props) {
  const { locale } = useLocale();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(locale === 'fa' ? 'لطفاً امتیاز دهید' : 'Please select a rating');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, title, comment }),
      });
      if (res.ok) {
        toast.success(locale === 'fa' ? 'نظر شما ثبت شد' : 'Review submitted');
        setRating(0);
        setTitle('');
        setComment('');
        onSubmit();
      } else {
        const data = await res.json();
        toast.error(data.error || (locale === 'fa' ? 'خطایی رخ داد' : 'An error occurred'));
      }
    } catch {
      toast.error(locale === 'fa' ? 'خطایی رخ داد' : 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-gray-800/30 border border-gray-700/30 space-y-4">
      <h3 className="font-bold text-sm">
        {locale === 'fa' ? 'ثبت نظر شما' : 'Write a Review'}
      </h3>

      <div>
        <label className="text-xs text-gray-500 mb-2 block">
          {locale === 'fa' ? 'امتیاز شما' : 'Your Rating'}
        </label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          {locale === 'fa' ? 'عنوان (اختیاری)' : 'Title (optional)'}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field text-sm"
          placeholder={locale === 'fa' ? 'خلاصه نظر شما' : 'Summary of your review'}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          {locale === 'fa' ? 'نظر شما' : 'Your Review'}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input-field text-sm"
          rows={3}
          placeholder={locale === 'fa' ? 'تجربه خود از این محصول را بنویسید...' : 'Share your experience with this product...'}
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="btn-gold py-2.5 px-6 text-sm disabled:opacity-50"
      >
        {loading
          ? (locale === 'fa' ? 'در حال ارسال...' : 'Submitting...')
          : (locale === 'fa' ? 'ثبت نظر' : 'Submit Review')}
      </button>
    </form>
  );
}
