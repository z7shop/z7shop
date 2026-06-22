import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  const isId = slug.length === 36 && slug.includes('-');

  const post = isId
    ? await dbGet(`
        SELECT b.*, u.name as author_name
        FROM blog_posts b LEFT JOIN users u ON b.author_id = u.id
        WHERE b.id = ?
      `, slug)
    : await dbGet(`
        SELECT b.*, u.name as author_name
        FROM blog_posts b LEFT JOIN users u ON b.author_id = u.id
        WHERE b.slug = ? AND b.is_published = 1
      `, slug);

  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!isId) {
    await dbRun('UPDATE blog_posts SET views = views + 1 WHERE id = ?', post.id);
    post.views = Number(post.views) + 1;
  }

  let related: any[] = [];
  try {
    const tags: string[] = JSON.parse(post.tags || '[]');
    if (tags.length > 0) {
      const conditions = tags.map(() => "b.tags LIKE ?").join(' OR ');
      const tagParams = tags.map(t => `%"${t}"%`);
      related = await dbAll(`
        SELECT b.*, u.name as author_name
        FROM blog_posts b LEFT JOIN users u ON b.author_id = u.id
        WHERE b.is_published = 1 AND b.id != ? AND (${conditions})
        ORDER BY b.created_at DESC LIMIT 3
      `, post.id, ...tagParams);
    }
  } catch {}

  return NextResponse.json({ post, related });
}

export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { slug } = params;

  await dbRun(`
    UPDATE blog_posts SET
      title_fa = ?, title_en = ?, slug = ?, excerpt_fa = ?, excerpt_en = ?,
      content_fa = ?, content_en = ?, cover_image = ?, tags = ?, is_published = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `,
    body.title_fa || '',
    body.title_en || '',
    body.slug || '',
    body.excerpt_fa || '',
    body.excerpt_en || '',
    body.content_fa || '',
    body.content_en || '',
    body.cover_image || '',
    body.tags || '[]',
    body.is_published ? 1 : 0,
    slug
  );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbRun('DELETE FROM blog_posts WHERE id = ?', params.slug);

  return NextResponse.json({ success: true });
}
