import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '9');
  const tag = searchParams.get('tag') || '';
  const all = searchParams.get('all') === 'true';
  const offset = (page - 1) * limit;

  let whereClause = all ? 'WHERE 1=1' : 'WHERE b.is_published = 1';
  const params: any[] = [];

  if (tag) {
    whereClause += " AND b.tags LIKE ?";
    params.push(`%"${tag}"%`);
  }

  const countRow = await dbGet(`SELECT COUNT(*) as c FROM blog_posts b ${whereClause}`, ...params);
  const total = Number(countRow.c);
  const totalPages = Math.ceil(total / limit);

  const posts = await dbAll(`
    SELECT b.*, u.name as author_name
    FROM blog_posts b
    LEFT JOIN users u ON b.author_id = u.id
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `, ...params, limit, offset);

  return NextResponse.json({ posts, total, totalPages });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const id = uuidv4();

  await dbRun(`
    INSERT INTO blog_posts (id, title_fa, title_en, slug, excerpt_fa, excerpt_en, content_fa, content_en, cover_image, author_id, tags, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    id,
    body.title_fa || '',
    body.title_en || '',
    body.slug || '',
    body.excerpt_fa || '',
    body.excerpt_en || '',
    body.content_fa || '',
    body.content_en || '',
    body.cover_image || '',
    (session.user as any).id,
    body.tags || '[]',
    body.is_published ? 1 : 0
  );

  return NextResponse.json({ id }, { status: 201 });
}
