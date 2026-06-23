'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/i18n';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

interface Product {
  id: string;
  name_fa: string;
  name_en: string;
  price: number;
  discount_price: number | null;
  images: string;
}

interface Bundle {
  id: string;
  name_fa: string;
  name_en: string;
  description_fa: string;
  description_en: string;
  discount_percent: number;
  image: string;
  is_active: number;
  created_at: string;
  products: Product[];
}

const emptyForm = {
  name_fa: '', name_en: '', description_fa: '', description_en: '',
  discount_percent: 15, image: '', is_active: true, product_ids: [] as string[],
};

export default function AdminBundlesPage() {
  const { locale, dict } = useLocale();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchBundles = () => {
    fetch('/api/admin/bundles').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setBundles(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchBundles();
    fetch('/api/products?limit=100').then(r => r.json()).then(data => {
      if (data.products) setProducts(data.products);
    });
  }, []);

  const handleSave = async () => {
    if (!form.name_fa || !form.name_en) {
      toast.error(locale === 'fa' ? 'نام فارسی و انگلیسی الزامی است' : 'Persian and English names are required');
      return;
    }
    if (form.product_ids.length < 2) {
      toast.error(locale === 'fa' ? 'حداقل ۲ محصول انتخاب کنید' : 'Select at least 2 products');
      return;
    }

    const url = '/api/admin/bundles';
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
      fetchBundles();
    } else {
      toast.error(locale === 'fa' ? 'خطا' : 'Error');
    }
  };

  const handleEdit = (b: Bundle) => {
    setForm({
      name_fa: b.name_fa,
      name_en: b.name_en,
      description_fa: b.description_fa,
      description_en: b.description_en,
      discount_percent: b.discount_percent,
      image: b.image,
      is_active: b.is_active === 1,
      product_ids: b.products.map(p => p.id),
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'fa' ? 'آیا از حذف این پکیج مطمئنید؟' : 'Are you sure you want to delete this bundle?')) return;
    const res = await fetch('/api/admin/bundles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setBundles(bundles.filter(b => b.id !== id));
      toast.success(locale === 'fa' ? 'حذف شد' : 'Deleted');
    }
  };

  const toggleProduct = (pid: string) => {
    setForm(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(pid)
        ? prev.product_ids.filter(id => id !== pid)
        : [...prev.product_ids, pid],
    }));
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{locale === 'fa' ? 'مدیریت پکیج‌ها' : 'Bundle Management'}</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-gold text-sm py-2 px-4"
        >
          <HiOutlinePlus className="w-4 h-4" />
          {locale === 'fa' ? 'پکیج جدید' : 'New Bundle'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-5 mb-6 animate-fade-in border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">{editId ? (locale === 'fa' ? 'ویرایش پکیج' : 'Edit Bundle') : (locale === 'fa' ? 'پکیج جدید' : 'New Bundle')}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-500 hover:text-white">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'نام فارسی' : 'Persian Name'}</label>
              <input className="input-field text-sm" value={form.name_fa} onChange={e => setForm({ ...form, name_fa: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'نام انگلیسی' : 'English Name'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'درصد تخفیف' : 'Discount %'}</label>
              <input className="input-field text-sm" type="number" min={1} max={90} value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: +e.target.value })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'توضیحات فارسی' : 'Persian Description'}</label>
              <input className="input-field text-sm" value={form.description_fa} onChange={e => setForm({ ...form, description_fa: e.target.value })} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'توضیحات انگلیسی' : 'English Description'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'لینک تصویر' : 'Image URL'}</label>
              <input className="input-field text-sm" dir="ltr" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer py-3">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-gold w-4 h-4" />
                <span className="text-sm">{locale === 'fa' ? 'فعال' : 'Active'}</span>
              </label>
            </div>
          </div>

          {/* Product Selector */}
          <div className="mt-4">
            <label className="text-xs text-gray-500 mb-2 block">
              {locale === 'fa' ? 'انتخاب محصولات' : 'Select Products'} ({form.product_ids.length} {locale === 'fa' ? 'انتخاب شده' : 'selected'})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-700/30 rounded-xl">
              {products.map(p => {
                const selected = form.product_ids.includes(p.id);
                const imgs: string[] = (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })();
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-start text-xs transition-all ${selected ? 'bg-gold/20 border border-gold/50' : 'bg-gray-800/30 border border-gray-700/30 hover:border-gold/30'}`}
                  >
                    {imgs[0] && <Image src={imgs[0]} alt="" width={32} height={32} className="w-8 h-8 rounded object-cover flex-shrink-0" />}
                    <span className="truncate">{locale === 'fa' ? p.name_fa : p.name_en}</span>
                    {selected && <HiOutlineCheck className="w-3 h-3 text-gold flex-shrink-0 ms-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleSave} className="btn-gold mt-4 text-sm py-2.5 px-6">
            <HiOutlineCheck className="w-4 h-4" />
            {dict.common.save}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'نام' : 'Name'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'محصولات' : 'Products'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'تخفیف' : 'Discount'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'قیمت پکیج' : 'Bundle Price'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{dict.common.loading}</td></tr>
              ) : bundles.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">{locale === 'fa' ? 'پکیجی وجود ندارد' : 'No bundles'}</td></tr>
              ) : bundles.map(b => {
                const total = b.products.reduce((s, p) => s + (p.discount_price || p.price), 0);
                const discounted = Math.round(total * (1 - b.discount_percent / 100));
                return (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-gold">{locale === 'fa' ? b.name_fa : b.name_en}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{locale === 'fa' ? b.description_fa : b.description_en}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2 rtl:space-x-reverse">
                        {b.products.slice(0, 3).map(p => {
                          const imgs: string[] = (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })();
                          return <Image key={p.id} src={imgs[0] || '/images/placeholder.svg'} alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" />;
                        })}
                        {b.products.length > 3 && (
                          <span className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs">+{b.products.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-400">{b.discount_percent}%</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gold">{formatPrice(discounted, locale)}</span>
                      <span className="text-xs text-gray-500 line-through ms-2">{formatPrice(total, locale)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {b.is_active ? (
                        <span className="badge bg-green-500/10 text-green-500">{locale === 'fa' ? 'فعال' : 'Active'}</span>
                      ) : (
                        <span className="badge bg-gray-500/10 text-gray-500">{locale === 'fa' ? 'غیرفعال' : 'Inactive'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(b)} className="p-1.5 rounded-lg hover:bg-gold/10 text-gray-600 dark:text-gray-400 hover:text-gold transition-colors">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
