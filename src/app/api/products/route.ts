import { NextRequest, NextResponse } from 'next/server';
import { dbGet, dbAll, dbRun } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured');
  const isNew = searchParams.get('new');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const size = searchParams.get('size');
  const colors = searchParams.get('colors');
  const inStock = searchParams.get('inStock');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  let query = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (category) {
    query += ' AND category_id = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name_fa LIKE ? OR name_en LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (featured === 'true') {
    query += ' AND is_featured = 1';
  }

  if (isNew === 'true') {
    query += ' AND is_new = 1';
  }

  if (minPrice) {
    query += ' AND (COALESCE(discount_price, price)) >= ?';
    params.push(parseInt(minPrice));
  }

  if (maxPrice) {
    query += ' AND (COALESCE(discount_price, price)) <= ?';
    params.push(parseInt(maxPrice));
  }

  if (size) {
    query += ' AND sizes LIKE ?';
    params.push(`%"${size}"%`);
  }

  if (inStock === 'true') {
    query += ' AND stock > 0';
  }

  if (colors) {
    const colorList = colors.split(',').filter(Boolean);
    if (colorList.length > 0) {
      const colorClauses = colorList.map(() => 'colors LIKE ?');
      query += ` AND (${colorClauses.join(' OR ')})`;
      colorList.forEach((c) => params.push(`%"${c}"%`));
    }
  }

  switch (sort) {
    case 'cheapest':
      query += ' ORDER BY COALESCE(discount_price, price) ASC';
      break;
    case 'expensive':
      query += ' ORDER BY COALESCE(discount_price, price) DESC';
      break;
    case 'popular':
      query += ' ORDER BY is_featured DESC, created_at DESC';
      break;
    default:
      query += ' ORDER BY created_at DESC';
  }

  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const totalResult = await dbGet(countQuery, ...params) as { total: number };

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  const products = await dbAll(query, ...params);

  return NextResponse.json({
    products,
    total: totalResult.total,
    page,
    totalPages: Math.ceil(totalResult.total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const id = uuidv4();

  await dbRun(`
    INSERT INTO products (id, name_fa, name_en, description_fa, description_en, price, discount_price, category_id, sizes, colors, images, stock, is_featured, is_new)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    id, body.name_fa, body.name_en, body.description_fa || '', body.description_en || '',
    body.price, body.discount_price || null, body.category_id,
    JSON.stringify(body.sizes || []), JSON.stringify(body.colors || []),
    JSON.stringify(body.images || []), body.stock || 0,
    body.is_featured ? 1 : 0, body.is_new ? 1 : 0
  );

  return NextResponse.json({ id }, { status: 201 });
}
