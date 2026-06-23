'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SocialShare from '@/components/ui/SocialShare';
import { useLocale } from '@/hooks/useLocale';
import { formatDate, toPersianNumber } from '@/i18n';
import type { BlogPost } from '@/types';
import Image from 'next/image';
import { HiOutlineEye, HiOutlineClock, HiOutlineUser, HiOutlineCalendar, HiOutlineTag } from 'react-icons/hi';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { locale, dict } = useLocale();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setPost(data.post);
        setRelated(data.related || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const blog = dict.blog as any;

  if (loading) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-800 rounded w-1/3" />
            <div className="aspect-[2/1] bg-gray-800 rounded-2xl" />
            <div className="h-8 bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-6xl font-black text-gradient mb-4">{locale === 'fa' ? '۴۰۴' : '404'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{locale === 'fa' ? 'مقاله یافت نشد' : 'Article not found'}</p>
          <Link href="/blog" className="btn-gold">{locale === 'fa' ? 'بازگشت به مجله' : 'Back to Magazine'}</Link>
        </main>
        <Footer />
      </>
    );
  }

  const title = locale === 'fa' ? post.title_fa : post.title_en;
  const content = locale === 'fa' ? post.content_fa : post.content_en;
  const excerpt = locale === 'fa' ? post.excerpt_fa : post.excerpt_en;
  const tags: string[] = (() => { try { return JSON.parse(post.tags || '[]'); } catch { return []; } })();
  const readTime = Math.max(1, Math.round(content.length / 1000));
  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumbs items={[
          { label: dict.common.home, href: '/' },
          { label: blog.title, href: '/blog' },
          { label: title },
        ]} />

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mt-6 aspect-[2/1] rounded-2xl overflow-hidden">
            <Image src={post.cover_image} alt={title} width={800} height={400} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title & Meta */}
        <div className="mt-8 mb-8">
          <h1 className="text-2xl md:text-4xl font-black mb-4 leading-tight">{title}</h1>
          {excerpt && <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">{excerpt}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <HiOutlineUser className="w-4 h-4" />
                {post.author_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <HiOutlineCalendar className="w-4 h-4" />
              {formatDate(post.created_at, locale)}
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineClock className="w-4 h-4" />
              {locale === 'fa' ? toPersianNumber(readTime) : readTime} {blog.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <HiOutlineEye className="w-4 h-4" />
              {locale === 'fa' ? toPersianNumber(post.views) : post.views} {blog.views}
            </span>
          </div>
        </div>

        {/* Content */}
        <article className="prose prose-invert max-w-none mb-10">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-gray-300 leading-8 text-base mb-5">{p}</p>
          ))}
        </article>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8 pb-8 border-b border-gray-800/50">
            <HiOutlineTag className="w-4 h-4 text-gray-500" />
            {tags.map(t => (
              <Link key={t} href={`/blog?tag=${t}`} className="text-sm bg-gold/10 text-gold px-3 py-1 rounded-full hover:bg-gold/20 transition-colors">
                #{t}
              </Link>
            ))}
          </div>
        )}

        {/* Social Share */}
        <div className="mb-12">
          <SocialShare url={typeof window !== 'undefined' ? window.location.href : ''} title={title} />
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="border-t border-gray-800/50 pt-8 mb-8">
            <h2 className="text-xl font-bold mb-6">{blog.relatedPosts}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(rp => {
                const rTitle = locale === 'fa' ? rp.title_fa : rp.title_en;
                return (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} className="card-hover group overflow-hidden">
                    <div className="aspect-[2/1] overflow-hidden">
                      {rp.cover_image ? (
                        <Image src={rp.cover_image} alt={rTitle} width={600} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                          <span className="text-3xl opacity-30">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-2">{formatDate(rp.created_at, locale)}</p>
                      <h3 className="font-bold group-hover:text-gold transition-colors line-clamp-2">{rTitle}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
