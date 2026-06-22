'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PanelLayout from '@/components/layout/PanelLayout';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiOutlinePlus, HiOutlineLocationMarker, HiOutlineMap } from 'react-icons/hi';

const AddressMap = dynamic(() => import('@/components/ui/AddressMap'), { ssr: false });

interface Address {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  is_default: number;
}

export default function AddressesPage() {
  const { locale, dict } = useLocale();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [form, setForm] = useState({ title: '', full_name: '', phone: '', province: '', city: '', address: '', postal_code: '', is_default: false, lat: null as number | null, lng: null as number | null });

  useEffect(() => {
    fetch('/api/addresses').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setAddresses(data);
    });
  }, []);

  const saveAddress = async () => {
    const res = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setAddresses([...addresses, { ...form, id: data.id, is_default: form.is_default ? 1 : 0 }]);
      setShowForm(false);
      setShowMap(false);
      setForm({ title: '', full_name: '', phone: '', province: '', city: '', address: '', postal_code: '', is_default: false, lat: null, lng: null });
      toast.success(locale === 'fa' ? 'آدرس اضافه شد' : 'Address added');
    }
  };

  const deleteAddress = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success(locale === 'fa' ? 'آدرس حذف شد' : 'Address deleted');
    }
  };

  return (
    <PanelLayout>
      <div className="space-y-4">
        <button onClick={() => setShowForm(!showForm)} className="btn-outline">
          <HiOutlinePlus className="w-4 h-4" />
          {dict.checkout.addNewAddress}
        </button>

        {showForm && (
          <div className="card p-4 space-y-4">
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all border ${showMap ? 'border-gold/50 bg-gold/10 text-gold' : 'border-gray-700 text-gray-400 hover:border-gold/30 hover:text-gold'}`}
            >
              <HiOutlineMap className="w-4 h-4" />
              {locale === 'fa' ? 'انتخاب از روی نقشه' : 'Select from Map'}
            </button>

            {showMap && (
              <AddressMap onLocationSelect={(data) => {
                setForm(prev => ({
                  ...prev,
                  address: data.address,
                  city: data.city,
                  province: data.province,
                  lat: data.lat,
                  lng: data.lng,
                }));
              }} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className="input-field" placeholder={locale === 'fa' ? 'عنوان' : 'Title'} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <input className="input-field" placeholder={dict.auth.name} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            <input className="input-field" placeholder={dict.auth.phone} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" />
            <input className="input-field" placeholder={locale === 'fa' ? 'استان' : 'Province'} value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} />
            <input className="input-field" placeholder={locale === 'fa' ? 'شهر' : 'City'} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <input className="input-field" placeholder={locale === 'fa' ? 'کد پستی' : 'Postal Code'} value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} dir="ltr" />
            <textarea className="input-field sm:col-span-2" rows={2} placeholder={locale === 'fa' ? 'آدرس کامل' : 'Full Address'} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} className="accent-gold" />
              {locale === 'fa' ? 'آدرس پیش‌فرض' : 'Default address'}
            </label>
            <button onClick={saveAddress} className="btn-gold sm:col-span-2">{dict.common.save}</button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !showForm && (
          <div className="text-center py-16">
            <HiOutlineLocationMarker className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{locale === 'fa' ? 'هنوز آدرسی ثبت نشده' : 'No addresses yet'}</p>
          </div>
        )}

        {addresses.map(addr => (
          <div key={addr.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{addr.title}</h3>
              <div className="flex items-center gap-2">
                {addr.is_default === 1 && <span className="text-xs text-gold">{locale === 'fa' ? 'پیش‌فرض' : 'Default'}</span>}
                <button onClick={() => deleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500">{addr.full_name} - {addr.phone}</p>
            <p className="text-sm text-gray-500">{addr.province}، {addr.city}، {addr.address}</p>
            <p className="text-sm text-gray-500">{locale === 'fa' ? 'کد پستی' : 'Postal'}: {addr.postal_code}</p>
          </div>
        ))}
      </div>
    </PanelLayout>
  );
}
