'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';

export default function NewBlogPostPage() {
  const router = useRouter();
  const { locale, dict } = useLocale();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title_fa: '', title_en: '', slug: '',
    excerpt_fa: '', excerpt_en: '',
    content_fa: '', content_en: '',
    cover_image: '', tags: '', is_published: true,
  });

  const update = (field: string, value: any) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'title_en' && !prev.slug) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.title_fa || !form.title_en || !form.slug) {
      toast.error(locale === 'fa' ? 'عنوان و اسلاگ الزامی هستند' : 'Title and slug are required');
      return;
    }
    setSaving(true);
    const tagsArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const res = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tags: JSON.stringify(tagsArray) }),
    });
    if (res.ok) {
      toast.success(locale === 'fa' ? 'مقاله ذخیره شد' : 'Post saved');
      router.push('/admin/blog');
    } else {
      toast.error(locale === 'fa' ? 'خطا در ذخیره' : 'Error saving');
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{locale === 'fa' ? 'مقاله جدید' : 'New Post'}</h1>
      </div>

      <div className="card p-6 space-y-5 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'عنوان فارسی' : 'Title (FA)'}</label>
            <input className="input-field" value={form.title_fa} onChange={e => update('title_fa', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'عنوان انگلیسی' : 'Title (EN)'}</label>
            <input className="input-field" value={form.title_en} onChange={e => update('title_en', e.target.value)} dir="ltr" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'اسلاگ (URL)' : 'Slug (URL)'}</label>
          <input className="input-field" value={form.slug} onChange={e => update('slug', e.target.value)} dir="ltr" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'خلاصه فارسی' : 'Excerpt (FA)'}</label>
            <textarea className="input-field" rows={2} value={form.excerpt_fa} onChange={e => update('excerpt_fa', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'خلاصه انگلیسی' : 'Excerpt (EN)'}</label>
            <textarea className="input-field" rows={2} value={form.excerpt_en} onChange={e => update('excerpt_en', e.target.value)} dir="ltr" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'محتوا فارسی' : 'Content (FA)'}</label>
          <textarea className="input-field" rows={8} value={form.content_fa} onChange={e => update('content_fa', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'محتوا انگلیسی' : 'Content (EN)'}</label>
          <textarea className="input-field" rows={8} value={form.content_en} onChange={e => update('content_en', e.target.value)} dir="ltr" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'تصویر کاور (URL)' : 'Cover Image (URL)'}</label>
            <input className="input-field" value={form.cover_image} onChange={e => update('cover_image', e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{locale === 'fa' ? 'برچسب‌ها (با کاما جدا کنید)' : 'Tags (comma separated)'}</label>
            <input className="input-field" value={form.tags} onChange={e => update('tags', e.target.value)} dir="ltr" placeholder="fashion, tips, guide" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={e => update('is_published', e.target.checked)} className="accent-gold w-4 h-4" />
          <span className="text-sm">{locale === 'fa' ? 'منتشر شود' : 'Publish'}</span>
        </label>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-gold px-8 py-2.5">
            {saving ? (dict.common.loading) : (dict.common.save)}
          </button>
          <button onClick={() => router.push('/admin/blog')} className="btn-outline px-6 py-2.5">
            {dict.common.cancel}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
