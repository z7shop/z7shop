'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/hooks/useLocale';
import { formatDate, toPersianNumber } from '@/i18n';
import type { BlogPost } from '@/types';
import Image from 'next/image';
import { HiOutlineEye, HiOutlineClock } from 'react-icons/hi';

export default function BlogPage() {
  const { locale, dict } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTag, setActiveTag] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '9');
    if (activeTag) params.set('tag', activeTag);

    fetch(`/api/blog?${params}`)
      .then(r => r.json())
      .then(data => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      });
  }, [page, activeTag]);

  const allTags = Array.from(
    new Set(posts.flatMap(p => { try { return JSON.parse(p.tags || '[]'); } catch { return []; } }))
  );

  const readTime = (content: string) => Math.max(1, Math.round(content.length / 1000));

  const blog = dict.blog as any;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h1 className="text-3xl md:text-5xl font-black mb-3">{blog.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-lg">{blog.subtitle}</p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => { setActiveTag(''); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${!activeTag ? 'border-gold bg-gold/10 text-gold' : 'border-gray-700 hover:border-gold/50'}`}
              >
                {dict.common.all}
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => { setActiveTag(tag); setPage(1); }}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${activeTag === tag ? 'border-gold bg-gold/10 text-gold' : 'border-gray-700 hover:border-gold/50'}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[2/1] bg-gray-800 rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-800 rounded w-full" />
                    <div className="h-4 bg-gray-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">{blog.noPosts}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => {
                const title = locale === 'fa' ? post.title_fa : post.title_en;
                const excerpt = locale === 'fa' ? post.excerpt_fa : post.excerpt_en;
                const content = locale === 'fa' ? post.content_fa : post.content_en;
                const tags: string[] = (() => { try { return JSON.parse(post.tags || '[]'); } catch { return []; } })();
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="card-hover group overflow-hidden">
                    <div className="aspect-[2/1] overflow-hidden">
                      {post.cover_image ? (
                        <Image src={post.cover_image} alt={title} width={600} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                          <span className="text-4xl opacity-30">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span>{formatDate(post.created_at, locale)}</span>
                        <span className="flex items-center gap-1">
                          <HiOutlineClock className="w-3.5 h-3.5" />
                          {locale === 'fa' ? toPersianNumber(readTime(content)) : readTime(content)} {blog.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineEye className="w-3.5 h-3.5" />
                          {locale === 'fa' ? toPersianNumber(post.views) : post.views}
                        </span>
                      </div>
                      <h2 className="font-bold text-lg mb-2 group-hover:text-gold transition-colors line-clamp-2">{title}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{excerpt}</p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.slice(0, 3).map(t => (
                            <span key={t} className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gold/20'}`}
                >
                  {locale === 'fa' ? toPersianNumber(i + 1) : i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
