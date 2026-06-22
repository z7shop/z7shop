'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatDate, toPersianNumber } from '@/i18n';
import type { BlogPost } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';

export default function AdminBlogPage() {
  const { locale, dict } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    fetch('/api/blog?limit=100&all=true')
      .then(r => r.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (id: string) => {
    if (!confirm(dict.adminPanel.confirmDelete)) return;
    const res = await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success(locale === 'fa' ? 'مقاله حذف شد' : 'Post deleted');
      fetchPosts();
    }
  };

  const blog = dict.blog as any;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{locale === 'fa' ? 'مدیریت بلاگ' : 'Blog Management'}</h1>
        <Link href="/admin/blog/new" className="btn-gold text-sm">
          <HiOutlinePlus className="w-4 h-4" />
          {locale === 'fa' ? 'مقاله جدید' : 'New Post'}
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'عنوان' : 'Title'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'وضعیت' : 'Status'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{blog.views}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'تاریخ' : 'Date'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'عملیات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{dict.common.loading}</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{blog.noPosts}</td></tr>
              ) : posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{locale === 'fa' ? post.title_fa : post.title_en}</p>
                    <p className="text-xs text-gray-500 mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${post.is_published ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                      {post.is_published ? (locale === 'fa' ? 'منتشر شده' : 'Published') : (locale === 'fa' ? 'پیش‌نویس' : 'Draft')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-gray-400">
                      <HiOutlineEye className="w-4 h-4" />
                      {locale === 'fa' ? toPersianNumber(post.views) : post.views}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(post.created_at, locale)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/${post.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-400">
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => deletePost(post.id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-400">
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
