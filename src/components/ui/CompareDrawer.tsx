'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { useLocale } from '@/hooks/useLocale';
import { formatPrice } from '@/i18n';
import { HiOutlineX, HiOutlineStar } from 'react-icons/hi';
import Link from 'next/link';

interface ProductFull {
  id: string;
  name_fa: string;
  name_en: string;
  price: number;
  discount_price: number | null;
  description_fa: string;
  description_en: string;
  sizes: string;
  colors: string;
  images: string;
  stock: number;
  category_id: string;
}

export default function CompareDrawer() {
  const { locale } = useLocale();
  const { compareIds, removeCompare, clearCompare } = useStore();
  const [products, setProducts] = useState<ProductFull[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (compareIds.length === 0) { setProducts([]); return; }
    Promise.all(
      compareIds.map((id) =>
        fetch(`/api/products/${id}`).then((r) => r.json()).then((d) => d.product as ProductFull).catch(() => null)
      )
    ).then((results) => setProducts(results.filter(Boolean) as ProductFull[]));
  }, [compareIds]);

  if (compareIds.length === 0) return null;

  const parseSizes = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };
  const parseColors = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };
  const parseImages = (s: string) => { try { return JSON.parse(s) as string[]; } catch { return []; } };

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-40 glass border-t border-gray-700/30 px-4 py-3 animate-fade-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {products.map((p) => {
              const name = locale === 'fa' ? p.name_fa : p.name_en;
              const imgs = parseImages(p.images);
              return (
                <div key={p.id} className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-2 flex-shrink-0 border border-gray-700/30">
                  <div className="w-8 h-8 bg-gray-700/50 rounded-lg overflow-hidden">
                    {imgs[0] ? <img src={imgs[0]} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-sm">👔</span>}
                  </div>
                  <p className="text-xs font-medium truncate max-w-[100px]">{name}</p>
                  <button onClick={() => removeCompare(p.id)} className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400">
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 hidden sm:inline">
              {locale === 'fa' ? `${compareIds.length} محصول` : `${compareIds.length} items`}
            </span>
            {compareIds.length >= 2 && (
              <button onClick={() => setShowModal(true)} className="btn-gold py-2 px-4 text-xs">
                {locale === 'fa' ? 'مقایسه' : 'Compare'}
              </button>
            )}
            <button onClick={clearCompare} className="text-xs text-gray-500 hover:text-red-400 px-2 py-1">
              {locale === 'fa' ? 'حذف همه' : 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {showModal && products.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-20 px-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-gray-900 border border-gray-700/50 rounded-2xl w-full max-w-4xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gold">
                {locale === 'fa' ? 'مقایسه محصولات' : 'Compare Products'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-start text-xs text-gray-500 pb-4 pe-4 w-28">{locale === 'fa' ? 'ویژگی' : 'Feature'}</th>
                    {products.map((p) => (
                      <th key={p.id} className="pb-4 px-2 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 border border-gray-700/50">
                            {parseImages(p.images)[0] ? (
                              <img src={parseImages(p.images)[0]} alt="" className="w-full h-full object-cover" />
                            ) : <span className="flex items-center justify-center w-full h-full text-2xl">👔</span>}
                          </div>
                          <Link href={`/products/${p.id}`} onClick={() => setShowModal(false)} className="text-sm font-medium hover:text-gold transition-colors line-clamp-2 text-center">
                            {locale === 'fa' ? p.name_fa : p.name_en}
                          </Link>
                          <button onClick={() => { removeCompare(p.id); if (compareIds.length <= 2) setShowModal(false); }} className="text-[10px] text-gray-500 hover:text-red-400">
                            {locale === 'fa' ? 'حذف' : 'Remove'}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-t border-gray-800">
                    <td className="py-3 pe-4 text-gray-400 text-xs">{locale === 'fa' ? 'قیمت' : 'Price'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="py-3 px-2 text-center">
                        {p.discount_price ? (
                          <div>
                            <span className="text-gray-500 line-through text-xs block">{formatPrice(p.price, locale)}</span>
                            <span className="text-gold font-bold">{formatPrice(p.discount_price, locale)}</span>
                          </div>
                        ) : (
                          <span className="font-bold">{formatPrice(p.price, locale)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="py-3 pe-4 text-gray-400 text-xs">{locale === 'fa' ? 'موجودی' : 'Stock'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="py-3 px-2 text-center">
                        {p.stock > 0 ? (
                          <span className="text-green-400 text-xs">{locale === 'fa' ? `${p.stock} عدد` : `${p.stock} pcs`}</span>
                        ) : (
                          <span className="text-red-400 text-xs">{locale === 'fa' ? 'ناموجود' : 'Out of stock'}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="py-3 pe-4 text-gray-400 text-xs">{locale === 'fa' ? 'سایزها' : 'Sizes'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="py-3 px-2 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {parseSizes(p.sizes).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs border border-gray-700/50">{s}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="py-3 pe-4 text-gray-400 text-xs">{locale === 'fa' ? 'رنگ‌ها' : 'Colors'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="py-3 px-2 text-center">
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {parseColors(p.colors).map((c, i) => (
                            <span key={i} className="w-5 h-5 rounded-full border-2 border-gray-600/50 shadow-sm" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-800">
                    <td className="py-3 pe-4 text-gray-400 text-xs">{locale === 'fa' ? 'توضیحات' : 'Description'}</td>
                    {products.map((p) => (
                      <td key={p.id} className="py-3 px-2 text-center">
                        <p className="text-xs text-gray-300 line-clamp-3 max-w-[200px] mx-auto">
                          {locale === 'fa' ? p.description_fa : p.description_en}
                        </p>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
