'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PanelLayout from '@/components/layout/PanelLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatDate, toPersianNumber } from '@/i18n';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiOutlineGift, HiOutlineShoppingCart } from 'react-icons/hi';

interface LoyaltyRecord {
  id: string;
  points: number;
  type: 'earn' | 'spend';
  description_fa: string;
  description_en: string;
  order_id: string | null;
  created_at: string;
}

export default function LoyaltyPage() {
  const { data: session } = useSession();
  const { locale, dict } = useLocale();
  const l = dict.loyalty as any;

  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<LoyaltyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  const fetchData = () => {
    fetch('/api/loyalty')
      .then(r => r.json())
      .then(data => {
        setTotalPoints(data.totalPoints || 0);
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const handleRedeem = async () => {
    if (totalPoints < 100) return;
    setRedeeming(true);
    const res = await fetch('/api/loyalty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: Math.floor(totalPoints / 100) * 100 }),
    });
    if (res.ok) {
      const data = await res.json();
      setTotalPoints(data.totalPoints);
      toast.success(
        locale === 'fa'
          ? `کد تخفیف ${data.couponCode} ساخته شد (${data.discountAmount.toLocaleString()} تومان)`
          : `Coupon ${data.couponCode} created (${data.discountAmount.toLocaleString()}T)`
      );
      fetchData();
    } else {
      toast.error(locale === 'fa' ? 'خطا در استفاده از امتیاز' : 'Error redeeming points');
    }
    setRedeeming(false);
  };

  if (!session) return null;

  return (
    <PanelLayout>
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold">{l.title}</h2>

        {/* Points Display */}
        <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gold/5 to-gold/10 border border-gold/20">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineStar className="w-8 h-8 text-gold" />
          </div>
          <p className="text-sm text-gray-500 mb-2">{l.totalPoints}</p>
          <p className="text-5xl font-black text-gold mb-4">
            {loading ? '...' : locale === 'fa' ? toPersianNumber(totalPoints) : totalPoints}
          </p>
          <p className="text-sm text-gray-400">{l.points}</p>
          {totalPoints >= 100 && (
            <button
              onClick={handleRedeem}
              disabled={redeeming}
              className="btn-gold mt-4 px-6 py-2.5"
            >
              <HiOutlineGift className="w-5 h-5" />
              {redeeming
                ? (locale === 'fa' ? 'در حال پردازش...' : 'Processing...')
                : l.redeem}
            </button>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <HiOutlineShoppingCart className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-sm">{l.earn}</p>
              <p className="text-xs text-gray-500 mt-0.5">{l.earnPerOrder}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <HiOutlineGift className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-sm">{l.redeem}</p>
              <p className="text-xs text-gray-500 mt-0.5">{l.redeemInfo}</p>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold">{l.earnHistory}</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">{(dict.common as any).loading}</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <HiOutlineStar className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p>{l.noPoints}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">
                      {locale === 'fa' ? 'تاریخ' : 'Date'}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">
                      {locale === 'fa' ? 'نوع' : 'Type'}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">
                      {locale === 'fa' ? 'توضیحات' : 'Description'}
                    </th>
                    <th className="px-4 py-3 text-start font-medium text-gray-500">
                      {l.points}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDate(item.created_at, locale)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.type === 'earn'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {item.type === 'earn' ? l.earn : l.spend}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {locale === 'fa' ? item.description_fa : item.description_en}
                      </td>
                      <td className={`px-4 py-3 font-bold ${
                        item.type === 'earn' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {item.type === 'earn' ? '+' : '-'}{locale === 'fa' ? toPersianNumber(item.points) : item.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PanelLayout>
  );
}
