'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

interface Banner {
  id: string;
  badge_fa: string;
  badge_en: string;
  title_fa: string;
  title_en: string;
  subtitle_fa: string;
  subtitle_en: string;
  cta_fa: string;
  cta_en: string;
  cta_link: string;
  gradient: string;
  accent_color: string;
  image: string;
  sort_order: number;
  is_active: number;
}

const emptyForm = {
  badge_fa: '', badge_en: '', title_fa: '', title_en: '',
  subtitle_fa: '', subtitle_en: '', cta_fa: '', cta_en: '',
  cta_link: '/products', gradient: '', accent_color: 'gold',
  image: '', sort_order: 0, is_active: true,
};

export default function AdminBannersPage() {
  const { locale, dict } = useLocale();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchBanners = () => {
    fetch('/api/admin/banners').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setBanners(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = async () => {
    if (!form.title_fa || !form.title_en) {
      toast.error(locale === 'fa' ? 'عنوان فارسی و انگلیسی الزامی است' : 'Persian and English titles are required');
      return;
    }

    const url = '/api/admin/banners';
    const method = editId ? 'PUT' : 'POST';
    const body = editId
      ? { ...form, id: editId, is_active: form.is_active ? 1 : 0 }
      : { ...form, is_active: form.is_active ? 1 : 0 };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(locale === 'fa' ? 'ذخیره شد' : 'Saved');
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchBanners();
    } else {
      toast.error(locale === 'fa' ? 'خطا' : 'Error');
    }
  };

  const handleEdit = (b: Banner) => {
    setForm({
      badge_fa: b.badge_fa, badge_en: b.badge_en,
      title_fa: b.title_fa, title_en: b.title_en,
      subtitle_fa: b.subtitle_fa, subtitle_en: b.subtitle_en,
      cta_fa: b.cta_fa, cta_en: b.cta_en,
      cta_link: b.cta_link, gradient: b.gradient,
      accent_color: b.accent_color, image: b.image,
      sort_order: b.sort_order, is_active: b.is_active === 1,
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'fa' ? 'آیا از حذف این بنر مطمئنید؟' : 'Are you sure you want to delete this banner?')) return;
    const res = await fetch('/api/admin/banners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setBanners(banners.filter(b => b.id !== id));
      toast.success(locale === 'fa' ? 'حذف شد' : 'Deleted');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{locale === 'fa' ? 'مدیریت بنرها' : 'Banner Management'}</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-gold text-sm py-2 px-4"
        >
          <HiOutlinePlus className="w-4 h-4" />
          {locale === 'fa' ? 'بنر جدید' : 'New Banner'}
        </button>
      </div>

      {showForm && (
        <div className="card p-5 mb-6 animate-fade-in border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">
              {editId
                ? (locale === 'fa' ? 'ویرایش بنر' : 'Edit Banner')
                : (locale === 'fa' ? 'بنر جدید' : 'New Banner')}
            </h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-500 hover:text-white">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'نشان (فارسی)' : 'Badge (FA)'}</label>
              <input className="input-field text-sm" value={form.badge_fa} onChange={e => setForm({ ...form, badge_fa: e.target.value })} placeholder="مجموعه جدید" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'نشان (انگلیسی)' : 'Badge (EN)'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.badge_en} onChange={e => setForm({ ...form, badge_en: e.target.value })} placeholder="New Collection" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'عنوان (فارسی) — از **کلمه** برای متن طلایی' : 'Title (FA) — use **word** for gold text'}</label>
              <input className="input-field text-sm" value={form.title_fa} onChange={e => setForm({ ...form, title_fa: e.target.value })} placeholder="استایل **مردانه** با کیفیت" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'عنوان (انگلیسی)' : 'Title (EN) — use **word** for gold text'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} placeholder="Men's **Style**" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'زیرعنوان (فارسی)' : 'Subtitle (FA)'}</label>
              <input className="input-field text-sm" value={form.subtitle_fa} onChange={e => setForm({ ...form, subtitle_fa: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'زیرعنوان (انگلیسی)' : 'Subtitle (EN)'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.subtitle_en} onChange={e => setForm({ ...form, subtitle_en: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'متن دکمه (فارسی)' : 'CTA Text (FA)'}</label>
              <input className="input-field text-sm" value={form.cta_fa} onChange={e => setForm({ ...form, cta_fa: e.target.value })} placeholder="مشاهده محصولات" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'متن دکمه (انگلیسی)' : 'CTA Text (EN)'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.cta_en} onChange={e => setForm({ ...form, cta_en: e.target.value })} placeholder="View Products" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'لینک دکمه' : 'CTA Link'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.cta_link} onChange={e => setForm({ ...form, cta_link: e.target.value })} placeholder="/products" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'رنگ تأکیدی' : 'Accent Color'}</label>
              <select className="input-field text-sm" value={form.accent_color} onChange={e => setForm({ ...form, accent_color: e.target.value })}>
                <option value="gold">{locale === 'fa' ? 'طلایی' : 'Gold'}</option>
                <option value="red">{locale === 'fa' ? 'قرمز' : 'Red'}</option>
                <option value="blue">{locale === 'fa' ? 'آبی' : 'Blue'}</option>
                <option value="green">{locale === 'fa' ? 'سبز' : 'Green'}</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'ترتیب نمایش' : 'Sort Order'}</label>
              <input className="input-field text-sm" type="number" min={0} value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer py-3">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-gold w-4 h-4" />
                <span className="text-sm">{locale === 'fa' ? 'فعال' : 'Active'}</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'گرادیان پس‌زمینه (CSS)' : 'Background Gradient (CSS)'}</label>
            <input className="input-field text-sm font-mono" dir="ltr" value={form.gradient} onChange={e => setForm({ ...form, gradient: e.target.value })}
              placeholder="radial-gradient(ellipse 70% 50% at 70% 20%, rgba(201, 168, 76, 0.12), transparent)" />
          </div>

          <button onClick={handleSave} className="btn-gold mt-4 text-sm py-2.5 px-6">
            <HiOutlineCheck className="w-4 h-4" />
            {dict.common.save}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center text-gray-500">{dict.common.loading}</div>
        ) : banners.length === 0 ? (
          <div className="card p-8 text-center text-gray-500">{locale === 'fa' ? 'بنری وجود ندارد' : 'No banners found'}</div>
        ) : banners.map(b => (
          <div key={b.id} className="card p-4 flex items-center gap-4 group hover:border-gold/30 transition-colors">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: b.gradient || 'rgba(201, 168, 76, 0.1)' }}>
              {b.sort_order + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm truncate">{locale === 'fa' ? b.title_fa : b.title_en}</h3>
                {b.is_active ? (
                  <span className="badge bg-green-500/10 text-green-500 text-[10px]">{locale === 'fa' ? 'فعال' : 'Active'}</span>
                ) : (
                  <span className="badge bg-gray-500/10 text-gray-500 text-[10px]">{locale === 'fa' ? 'غیرفعال' : 'Inactive'}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {locale === 'fa' ? b.subtitle_fa : b.subtitle_en}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-gold">{b.cta_link}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{b.accent_color}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(b)} className="p-2 rounded-lg hover:bg-gold/10 text-gray-400 hover:text-gold transition-colors">
                <HiOutlinePencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(b.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors">
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
