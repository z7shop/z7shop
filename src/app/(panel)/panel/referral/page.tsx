'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import PanelLayout from '@/components/layout/PanelLayout';
import { useLocale } from '@/hooks/useLocale';
import { toPersianNumber } from '@/i18n';
import toast from 'react-hot-toast';
import { HiOutlineUserAdd, HiOutlineClipboardCopy, HiOutlineGift, HiOutlineStar, HiOutlineUsers } from 'react-icons/hi';
import { FaTelegram, FaWhatsapp } from 'react-icons/fa';

export default function ReferralPage() {
  const { data: session } = useSession();
  const { locale } = useLocale();
  const fa = locale === 'fa';

  const [code, setCode] = useState('');
  const [referredCount, setReferredCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch('/api/referral')
      .then(r => r.json())
      .then(data => {
        setCode(data.code || '');
        setReferredCount(data.referredCount || 0);
        setPointsEarned(data.pointsEarned || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const referralLink = `https://z7shop.ir/register?ref=${code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success(fa ? 'کد کپی شد!' : 'Code copied!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success(fa ? 'لینک کپی شد!' : 'Link copied!');
  };

  if (!session) return null;

  return (
    <PanelLayout>
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold">{fa ? 'دعوت دوستان' : 'Invite Friends'}</h2>

        {/* Referral Code */}
        <div className="card p-6 md:p-8 text-center bg-gradient-to-br from-gold/5 to-gold/10 border border-gold/20">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineUserAdd className="w-8 h-8 text-gold" />
          </div>
          <p className="text-sm text-gray-400 mb-3">{fa ? 'کد دعوت شما' : 'Your Referral Code'}</p>
          {loading ? (
            <div className="h-14 bg-gray-800/50 rounded-xl animate-pulse" />
          ) : (
            <button
              onClick={copyCode}
              className="group relative bg-[#1a1a1f] border-2 border-dashed border-gold/30 hover:border-gold rounded-xl px-8 py-4 mx-auto block transition-all"
            >
              <span className="text-3xl font-black text-gold tracking-[8px] font-mono">{code}</span>
              <HiOutlineClipboardCopy className="absolute top-2 end-2 w-4 h-4 text-gray-600 group-hover:text-gold transition-colors" />
            </button>
          )}

          {/* Share buttons */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm text-gray-300 transition-colors">
              <HiOutlineClipboardCopy className="w-4 h-4" />
              {fa ? 'کپی لینک' : 'Copy Link'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(fa ? `با کد دعوت من ${code} توی Z7shop ثبت‌نام کن و ۱۰ امتیاز هدیه بگیر! ${referralLink}` : `Sign up on Z7shop with my code ${code} and get 10 bonus points! ${referralLink}`)}`}
              target="_blank"
              rel="noopener"
              className="w-10 h-10 rounded-xl bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-colors"
            >
              <FaWhatsapp className="w-5 h-5 text-green-500" />
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(fa ? `با کد دعوت ${code} توی Z7shop ثبت‌نام کن!` : `Sign up on Z7shop with code ${code}!`)}`}
              target="_blank"
              rel="noopener"
              className="w-10 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
            >
              <FaTelegram className="w-5 h-5 text-blue-500" />
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <HiOutlineUsers className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-black">{fa ? toPersianNumber(referredCount) : referredCount}</p>
              <p className="text-xs text-gray-500">{fa ? 'دوست دعوت‌شده' : 'Friends Invited'}</p>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
              <HiOutlineStar className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-black text-gold">{fa ? toPersianNumber(pointsEarned) : pointsEarned}</p>
              <p className="text-xs text-gray-500">{fa ? 'امتیاز کسب‌شده' : 'Points Earned'}</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <HiOutlineGift className="w-5 h-5 text-gold" />
            {fa ? 'چطور کار می‌کنه؟' : 'How it works'}
          </h3>
          <div className="space-y-3">
            {[
              { step: '۱', step_en: '1', text: fa ? 'کد دعوت خود را با دوستانتان به اشتراک بگذارید.' : 'Share your referral code with friends.' },
              { step: '۲', step_en: '2', text: fa ? 'دوست شما با کد شما ثبت‌نام می‌کند.' : 'Your friend signs up with your code.' },
              { step: '۳', step_en: '3', text: fa ? 'شما ۲۰ امتیاز و دوستتان ۱۰ امتیاز دریافت می‌کنید!' : 'You get 20 points and your friend gets 10 points!' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {fa ? item.step : item.step_en}
                </span>
                <p className="text-sm text-gray-400 pt-1">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
}
