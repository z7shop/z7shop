'use client';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { FaTelegram, FaWhatsapp, FaTwitter } from 'react-icons/fa';
import { HiOutlineLink } from 'react-icons/hi';

interface Props {
  url: string;
  title: string;
}

export default function SocialShare({ url, title }: Props) {
  const { locale } = useLocale();

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success(locale === 'fa' ? 'لینک کپی شد' : 'Link copied');
    } catch {
      toast.error(locale === 'fa' ? 'خطا در کپی' : 'Copy failed');
    }
  };

  const channels = [
    {
      icon: FaTelegram,
      label: locale === 'fa' ? 'تلگرام' : 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
      color: 'hover:text-[#0088cc]',
    },
    {
      icon: FaWhatsapp,
      label: locale === 'fa' ? 'واتساپ' : 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`,
      color: 'hover:text-[#25D366]',
    },
    {
      icon: FaTwitter,
      label: locale === 'fa' ? 'توییتر' : 'Twitter',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
      color: 'hover:text-[#1DA1F2]',
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 me-1">
        {locale === 'fa' ? 'اشتراک:' : 'Share:'}
      </span>
      {channels.map((ch, i) => (
        <a
          key={i}
          href={ch.href}
          target="_blank"
          rel="noopener noreferrer"
          title={ch.label}
          className={`w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/40 border border-gray-700/30 text-gray-400 transition-all duration-200 hover:scale-110 ${ch.color}`}
        >
          <ch.icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={copyLink}
        title={locale === 'fa' ? 'کپی لینک' : 'Copy Link'}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/40 border border-gray-700/30 text-gray-400 transition-all duration-200 hover:scale-110 hover:text-gold"
      >
        <HiOutlineLink className="w-4 h-4" />
      </button>
    </div>
  );
}
