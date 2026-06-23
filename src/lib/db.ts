import { createClient, Client } from '@libsql/client';

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

