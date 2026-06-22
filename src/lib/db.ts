import { createClient, Client } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

let client: Client;
let initialized = false;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:z7shop.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function dbGet(sql: string, ...args: any[]): Promise<any> {
  if (!initialized) await initDb();
  const result = await getClient().execute({ sql, args });
  return result.rows[0] || null;
}

export async function dbAll(sql: string, ...args: any[]): Promise<any[]> {
  if (!initialized) await initDb();
  const result = await getClient().execute({ sql, args });
  return result.rows as any[];
}

export async function dbRun(sql: string, ...args: any[]): Promise<any> {
  if (!initialized) await initDb();
  return await getClient().execute({ sql, args });
}

export async function dbExec(sql: string): Promise<void> {
  if (!initialized) await initDb();
  await getClient().executeMultiple(sql);
}

let initPromise: Promise<void> | null = null;

async function initDb() {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = doInit();
  return initPromise;
}

async function doInit() {
  const c = getClient();

  try { await c.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      referral_code TEXT DEFAULT '',
      provider TEXT DEFAULT 'credentials',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_fa TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name_fa TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_fa TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      price INTEGER NOT NULL,
      discount_price INTEGER,
      category_id TEXT,
      sizes TEXT DEFAULT '[]',
      colors TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      stock INTEGER DEFAULT 0,
      is_featured INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS cart (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      product_id TEXT REFERENCES products(id),
      quantity INTEGER DEFAULT 1,
      size TEXT DEFAULT '',
      color TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      address_id TEXT,
      shipping_method TEXT DEFAULT 'standard',
      coupon_code TEXT,
      discount_amount INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      lat REAL DEFAULT NULL,
      lng REAL DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_percent INTEGER NOT NULL,
      max_discount INTEGER NOT NULL,
      min_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      product_id TEXT REFERENCES products(id),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS newsletter (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      product_id TEXT REFERENCES products(id),
      rating INTEGER NOT NULL,
      title TEXT DEFAULT '',
      comment TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      subject TEXT NOT NULL,
      department TEXT DEFAULT 'support',
      priority TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'open',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT,
      user_id TEXT,
      message TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      user_id TEXT,
      amount INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      ref_number TEXT,
      card_number TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT NOT NULL,
      title_fa TEXT NOT NULL,
      title_en TEXT NOT NULL,
      message_fa TEXT NOT NULL,
      message_en TEXT NOT NULL,
      link TEXT DEFAULT '',
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title_fa TEXT NOT NULL,
      title_en TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt_fa TEXT DEFAULT '',
      excerpt_en TEXT DEFAULT '',
      content_fa TEXT DEFAULT '',
      content_en TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      author_id TEXT,
      tags TEXT DEFAULT '[]',
      is_published INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      phone TEXT DEFAULT '',
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      referrer_id TEXT,
      referred_id TEXT,
      referrer_rewarded INTEGER DEFAULT 0,
      referred_rewarded INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      status TEXT DEFAULT 'bot',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      image TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS loyalty_points (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      points INTEGER NOT NULL,
      type TEXT NOT NULL,
      description_fa TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      order_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      badge_fa TEXT DEFAULT '',
      badge_en TEXT DEFAULT '',
      title_fa TEXT NOT NULL,
      title_en TEXT NOT NULL,
      subtitle_fa TEXT DEFAULT '',
      subtitle_en TEXT DEFAULT '',
      cta_fa TEXT DEFAULT '',
      cta_en TEXT DEFAULT '',
      cta_link TEXT DEFAULT '/products',
      gradient TEXT DEFAULT '',
      accent_color TEXT DEFAULT 'gold',
      image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stock_alerts (
      id TEXT PRIMARY KEY,
      product_id TEXT REFERENCES products(id),
      email TEXT NOT NULL,
      user_id TEXT,
      notified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bundles (
      id TEXT PRIMARY KEY,
      name_fa TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_fa TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      discount_percent INTEGER NOT NULL,
      image TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bundle_items (
      id TEXT PRIMARY KEY,
      bundle_id TEXT,
      product_id TEXT    );

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, endpoint)
    );
  `); } catch (e) { console.error('initDb tables error (ignored):', (e as Error).message); }

  initialized = true;
}

async function seedDatabase(c: Client) {
  const categories = [
    { id: 'cat-tshirt', name_fa: 'تی‌شرت', name_en: 'T-Shirts', slug: 'tshirts', image: 'https://images.unsplash.com/photo-1545976917-f28c3d4aa8a8?w=600&h=600&fit=crop&q=80' },
    { id: 'cat-pants', name_fa: 'شلوار', name_en: 'Pants', slug: 'pants', image: 'https://images.unsplash.com/photo-1558717501-a5c52f98333d?w=600&h=600&fit=crop&q=80' },
    { id: 'cat-hats', name_fa: 'کلاه', name_en: 'Hats', slug: 'hats', image: 'https://images.unsplash.com/photo-1671523259920-7cdfa15767d8?w=600&h=600&fit=crop&q=80' },
    { id: 'cat-sport', name_fa: 'ورزشی', name_en: 'Sportswear', slug: 'sportswear', image: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&h=600&fit=crop&q=80' },
    { id: 'cat-shoes', name_fa: 'کفش', name_en: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80' },
  ];

  const batch1: any[] = categories.map(cat => ({ sql: 'INSERT OR IGNORE INTO categories (id, name_fa, name_en, slug, image) VALUES (?, ?, ?, ?, ?)', args: [cat.id, cat.name_fa, cat.name_en, cat.slug, cat.image] }));

  const products = [
    { name_fa: 'تی‌شرت کلاسیک مردانه', name_en: "Classic Men's T-Shirt", desc_fa: 'تی‌شرت کلاسیک مردانه از جنس پنبه با کیفیت عالی.', desc_en: "Classic men's t-shirt made of high-quality cotton.", price: 350000, discount: 289000, cat: 'cat-tshirt', sizes: '["S","M","L","XL","XXL"]', colors: '["#000000","#FFFFFF","#1E3A5F","#8B4513"]', stock: 50, featured: 1, isNew: 0, img: 'https://images.unsplash.com/photo-1758267928064-f159a683385d?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'تی‌شرت اسلیم فیت', name_en: 'Slim Fit T-Shirt', desc_fa: 'تی‌شرت اسلیم فیت با طراحی مدرن.', desc_en: 'Slim fit t-shirt with modern design.', price: 420000, discount: null, cat: 'cat-tshirt', sizes: '["S","M","L","XL"]', colors: '["#000000","#2C3E50","#E74C3C","#FFFFFF"]', stock: 35, featured: 1, isNew: 1, img: 'https://images.unsplash.com/photo-1623366302587-b38b1ddaefd9?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'تی‌شرت یقه گرد پرمیوم', name_en: 'Premium Crew Neck T-Shirt', desc_fa: 'تی‌شرت پرمیوم با یقه گرد.', desc_en: 'Premium crew neck t-shirt.', price: 580000, discount: 490000, cat: 'cat-tshirt', sizes: '["M","L","XL","XXL"]', colors: '["#1ABC9C","#3498DB","#000000"]', stock: 25, featured: 0, isNew: 1, img: 'https://images.unsplash.com/photo-1546427660-eb346c344ba5?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'تی‌شرت آستین بلند', name_en: 'Long Sleeve T-Shirt', desc_fa: 'تی‌شرت آستین بلند مناسب پاییز.', desc_en: 'Long sleeve t-shirt for fall.', price: 490000, discount: null, cat: 'cat-tshirt', sizes: '["S","M","L","XL"]', colors: '["#34495E","#7F8C8D","#2C3E50"]', stock: 40, featured: 0, isNew: 0, img: 'https://images.unsplash.com/photo-1598198414976-ddb788ec80c1?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'تی‌شرت پولو مردانه', name_en: "Men's Polo T-Shirt", desc_fa: 'تی‌شرت پولو کلاسیک مردانه.', desc_en: "Classic men's polo t-shirt.", price: 520000, discount: null, cat: 'cat-tshirt', sizes: '["M","L","XL","XXL"]', colors: '["#1C1C1C","#FFFFFF","#C9A84C","#1E3A5F"]', stock: 30, featured: 1, isNew: 1, img: 'https://images.unsplash.com/photo-1761956260682-fe12109d7878?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'شلوار جین مردانه', name_en: "Men's Jeans", desc_fa: 'شلوار جین مردانه با فیت عالی.', desc_en: "Men's jeans with great fit.", price: 890000, discount: 750000, cat: 'cat-pants', sizes: '["30","32","34","36","38"]', colors: '["#1B2631","#2E4053","#5D6D7E"]', stock: 30, featured: 1, isNew: 0, img: 'https://images.unsplash.com/photo-1558717501-a5c52f98333d?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'شلوار کتان مردانه', name_en: "Men's Chino Pants", desc_fa: 'شلوار کتان راحت و شیک.', desc_en: 'Comfortable and stylish chinos.', price: 780000, discount: null, cat: 'cat-pants', sizes: '["30","32","34","36"]', colors: '["#D4AC0D","#1C2833","#F5F5DC"]', stock: 20, featured: 1, isNew: 1, img: 'https://images.unsplash.com/photo-1721141898164-84549e17f6bb?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'شلوار اسلش مردانه', name_en: "Men's Jogger Pants", desc_fa: 'شلوار اسلش راحت مردانه.', desc_en: "Comfortable men's joggers.", price: 550000, discount: 450000, cat: 'cat-pants', sizes: '["S","M","L","XL","XXL"]', colors: '["#000000","#2C3E50","#7F8C8D"]', stock: 45, featured: 0, isNew: 1, img: 'https://images.unsplash.com/photo-1542674685-1005e2db517e?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'شلوار کارگو مردانه', name_en: "Men's Cargo Pants", desc_fa: 'شلوار کارگو با جیب‌های متعدد.', desc_en: "Men's cargo pants.", price: 720000, discount: null, cat: 'cat-pants', sizes: '["30","32","34","36","38"]', colors: '["#4A6741","#8B7355","#2C3E50"]', stock: 15, featured: 0, isNew: 0, img: 'https://images.unsplash.com/photo-1631186623896-900967726a35?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'کلاه بیسبالی مردانه', name_en: "Men's Baseball Cap", desc_fa: 'کلاه بیسبالی با کیفیت عالی.', desc_en: "High-quality baseball cap.", price: 180000, discount: 149000, cat: 'cat-hats', sizes: '["Free"]', colors: '["#000000","#FFFFFF","#1E3A5F","#8B0000"]', stock: 60, featured: 1, isNew: 0, img: 'https://images.unsplash.com/photo-1759352642162-c4b19534dec1?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'کلاه بافتنی زمستانی', name_en: 'Winter Beanie', desc_fa: 'کلاه بافتنی گرم مناسب زمستان.', desc_en: 'Warm knitted beanie for winter.', price: 220000, discount: null, cat: 'cat-hats', sizes: '["Free"]', colors: '["#2C3E50","#8B4513","#000000","#D4AC0D"]', stock: 40, featured: 0, isNew: 1, img: 'https://images.unsplash.com/photo-1638399777047-1467818f3f9f?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'کلاه فدورا مردانه', name_en: "Men's Fedora Hat", desc_fa: 'کلاه فدورا کلاسیک.', desc_en: "Classic men's fedora hat.", price: 350000, discount: 299000, cat: 'cat-hats', sizes: '["M","L"]', colors: '["#000000","#8B4513","#2C3E50"]', stock: 20, featured: 0, isNew: 0, img: 'https://images.unsplash.com/photo-1656528049647-c82eb8174d04?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'ست ورزشی مردانه', name_en: "Men's Sports Set", desc_fa: 'ست ورزشی شامل تیشرت و شلوارک.', desc_en: "Men's sports set.", price: 650000, discount: 549000, cat: 'cat-sport', sizes: '["S","M","L","XL","XXL"]', colors: '["#000000","#1E90FF","#FF4500"]', stock: 35, featured: 1, isNew: 1, img: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'هودی ورزشی مردانه', name_en: "Men's Sports Hoodie", desc_fa: 'هودی ورزشی مردانه.', desc_en: "Men's sports hoodie.", price: 780000, discount: null, cat: 'cat-sport', sizes: '["M","L","XL","XXL"]', colors: '["#2C3E50","#E74C3C","#1ABC9C"]', stock: 25, featured: 0, isNew: 1, img: 'https://images.unsplash.com/photo-1583313305600-361f0c78b8ac?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'شلوارک ورزشی مردانه', name_en: "Men's Sports Shorts", desc_fa: 'شلوارک ورزشی سبک و راحت.', desc_en: "Lightweight sports shorts.", price: 320000, discount: 269000, cat: 'cat-sport', sizes: '["S","M","L","XL"]', colors: '["#000000","#1E90FF","#2ECC71"]', stock: 50, featured: 0, isNew: 0, img: 'https://images.unsplash.com/photo-1590545495809-90d4c3a8d571?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'تی‌شرت ورزشی درای‌فیت', name_en: 'Dry-Fit Sports T-Shirt', desc_fa: 'تی‌شرت ورزشی با تکنولوژی درای‌فیت.', desc_en: 'Sports t-shirt with dry-fit.', price: 450000, discount: 380000, cat: 'cat-sport', sizes: '["S","M","L","XL","XXL"]', colors: '["#FF6347","#4169E1","#000000","#FFFFFF"]', stock: 40, featured: 1, isNew: 0, img: 'https://images.unsplash.com/photo-1590847330116-ea94fb93eac3?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'کتونی نایک ایر مکس', name_en: 'Nike Air Max Sneakers', desc_fa: 'کتونی نایک ایر مکس.', desc_en: 'Nike Air Max sneakers.', price: 2850000, discount: 2390000, cat: 'cat-shoes', sizes: '["40","41","42","43","44","45"]', colors: '["#FFFFFF","#000000","#FF0000"]', stock: 25, featured: 1, isNew: 1, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'کتونی سفید کلاسیک', name_en: 'Classic White Sneakers', desc_fa: 'کتونی سفید کلاسیک مردانه.', desc_en: 'Classic white sneakers.', price: 1980000, discount: null, cat: 'cat-shoes', sizes: '["40","41","42","43","44"]', colors: '["#FFFFFF","#F5F5DC"]', stock: 40, featured: 1, isNew: 1, img: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'کتونی اسپرت مشکی', name_en: 'Black Sport Sneakers', desc_fa: 'کتونی اسپرت مشکی.', desc_en: 'Black sport sneakers.', price: 2200000, discount: 1850000, cat: 'cat-shoes', sizes: '["41","42","43","44","45"]', colors: '["#000000","#2C3E50"]', stock: 30, featured: 0, isNew: 1, img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=800&fit=crop&q=80' },
    { name_fa: 'کتونی ری‌باک کلاسیک', name_en: 'Reebok Classic Sneakers', desc_fa: 'کتونی ری‌باک کلاسیک.', desc_en: 'Reebok Classic sneakers.', price: 2450000, discount: null, cat: 'cat-shoes', sizes: '["40","41","42","43","44"]', colors: '["#FFFFFF","#1E3A5F","#8B0000"]', stock: 20, featured: 1, isNew: 0, img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop&q=80' },
  ];

  const productIds: string[] = [];
  for (const p of products) {
    const id = uuidv4();
    productIds.push(id);
    await c.execute({ sql: 'INSERT OR IGNORE INTO products (id, name_fa, name_en, description_fa, description_en, price, discount_price, category_id, sizes, colors, images, stock, is_featured, is_new) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [id, p.name_fa, p.name_en, p.desc_fa, p.desc_en, p.price, p.discount, p.cat, p.sizes, p.colors, JSON.stringify([p.img]), p.stock, p.featured, p.isNew] });
  }

  const coupons = [
    { code: 'WELCOME10', percent: 10, max: 100000, min: 300000 },
    { code: 'Z7SHOP20', percent: 20, max: 200000, min: 500000 },
    { code: 'VIP30', percent: 30, max: 500000, min: 1000000 },
  ];
  for (const cp of coupons) {
    await c.execute({ sql: 'INSERT OR IGNORE INTO coupons (id, code, discount_percent, max_discount, min_order, expires_at) VALUES (?, ?, ?, ?, ?, ?)', args: [uuidv4(), cp.code, cp.percent, cp.max, cp.min, '2027-12-31'] });
  }

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const adminId = uuidv4();
  await c.execute({ sql: 'INSERT OR IGNORE INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)', args: [adminId, 'Admin', 'admin@z7shop.ir', adminPassword, '09121234567', 'admin'] });

  const fakeUsers = [
    { name: 'علی رضایی', email: 'ali@test.com' },
    { name: 'محمد حسینی', email: 'mohammad@test.com' },
    { name: 'رضا کریمی', email: 'reza@test.com' },
    { name: 'امیر جعفری', email: 'amir@test.com' },
    { name: 'حسین نوری', email: 'hossein@test.com' },
  ];
  const fakeUserIds: string[] = [];
  const fakePass = bcrypt.hashSync('user123', 10);
  for (const u of fakeUsers) {
    const uid = uuidv4();
    fakeUserIds.push(uid);
    await c.execute({ sql: 'INSERT OR IGNORE INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)', args: [uid, u.name, u.email, fakePass, ''] });
  }

  const allProducts = (await c.execute('SELECT id, name_fa, name_en, price, discount_price FROM products')).rows as any[];

  const fakeAddressIds: string[] = [];
  for (const uid of fakeUserIds) {
    const addrId = uuidv4();
    fakeAddressIds.push(addrId);
    await c.execute({ sql: 'INSERT OR IGNORE INTO addresses (id, user_id, title, full_name, phone, province, city, address, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)', args: [addrId, uid, 'خانه', 'کاربر تست', '09121234567', 'تهران', 'تهران', 'خیابان آزادی، پلاک ۱۲', '1234567890'] });
  }

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered'];
  for (let i = 0; i < 15; i++) {
    const userIdx = i % fakeUserIds.length;
    const userId = fakeUserIds[userIdx];
    const addrId = fakeAddressIds[userIdx];
    const status = statuses[i % statuses.length];
    const itemCount = 1 + (i % 3);
    const orderItems = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const prod = allProducts[(i + j) % allProducts.length];
      const price = Number(prod.discount_price || prod.price);
      const qty = 1 + (j % 2);
      total += price * qty;
      orderItems.push({ product_id: prod.id, name_fa: prod.name_fa, name_en: prod.name_en, price, quantity: qty, size: 'L', color: '#000000' });
    }
    const orderId = uuidv4();
    const daysAgo = 30 - (i * 2);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await c.execute({ sql: 'INSERT OR IGNORE INTO orders (id, user_id, items, total, status, address_id, shipping_method, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [orderId, userId, JSON.stringify(orderItems), total, status, addrId, i % 3 === 0 ? 'express' : 'standard', createdAt, createdAt] });
    const points = Math.floor(total / 10000);
    if (points > 0) {
      await c.execute({ sql: 'INSERT OR IGNORE INTO loyalty_points (id, user_id, points, type, description_fa, description_en, order_id) VALUES (?, ?, ?, ?, ?, ?, ?)', args: [uuidv4(), userId, points, 'earn', 'امتیاز خرید', 'Order Points', orderId] });
    }
    await c.execute({ sql: 'INSERT OR IGNORE INTO notifications (id, user_id, type, title_fa, title_en, message_fa, message_en, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', args: [uuidv4(), userId, 'order', 'سفارش ثبت شد', 'Order Placed', `سفارش ${orderId.slice(0, 8).toUpperCase()} ثبت شد`, `Order ${orderId.slice(0, 8).toUpperCase()} placed`, '/panel/orders'] });
  }

  const reviewData = [
    { title: 'کیفیت عالی', comment: 'جنس پارچه خیلی خوبه.', rating: 5 },
    { title: 'ارزش خرید داره', comment: 'نسبت به قیمتش کیفیت خوبی داره.', rating: 4 },
    { title: 'خوب بود', comment: 'سایزش دقیق بود.', rating: 4 },
    { title: 'راضیم', comment: 'محصول خوبیه.', rating: 5 },
    { title: 'معمولی', comment: 'بد نبود.', rating: 3 },
    { title: 'فوق‌العاده', comment: 'بهترین خریدم بود.', rating: 5 },
    { title: 'خوش‌پوش', comment: 'خیلی شیک.', rating: 5 },
    { title: 'قابل قبول', comment: 'برای استفاده روزمره مناسبه.', rating: 4 },
    { title: 'عالی بود', comment: 'رنگ و سایز دقیق بود.', rating: 5 },
    { title: 'نسبتاً خوب', comment: 'طرحش قشنگه.', rating: 3 },
    { title: 'خیلی راحت', comment: 'راحت‌ترین لباسیه.', rating: 5 },
    { title: 'پیشنهاد میکنم', comment: 'کیفیت و قیمت خوبی داره.', rating: 4 },
    { title: 'سایز مناسب', comment: 'دقیقاً اندازه بود.', rating: 4 },
    { title: 'بسیار شیک', comment: 'طراحی مدرن و شیک.', rating: 5 },
    { title: 'کیفیت مناسب', comment: 'کیفیت قابل قبولی داره.', rating: 4 },
    { title: 'دوخت تمیز', comment: 'دوخت و پارچه‌اش عالیه.', rating: 5 },
    { title: 'خوب ولی نه عالی', comment: 'رنگش یکم فرق داشت.', rating: 3 },
    { title: 'خرید موفق', comment: 'هر بار راضی بودم.', rating: 5 },
    { title: 'پارچه خوب', comment: 'جنس پارچه درجه یک.', rating: 4 },
    { title: 'ممنون', comment: 'محصول خوبی بود.', rating: 4 },
  ];

  const blogPosts = [
    { title_fa: 'راهنمای انتخاب تی‌شرت مردانه', title_en: "Guide to Choosing Men's T-Shirt", slug: 'guide-choosing-mens-tshirt', excerpt_fa: 'نکات مهم در انتخاب تی‌شرت مردانه.', excerpt_en: 'Key tips for choosing the perfect t-shirt.', content_fa: 'انتخاب تی‌شرت مناسب یکی از مهم‌ترین بخش‌های استایل مردانه است.', content_en: 'Choosing the right t-shirt is key to men\'s style.', cover_image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=400&fit=crop&q=80', tags: '["fashion","tshirt","guide"]' },
    { title_fa: 'ترندهای مد مردانه تابستان ۱۴۰۵', title_en: "Men's Fashion Trends Summer 2026", slug: 'mens-fashion-trends-summer-2026', excerpt_fa: 'جدیدترین ترندهای مد مردانه.', excerpt_en: 'Latest men\'s fashion trends.', content_fa: 'تابستان ۱۴۰۵ با ترندهای جذابی همراه است.', content_en: 'Summer 2026 brings exciting trends.', cover_image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=400&fit=crop&q=80', tags: '["fashion","trends","summer"]' },
    { title_fa: 'نگهداری صحیح از لباس‌ها', title_en: 'Proper Care for Clothing', slug: 'proper-care-mens-clothing', excerpt_fa: 'عمر لباس‌هایتان را چند برابر کنید.', excerpt_en: 'Extend the life of your clothes.', content_fa: 'نگهداری صحیح از لباس‌ها ظاهر آنها را حفظ می‌کند.', content_en: 'Proper care maintains appearance.', cover_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop&q=80', tags: '["care","tips","clothing"]' },
  ];

  for (const b of blogPosts) {
    await c.execute({ sql: 'INSERT OR IGNORE INTO blog_posts (id, title_fa, title_en, slug, excerpt_fa, excerpt_en, content_fa, content_en, cover_image, author_id, tags, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)', args: [uuidv4(), b.title_fa, b.title_en, b.slug, b.excerpt_fa, b.excerpt_en, b.content_fa, b.content_en, b.cover_image, adminId, b.tags] });
  }

  const allReviewers = [adminId, ...fakeUserIds];
  for (let i = 0; i < reviewData.length; i++) {
    const r = reviewData[i];
    const productId = productIds[i % productIds.length];
    const userId = allReviewers[i % allReviewers.length];
    await c.execute({ sql: 'INSERT OR IGNORE INTO reviews (id, user_id, product_id, rating, title, comment) VALUES (?, ?, ?, ?, ?, ?)', args: [uuidv4(), userId, productId, r.rating, r.title, r.comment] });
  }
}

async function seedBanners(c: Client) {
  const banners = [
    { badge_fa: 'مجموعه جدید تابستان ۱۴۰۵', badge_en: 'Summer 2026 Collection', title_fa: 'استایل **مردانه** با کیفیت بی‌نظیر', title_en: "Men's **Style** Unmatched Quality", subtitle_fa: 'جدیدترین مدل‌های لباس مردانه با بهترین کیفیت و قیمت مناسب', subtitle_en: "Latest men's fashion with the best quality and fair prices", cta_fa: 'مشاهده محصولات', cta_en: 'View Products', cta_link: '/products', gradient: 'radial-gradient(ellipse 70% 50% at 70% 20%, rgba(201, 168, 76, 0.12), transparent)', accent_color: 'gold', sort_order: 0 },
    { badge_fa: 'تخفیف‌های ویژه', badge_en: 'Special Offers', title_fa: 'تا **۵۰٪** تخفیف روی محصولات منتخب', title_en: 'Up to **50%** Off Selected Items', subtitle_fa: 'از فرصت استفاده کنید، تخفیف‌های ویژه محدود هستند', subtitle_en: "Don't miss out, special discounts are limited", cta_fa: 'خرید با تخفیف', cta_en: 'Shop Sale', cta_link: '/products?featured=true', gradient: 'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(220, 38, 38, 0.1), transparent)', accent_color: 'red', sort_order: 1 },
    { badge_fa: 'کالکشن ورزشی', badge_en: 'Sports Collection', title_fa: 'پوشاک **ورزشی** حرفه‌ای و راحت', title_en: 'Professional **Sports** Wear & Comfort', subtitle_fa: 'مناسب تمرین و زندگی روزمره با بالاترین کیفیت', subtitle_en: 'Perfect for training and daily life with top quality', cta_fa: 'مشاهده ورزشی', cta_en: 'View Sports', cta_link: '/products?category=cat-sport', gradient: 'radial-gradient(ellipse 50% 60% at 60% 40%, rgba(59, 130, 246, 0.1), transparent)', accent_color: 'blue', sort_order: 2 },
  ];
  for (const b of banners) {
    await c.execute({ sql: 'INSERT INTO banners (id, badge_fa, badge_en, title_fa, title_en, subtitle_fa, subtitle_en, cta_fa, cta_en, cta_link, gradient, accent_color, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', args: [uuidv4(), b.badge_fa, b.badge_en, b.title_fa, b.title_en, b.subtitle_fa, b.subtitle_en, b.cta_fa, b.cta_en, b.cta_link, b.gradient, b.accent_color, b.sort_order] });
  }
}

export default function getDb() { return null; }
