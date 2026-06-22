'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice, formatNumber } from '@/i18n';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

export default function AdminProductsPage() {
  const { locale, dict } = useLocale();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?limit=100').then(r => r.json()).then(data => {
      setProducts(data.products);
      setLoading(false);
    });
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm(dict.adminPanel.confirmDelete)) return;

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(products.filter(p => p.id !== id));
      toast.success(locale === 'fa' ? 'محصول حذف شد' : 'Product deleted');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{dict.adminPanel.products}</h1>
        <Link href="/admin/products/new" className="btn-gold">
          <HiOutlinePlus className="w-4 h-4" />
          {dict.adminPanel.addProduct}
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'محصول' : 'Product'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{dict.product.price}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'موجودی' : 'Stock'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'دسته‌بندی' : 'Category'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{dict.common.loading}</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg">👔</div>
                      <div>
                        <p className="font-medium line-clamp-1">{locale === 'fa' ? p.name_fa : p.name_en}</p>
                        <p className="text-xs text-gray-400">{locale === 'fa' ? p.name_en : p.name_fa}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.discount_price ? (
                      <div>
                        <span className="text-gold font-medium">{formatPrice(p.discount_price, locale)}</span>
                        <span className="text-xs text-gray-400 line-through ms-1">{formatPrice(p.price, locale)}</span>
                      </div>
                    ) : (
                      <span>{formatPrice(p.price, locale)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {formatNumber(p.stock, locale)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.category_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500">
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">
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
