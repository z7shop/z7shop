'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatDate } from '@/i18n';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_discount: number;
  min_order: number;
  is_active: number;
  expires_at: string;
}

const emptyForm = { code: '', discount_percent: 10, max_discount: 100000, min_order: 0, is_active: true, expires_at: '' };

export default function AdminCouponsPage() {
  const { locale, dict } = useLocale();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCoupons = () => {
    fetch('/api/admin/coupons').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCoupons(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.expires_at) {
      toast.error(locale === 'fa' ? 'کد و تاریخ انقضا الزامی است' : 'Code and expiry are required');
      return;
    }

    const url = '/api/admin/coupons';
    const method = editId ? 'PUT' : 'POST';
    const body = editId ? { ...form, id: editId, is_active: form.is_active ? 1 : 0 } : { ...form, is_active: form.is_active ? 1 : 0 };

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
      fetchCoupons();
    } else {
      toast.error(locale === 'fa' ? 'خطا' : 'Error');
    }
  };

  const handleEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      discount_percent: c.discount_percent,
      max_discount: c.max_discount,
      min_order: c.min_order,
      is_active: c.is_active === 1,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/admin/coupons', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success(locale === 'fa' ? 'حذف شد' : 'Deleted');
    }
  };

  const isExpired = (d: string) => new Date(d) < new Date();

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{locale === 'fa' ? 'مدیریت کد تخفیف' : 'Coupon Management'}</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-gold text-sm py-2 px-4"
        >
          <HiOutlinePlus className="w-4 h-4" />
          {locale === 'fa' ? 'کوپن جدید' : 'New Coupon'}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="card p-5 mb-6 animate-fade-in border-gold/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">{editId ? (locale === 'fa' ? 'ویرایش کوپن' : 'Edit Coupon') : (locale === 'fa' ? 'کوپن جدید' : 'New Coupon')}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="text-gray-500 hover:text-white">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'کد تخفیف' : 'Code'}</label>
              <input className="input-field text-sm font-mono" dir="ltr" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'درصد تخفیف' : 'Discount %'}</label>
              <input className="input-field text-sm" type="number" min={1} max={100} value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'حداکثر تخفیف (تومان)' : 'Max Discount'}</label>
              <input className="input-field text-sm" type="number" dir="ltr" value={form.max_discount} onChange={e => setForm({ ...form, max_discount: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'حداقل سفارش (تومان)' : 'Min Order'}</label>
              <input className="input-field text-sm" type="number" dir="ltr" value={form.min_order} onChange={e => setForm({ ...form, min_order: +e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">{locale === 'fa' ? 'تاریخ انقضا' : 'Expires'}</label>
              <input className="input-field text-sm" type="date" dir="ltr" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer py-3">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="accent-gold w-4 h-4" />
                <span className="text-sm">{locale === 'fa' ? 'فعال' : 'Active'}</span>
              </label>
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
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'کد' : 'Code'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'تخفیف' : 'Discount'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'حداکثر' : 'Max'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'حداقل سفارش' : 'Min Order'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'انقضا' : 'Expires'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{dict.common.loading}</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">{locale === 'fa' ? 'کوپنی وجود ندارد' : 'No coupons'}</td></tr>
              ) : coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-gold">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_percent}%</td>
                  <td className="px-4 py-3">{formatPrice(c.max_discount, locale)} {dict.common.currency}</td>
                  <td className="px-4 py-3">{c.min_order > 0 ? `${formatPrice(c.min_order, locale)} ${dict.common.currency}` : '-'}</td>
                  <td className="px-4 py-3">
                    {c.is_active && !isExpired(c.expires_at) ? (
                      <span className="badge bg-green-500/10 text-green-500">{locale === 'fa' ? 'فعال' : 'Active'}</span>
                    ) : isExpired(c.expires_at) ? (
                      <span className="badge bg-red-500/10 text-red-500">{locale === 'fa' ? 'منقضی' : 'Expired'}</span>
                    ) : (
                      <span className="badge bg-gray-500/10 text-gray-500">{locale === 'fa' ? 'غیرفعال' : 'Inactive'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.expires_at, locale)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-gold/10 text-gray-600 dark:text-gray-400 hover:text-gold transition-colors">
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
