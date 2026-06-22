'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';

export default function EditBlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { locale, dict } = useLocale();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title_fa: '', title_en: '', slug: '',
    excerpt_fa: '', excerpt_en: '',
    content_fa: '', content_en: '',
    cover_image: '', tags: '', is_published: true,
  });

  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.post) {
          const p = data.post;
          const tags: string[] = (() => { try { return JSON.parse(p.tags || '[]'); } catch { return []; } })();
          setForm({
            title_fa: p.title_fa, title_en: p.title_en, slug: p.slug,
            excerpt_fa: p.excerpt_fa, excerpt_en: p.excerpt_en,
            content_fa: p.content_fa, content_en: p.content_en,
            cover_image: p.cover_image, tags: tags.join(', '),
            is_published: !!p.is_published,
          });
        }
        setLoading(false);
      });
  }, [id]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.title_fa || !form.title_en || !form.slug) {
      toast.error(locale === 'fa' ? 'عنوان و اسلاگ الزامی هستند' : 'Title and slug are required');
      return;
    }
    setSaving(true);
    const tagsArray = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    const res = await fetch(`/api/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tags: JSON.stringify(tagsArray) }),
    });
    if (res.ok) {
      toast.success(locale === 'fa' ? 'مقاله بروزرسانی شد' : 'Post updated');
      router.push('/admin/blog');
    } else {
      toast.error(locale === 'fa' ? 'خطا در بروزرسانی' : 'Error updating');
    }
    setSaving(false);
  };

  if (loading) {
    return <AdminLayout><div className="text-center py-10 text-gray-500">{dict.common.loading}</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{locale === 'fa' ? 'ویرایش مقاله' : 'Edit Post'}</h1>
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
