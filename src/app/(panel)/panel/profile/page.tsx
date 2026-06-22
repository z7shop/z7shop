'use client';
import { useEffect, useState } from 'react';
import PanelLayout from '@/components/layout/PanelLayout';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { locale, dict } = useLocale();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(data => {
      setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '', password: '' });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body: any = { name: form.name, phone: form.phone };
    if (form.password) body.password = form.password;

    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(locale === 'fa' ? 'پروفایل به‌روزرسانی شد' : 'Profile updated');
    }
    setLoading(false);
  };

  return (
    <PanelLayout>
      <div className="card p-6 max-w-lg">
        <h2 className="text-lg font-bold mb-6">{dict.panel.profile}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{dict.auth.name}</label>
            <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{dict.auth.email}</label>
            <input className="input-field bg-gray-50 dark:bg-gray-700" value={form.email} disabled dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{dict.auth.phone}</label>
            <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'رمز عبور جدید (اختیاری)' : 'New Password (optional)'}</label>
            <input type="password" className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} dir="ltr" />
          </div>
          <button type="submit" disabled={loading} className="btn-gold py-3 px-8 disabled:opacity-50">
            {loading ? dict.common.loading : dict.common.save}
          </button>
        </form>
      </div>
    </PanelLayout>
  );
}
