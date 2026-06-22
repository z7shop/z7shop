'use client';
import { useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { HiOutlineBell } from 'react-icons/hi';

export default function StockAlertForm({ productId, userEmail }: { productId: string; userEmail?: string }) {
  const { dict } = useLocale();
  const [email, setEmail] = useState(userEmail || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, email }),
      });
      if (res.ok) {
        setStatus('success');
      } else if (res.status === 409) {
        setStatus('already');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
        <HiOutlineBell className="w-5 h-5 flex-shrink-0" />
        <span>{(dict as any).stockAlert.subscribed}</span>
      </div>
    );
  }

  if (status === 'already') {
    return (
      <div className="flex items-center gap-2 text-gold text-sm mt-3 p-3 rounded-xl bg-gold/10 border border-gold/20">
        <HiOutlineBell className="w-5 h-5 flex-shrink-0" />
        <span>{(dict as any).stockAlert.alreadySubscribed}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-xl bg-gray-800/40 border border-gray-700/40">
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineBell className="w-5 h-5 text-gold" />
        <span className="text-sm font-medium">{(dict as any).stockAlert.notifyWhenAvailable}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={(dict as any).stockAlert.enterEmail}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:border-gold focus:outline-none transition-colors"
          dir="ltr"
        />
        <button
          onClick={handleSubmit}
          disabled={!email || status === 'loading'}
          className="btn-gold px-4 py-2.5 text-sm whitespace-nowrap disabled:opacity-50"
        >
          {status === 'loading' ? '...' : (dict as any).stockAlert.subscribe}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs mt-2">{(dict as any).common?.error || 'Error'}</p>
      )}
    </div>
  );
}
