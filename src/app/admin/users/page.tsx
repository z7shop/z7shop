'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import { formatDate } from '@/i18n';

export default function AdminUsersPage() {
  const { locale, dict } = useLocale();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{dict.adminPanel.users}</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{dict.auth.name}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{dict.auth.email}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{dict.auth.phone}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'نقش' : 'Role'}</th>
                <th className="px-4 py-3 text-start font-medium text-gray-500">{locale === 'fa' ? 'تاریخ عضویت' : 'Joined'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">{dict.common.loading}</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">{user.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === 'admin' ? 'bg-gold/10 text-gold' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {user.role === 'admin' ? (locale === 'fa' ? 'مدیر' : 'Admin') : (locale === 'fa' ? 'کاربر' : 'User')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.created_at, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
