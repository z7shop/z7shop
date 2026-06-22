'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import type { Category } from '@/types';

export default function NewProductPage() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name_fa: '', name_en: '', description_fa: '', description_en: '',
    price: '', discount_price: '', category_id: '', stock: '',
    sizes: 'S,M,L,XL', colors: '#000000,#FFFFFF',
    is_featured: false, is_new: true,
  });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseInt(form.price),
        discount_price: form.discount_price ? parseInt(form.discount_price) : null,
        stock: parseInt(form.stock) || 0,
        sizes: form.sizes.split(',').map(s => s.trim()),
        colors: form.colors.split(',').map(s => s.trim()),
        images: [],
      }),
    });

    if (res.ok) {
      toast.success(locale === 'fa' ? 'محصول اضافه شد' : 'Product added');
      router.push('/admin/products');
    } else {
      toast.error(dict.common.error);
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{dict.adminPanel.addProduct}</h1>
      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'نام فارسی' : 'Persian Name'}</label>
            <input className="input-field" value={form.name_fa} onChange={e => setForm({ ...form, name_fa: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'نام انگلیسی' : 'English Name'}</label>
            <input className="input-field" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} dir="ltr" required />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'توضیحات فارسی' : 'Persian Description'}</label>
          <textarea className="input-field" rows={3} value={form.description_fa} onChange={e => setForm({ ...form, description_fa: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'توضیحات انگلیسی' : 'English Description'}</label>
          <textarea className="input-field" rows={3} value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} dir="ltr" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{dict.product.price} ({dict.common.currency})</label>
            <input type="number" className="input-field" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} dir="ltr" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'قیمت تخفیفی' : 'Discount Price'}</label>
            <input type="number" className="input-field" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'موجودی' : 'Stock'}</label>
            <input type="number" className="input-field" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} dir="ltr" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'دسته‌بندی' : 'Category'}</label>
          <select className="input-field" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
            <option value="">{locale === 'fa' ? 'انتخاب کنید' : 'Select'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{locale === 'fa' ? c.name_fa : c.name_en}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'سایزها (جداشده با کاما)' : 'Sizes (comma-separated)'}</label>
            <input className="input-field" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{locale === 'fa' ? 'رنگ‌ها (hex, جداشده با کاما)' : 'Colors (hex, comma-separated)'}</label>
            <input className="input-field" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} dir="ltr" />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} className="accent-gold" />
            {locale === 'fa' ? 'محصول ویژه' : 'Featured'}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_new} onChange={e => setForm({ ...form, is_new: e.target.checked })} className="accent-gold" />
            {locale === 'fa' ? 'محصول جدید' : 'New'}
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-gold py-3 px-8 disabled:opacity-50">
            {loading ? dict.common.loading : dict.common.save}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline py-3 px-8">
            {dict.common.cancel}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
