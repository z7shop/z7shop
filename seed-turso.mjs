import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import bcryptjs from 'bcryptjs';

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const client = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
const uuid = () => randomUUID();

console.log('Creating tables...');
await client.executeMultiple(`
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, phone TEXT DEFAULT '', role TEXT DEFAULT 'user', referral_code TEXT DEFAULT '', provider TEXT DEFAULT 'credentials', created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, image TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, description_fa TEXT DEFAULT '', description_en TEXT DEFAULT '', price INTEGER NOT NULL, discount_price INTEGER, category_id TEXT, sizes TEXT DEFAULT '[]', colors TEXT DEFAULT '[]', images TEXT DEFAULT '[]', stock INTEGER DEFAULT 0, is_featured INTEGER DEFAULT 0, is_new INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS cart (id TEXT PRIMARY KEY, user_id TEXT, product_id TEXT, quantity INTEGER DEFAULT 1, size TEXT DEFAULT '', color TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT, items TEXT NOT NULL, total INTEGER NOT NULL, status TEXT DEFAULT 'pending', address_id TEXT, shipping_method TEXT DEFAULT 'standard', coupon_code TEXT, discount_amount INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS addresses (id TEXT PRIMARY KEY, user_id TEXT, title TEXT NOT NULL, full_name TEXT NOT NULL, phone TEXT NOT NULL, province TEXT NOT NULL, city TEXT NOT NULL, address TEXT NOT NULL, postal_code TEXT NOT NULL, is_default INTEGER DEFAULT 0, lat REAL DEFAULT NULL, lng REAL DEFAULT NULL);
CREATE TABLE IF NOT EXISTS coupons (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, discount_percent INTEGER NOT NULL, max_discount INTEGER NOT NULL, min_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, expires_at TEXT);
CREATE TABLE IF NOT EXISTS wishlist (id TEXT PRIMARY KEY, user_id TEXT, product_id TEXT, UNIQUE(user_id, product_id));
CREATE TABLE IF NOT EXISTS newsletter (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, user_id TEXT, product_id TEXT, rating INTEGER NOT NULL, title TEXT DEFAULT '', comment TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, product_id));
CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, user_id TEXT, subject TEXT NOT NULL, department TEXT DEFAULT 'support', priority TEXT DEFAULT 'normal', status TEXT DEFAULT 'open', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS ticket_messages (id TEXT PRIMARY KEY, ticket_id TEXT, user_id TEXT, message TEXT NOT NULL, is_admin INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, order_id TEXT, user_id TEXT, amount INTEGER NOT NULL, status TEXT DEFAULT 'pending', ref_number TEXT, card_number TEXT, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT, type TEXT NOT NULL, title_fa TEXT NOT NULL, title_en TEXT NOT NULL, message_fa TEXT NOT NULL, message_en TEXT NOT NULL, link TEXT DEFAULT '', is_read INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, title_fa TEXT NOT NULL, title_en TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, excerpt_fa TEXT DEFAULT '', excerpt_en TEXT DEFAULT '', content_fa TEXT DEFAULT '', content_en TEXT DEFAULT '', cover_image TEXT DEFAULT '', author_id TEXT, tags TEXT DEFAULT '[]', is_published INTEGER DEFAULT 0, views INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS verification_codes (id TEXT PRIMARY KEY, email TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, phone TEXT DEFAULT '', expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS referrals (id TEXT PRIMARY KEY, referrer_id TEXT, referred_id TEXT, referrer_rewarded INTEGER DEFAULT 0, referred_rewarded INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS chat_sessions (id TEXT PRIMARY KEY, user_id TEXT, status TEXT DEFAULT 'bot', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, session_id TEXT, sender TEXT NOT NULL, message TEXT NOT NULL, image TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS loyalty_points (id TEXT PRIMARY KEY, user_id TEXT, points INTEGER NOT NULL, type TEXT NOT NULL, description_fa TEXT DEFAULT '', description_en TEXT DEFAULT '', order_id TEXT, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS banners (id TEXT PRIMARY KEY, badge_fa TEXT DEFAULT '', badge_en TEXT DEFAULT '', title_fa TEXT NOT NULL, title_en TEXT NOT NULL, subtitle_fa TEXT DEFAULT '', subtitle_en TEXT DEFAULT '', cta_fa TEXT DEFAULT '', cta_en TEXT DEFAULT '', cta_link TEXT DEFAULT '/products', gradient TEXT DEFAULT '', accent_color TEXT DEFAULT 'gold', image TEXT DEFAULT '', sort_order INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS stock_alerts (id TEXT PRIMARY KEY, product_id TEXT, email TEXT NOT NULL, user_id TEXT, notified INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS bundles (id TEXT PRIMARY KEY, name_fa TEXT NOT NULL, name_en TEXT NOT NULL, description_fa TEXT DEFAULT '', description_en TEXT DEFAULT '', discount_percent INTEGER NOT NULL, image TEXT DEFAULT '', is_active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS bundle_items (id TEXT PRIMARY KEY, bundle_id TEXT, product_id TEXT);
CREATE TABLE IF NOT EXISTS push_subscriptions (id TEXT PRIMARY KEY, user_id TEXT, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), UNIQUE(user_id, endpoint));
`);
console.log('Tables created');

console.log('Seeding Turso database...');

// Batch 1: Categories
await client.batch([
  { sql: 'INSERT OR IGNORE INTO categories VALUES (?,?,?,?,?)', args: ['cat-tshirt','تی‌شرت','T-Shirts','tshirts','https://images.unsplash.com/photo-1545976917-f28c3d4aa8a8?w=600&h=600&fit=crop&q=80'] },
  { sql: 'INSERT OR IGNORE INTO categories VALUES (?,?,?,?,?)', args: ['cat-pants','شلوار','Pants','pants','https://images.unsplash.com/photo-1558717501-a5c52f98333d?w=600&h=600&fit=crop&q=80'] },
  { sql: 'INSERT OR IGNORE INTO categories VALUES (?,?,?,?,?)', args: ['cat-hats','کلاه','Hats','hats','https://images.unsplash.com/photo-1671523259920-7cdfa15767d8?w=600&h=600&fit=crop&q=80'] },
  { sql: 'INSERT OR IGNORE INTO categories VALUES (?,?,?,?,?)', args: ['cat-sport','ورزشی','Sportswear','sportswear','https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&h=600&fit=crop&q=80'] },
  { sql: 'INSERT OR IGNORE INTO categories VALUES (?,?,?,?,?)', args: ['cat-shoes','کفش','Shoes','shoes','https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80'] },
], 'write');
console.log('Categories done');

// Products
const prods = [
  ['تی‌شرت کلاسیک مردانه',"Classic Men's T-Shirt",'تی‌شرت کلاسیک.',"Classic t-shirt.",350000,289000,'cat-tshirt','["S","M","L","XL","XXL"]','["#000000","#FFFFFF","#1E3A5F"]',50,1,0,'https://images.unsplash.com/photo-1758267928064-f159a683385d?w=600&h=800&fit=crop&q=80'],
  ['تی‌شرت اسلیم فیت','Slim Fit T-Shirt','اسلیم فیت.','Slim fit.',420000,null,'cat-tshirt','["S","M","L","XL"]','["#000000","#2C3E50","#E74C3C"]',35,1,1,'https://images.unsplash.com/photo-1623366302587-b38b1ddaefd9?w=600&h=800&fit=crop&q=80'],
  ['تی‌شرت یقه گرد','Premium Crew Neck','یقه گرد پرمیوم.','Premium crew neck.',580000,490000,'cat-tshirt','["M","L","XL","XXL"]','["#1ABC9C","#3498DB","#000000"]',25,0,1,'https://images.unsplash.com/photo-1546427660-eb346c344ba5?w=600&h=800&fit=crop&q=80'],
  ['تی‌شرت آستین بلند','Long Sleeve T-Shirt','آستین بلند.','Long sleeve.',490000,null,'cat-tshirt','["S","M","L","XL"]','["#34495E","#7F8C8D"]',40,0,0,'https://images.unsplash.com/photo-1598198414976-ddb788ec80c1?w=600&h=800&fit=crop&q=80'],
  ['تی‌شرت پولو',"Men's Polo",'پولو کلاسیک.','Classic polo.',520000,null,'cat-tshirt','["M","L","XL","XXL"]','["#1C1C1C","#FFFFFF","#C9A84C"]',30,1,1,'https://images.unsplash.com/photo-1761956260682-fe12109d7878?w=600&h=800&fit=crop&q=80'],
  ['شلوار جین',"Men's Jeans",'جین مردانه.',"Men's jeans.",890000,750000,'cat-pants','["30","32","34","36","38"]','["#1B2631","#2E4053"]',30,1,0,'https://images.unsplash.com/photo-1558717501-a5c52f98333d?w=600&h=800&fit=crop&q=80'],
  ['شلوار کتان',"Men's Chinos",'کتان شیک.','Stylish chinos.',780000,null,'cat-pants','["30","32","34","36"]','["#D4AC0D","#1C2833"]',20,1,1,'https://images.unsplash.com/photo-1721141898164-84549e17f6bb?w=600&h=800&fit=crop&q=80'],
  ['شلوار اسلش',"Men's Joggers",'اسلش راحت.','Comfy joggers.',550000,450000,'cat-pants','["S","M","L","XL","XXL"]','["#000000","#2C3E50"]',45,0,1,'https://images.unsplash.com/photo-1542674685-1005e2db517e?w=600&h=800&fit=crop&q=80'],
  ['شلوار کارگو',"Cargo Pants",'کارگو.','Cargo pants.',720000,null,'cat-pants','["30","32","34","36","38"]','["#4A6741","#8B7355"]',15,0,0,'https://images.unsplash.com/photo-1631186623896-900967726a35?w=600&h=800&fit=crop&q=80'],
  ['کلاه بیسبالی',"Baseball Cap",'بیسبالی.','Baseball cap.',180000,149000,'cat-hats','["Free"]','["#000000","#FFFFFF","#1E3A5F"]',60,1,0,'https://images.unsplash.com/photo-1759352642162-c4b19534dec1?w=600&h=800&fit=crop&q=80'],
  ['کلاه بافتنی','Winter Beanie','بافتنی.','Winter beanie.',220000,null,'cat-hats','["Free"]','["#2C3E50","#8B4513","#000000"]',40,0,1,'https://images.unsplash.com/photo-1638399777047-1467818f3f9f?w=600&h=800&fit=crop&q=80'],
  ['کلاه فدورا',"Fedora Hat",'فدورا.','Fedora hat.',350000,299000,'cat-hats','["M","L"]','["#000000","#8B4513"]',20,0,0,'https://images.unsplash.com/photo-1656528049647-c82eb8174d04?w=600&h=800&fit=crop&q=80'],
  ['ست ورزشی',"Sports Set",'ست ورزشی.','Sports set.',650000,549000,'cat-sport','["S","M","L","XL","XXL"]','["#000000","#1E90FF"]',35,1,1,'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&h=800&fit=crop&q=80'],
  ['هودی ورزشی',"Sports Hoodie",'هودی.','Sports hoodie.',780000,null,'cat-sport','["M","L","XL","XXL"]','["#2C3E50","#E74C3C"]',25,0,1,'https://images.unsplash.com/photo-1583313305600-361f0c78b8ac?w=600&h=800&fit=crop&q=80'],
  ['شلوارک ورزشی',"Sports Shorts",'شلوارک.','Sports shorts.',320000,269000,'cat-sport','["S","M","L","XL"]','["#000000","#1E90FF"]',50,0,0,'https://images.unsplash.com/photo-1590545495809-90d4c3a8d571?w=600&h=800&fit=crop&q=80'],
  ['تی‌شرت درای‌فیت','Dry-Fit T-Shirt','درای‌فیت.','Dry-fit.',450000,380000,'cat-sport','["S","M","L","XL","XXL"]','["#FF6347","#4169E1","#000000"]',40,1,0,'https://images.unsplash.com/photo-1590847330116-ea94fb93eac3?w=600&h=800&fit=crop&q=80'],
  ['کتونی نایک','Nike Air Max','نایک ایرمکس.','Nike Air Max.',2850000,2390000,'cat-shoes','["40","41","42","43","44","45"]','["#FFFFFF","#000000"]',25,1,1,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop&q=80'],
  ['کتونی سفید','White Sneakers','سفید کلاسیک.','Classic white.',1980000,null,'cat-shoes','["40","41","42","43","44"]','["#FFFFFF","#F5F5DC"]',40,1,1,'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=800&fit=crop&q=80'],
  ['کتونی مشکی','Black Sneakers','اسپرت مشکی.','Black sport.',2200000,1850000,'cat-shoes','["41","42","43","44","45"]','["#000000","#2C3E50"]',30,0,1,'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=800&fit=crop&q=80'],
  ['کتونی ری‌باک','Reebok Classic','ری‌باک.','Reebok Classic.',2450000,null,'cat-shoes','["40","41","42","43","44"]','["#FFFFFF","#1E3A5F"]',20,1,0,'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=800&fit=crop&q=80'],
  ['ساک ورزشی حرفه‌ای','Pro Sports Duffel Bag','ساک ورزشی بزرگ با جیب مخصوص کفش، جنس بادوام ضدآب، بند شانه‌ای قابل تنظیم و دسته‌های مقاوم. مناسب باشگاه، سفر و تمرینات ورزشی.','Large gym duffel bag with separate shoe compartment, waterproof durable material, adjustable shoulder strap and reinforced handles. Perfect for gym, travel and sports training.',890000,749000,'cat-sport','["Free"]','["#000000","#1E3A5F","#2C3E50"]',45,1,1,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&q=80'],
  ['جوراب ورزشی و روزمره (پک ۳ جفتی)','Sports & Daily Socks (3-Pack)','پک ۳ جفتی جوراب با کیفیت بالا: ۲ جفت ورزشی مچی ضدعرق با پد محافظ و ۱ جفت ساق‌بلند روزمره. جنس پنبه‌ای نرم با الیاف کشسان. مناسب ورزش و استفاده روزانه.','Premium 3-pack socks: 2 pairs moisture-wicking ankle sports socks with cushioned padding and 1 pair daily crew socks. Soft cotton blend with elastic fibers. Perfect for sports and everyday wear.',185000,149000,'cat-sport','["Free"]','["#000000","#FFFFFF","#2C3E50"]',80,0,1,'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&h=800&fit=crop&q=80'],
];

const productIds = [];
const prodBatch = prods.map(p => {
  const id = uuid();
  productIds.push(id);
  return { sql: 'INSERT OR IGNORE INTO products (id,name_fa,name_en,description_fa,description_en,price,discount_price,category_id,sizes,colors,images,stock,is_featured,is_new) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', args: [id,...p.slice(0,10),JSON.stringify([p[12]]),p[10],p[11],p[12]?0:0] };
});
// Fix: properly map args
const prodBatch2 = prods.map(p => {
  const id = uuid();
  productIds.length > 20 || productIds.push(id);
  return { sql: 'INSERT OR IGNORE INTO products (id,name_fa,name_en,description_fa,description_en,price,discount_price,category_id,sizes,colors,images,stock,is_featured,is_new) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    args: [id, p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], JSON.stringify([p[12]]), p[9], p[10], p[11]] };
});
productIds.length = 0;
prodBatch2.forEach(b => productIds.push(b.args[0]));
await client.batch(prodBatch2, 'write');
console.log('Products done: ' + productIds.length);

// Users + coupons
const adminPass = bcryptjs.hashSync('admin123', 10);
const adminId = uuid();
const userPass = bcryptjs.hashSync('user123', 10);
const uids = [uuid(),uuid(),uuid(),uuid(),uuid()];
await client.batch([
  { sql: 'INSERT OR IGNORE INTO coupons (id,code,discount_percent,max_discount,min_order,expires_at) VALUES (?,?,?,?,?,?)', args: [uuid(),'WELCOME10',10,100000,300000,'2027-12-31'] },
  { sql: 'INSERT OR IGNORE INTO coupons (id,code,discount_percent,max_discount,min_order,expires_at) VALUES (?,?,?,?,?,?)', args: [uuid(),'Z7SHOP20',20,200000,500000,'2027-12-31'] },
  { sql: 'INSERT OR IGNORE INTO coupons (id,code,discount_percent,max_discount,min_order,expires_at) VALUES (?,?,?,?,?,?)', args: [uuid(),'VIP30',30,500000,1000000,'2027-12-31'] },
  { sql: 'INSERT OR IGNORE INTO users (id,name,email,password,phone,role) VALUES (?,?,?,?,?,?)', args: [adminId,'Admin','admin@z7shop.ir',adminPass,'09121234567','admin'] },
  { sql: 'INSERT OR IGNORE INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)', args: [uids[0],'علی رضایی','ali@test.com',userPass,''] },
  { sql: 'INSERT OR IGNORE INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)', args: [uids[1],'محمد حسینی','mohammad@test.com',userPass,''] },
  { sql: 'INSERT OR IGNORE INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)', args: [uids[2],'رضا کریمی','reza@test.com',userPass,''] },
  { sql: 'INSERT OR IGNORE INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)', args: [uids[3],'امیر جعفری','amir@test.com',userPass,''] },
  { sql: 'INSERT OR IGNORE INTO users (id,name,email,password,phone) VALUES (?,?,?,?,?)', args: [uids[4],'حسین نوری','hossein@test.com',userPass,''] },
], 'write');
console.log('Users + coupons done');

// Addresses
const addrIds = uids.map(() => uuid());
await client.batch(uids.map((uid, i) => ({
  sql: 'INSERT OR IGNORE INTO addresses (id,user_id,title,full_name,phone,province,city,address,postal_code,is_default) VALUES (?,?,?,?,?,?,?,?,?,1)',
  args: [addrIds[i], uid, 'خانه', 'کاربر تست', '09121234567', 'تهران', 'تهران', 'خیابان آزادی، پلاک ۱۲', '1234567890']
})), 'write');
console.log('Addresses done');

// Orders
const statuses = ['pending','processing','shipped','delivered','delivered','delivered'];
const orderBatch = [];
for (let i = 0; i < 15; i++) {
  const ui = i % 5;
  const itemCount = 1 + (i % 3);
  const items = [];
  let total = 0;
  for (let j = 0; j < itemCount; j++) {
    const pi = (i + j) % productIds.length;
    const p = prods[pi];
    const price = p[5] || p[4];
    const qty = 1 + (j % 2);
    total += price * qty;
    items.push({ product_id: productIds[pi], name_fa: p[0], name_en: p[1], price, quantity: qty, size: 'L', color: '#000000' });
  }
  const oid = uuid();
  const days = 30 - (i * 2);
  const ca = new Date(Date.now() - days*86400000).toISOString().slice(0,19).replace('T',' ');
  orderBatch.push({ sql: 'INSERT OR IGNORE INTO orders (id,user_id,items,total,status,address_id,shipping_method,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
    args: [oid, uids[ui], JSON.stringify(items), total, statuses[i%6], addrIds[ui], i%3===0?'express':'standard', ca, ca] });
  const pts = Math.floor(total/10000);
  if (pts > 0) orderBatch.push({ sql: 'INSERT OR IGNORE INTO loyalty_points (id,user_id,points,type,description_fa,description_en,order_id) VALUES (?,?,?,?,?,?,?)', args: [uuid(),uids[ui],pts,'earn','امتیاز خرید','Order Points',oid] });
  orderBatch.push({ sql: 'INSERT OR IGNORE INTO notifications (id,user_id,type,title_fa,title_en,message_fa,message_en,link) VALUES (?,?,?,?,?,?,?,?)', args: [uuid(),uids[ui],'order','سفارش ثبت شد','Order Placed',`سفارش ${oid.slice(0,8)} ثبت شد`,`Order ${oid.slice(0,8)} placed`,'/panel/orders'] });
}
await client.batch(orderBatch, 'write');
console.log('Orders done');

// Reviews
const reviewers = [adminId, ...uids];
const reviews = ['کیفیت عالی','ارزش خرید','خوب بود','راضیم','معمولی','فوق‌العاده','خوش‌پوش','قابل قبول','عالی','نسبتاً خوب','راحت','پیشنهاد','سایز مناسب','شیک','کیفیت مناسب','دوخت تمیز','خوب نه عالی','خرید موفق','پارچه خوب','ممنون'];
const ratings = [5,4,4,5,3,5,5,4,5,3,5,4,4,5,4,5,3,5,4,4];
await client.batch(reviews.map((r, i) => ({
  sql: 'INSERT OR IGNORE INTO reviews (id,user_id,product_id,rating,title,comment) VALUES (?,?,?,?,?,?)',
  args: [uuid(), reviewers[i%reviewers.length], productIds[i%productIds.length], ratings[i], r, r + '.']
})), 'write');
console.log('Reviews done');

// Blog
await client.batch([
  { sql: 'INSERT OR IGNORE INTO blog_posts (id,title_fa,title_en,slug,excerpt_fa,excerpt_en,content_fa,content_en,cover_image,author_id,tags,is_published) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)',
    args: [uuid(),'راهنمای تی‌شرت',"T-Shirt Guide",'guide-tshirt','نکات انتخاب تی‌شرت.','T-shirt tips.','انتخاب تی‌شرت مناسب مهمه.','Choosing the right t-shirt matters.','https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=400&fit=crop&q=80',adminId,'["fashion"]'] },
  { sql: 'INSERT OR IGNORE INTO blog_posts (id,title_fa,title_en,slug,excerpt_fa,excerpt_en,content_fa,content_en,cover_image,author_id,tags,is_published) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)',
    args: [uuid(),'ترندهای تابستان',"Summer Trends",'summer-trends','ترندهای مد.','Fashion trends.','تابستان با ترندهای جذاب.','Summer with exciting trends.','https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=400&fit=crop&q=80',adminId,'["trends"]'] },
  { sql: 'INSERT OR IGNORE INTO blog_posts (id,title_fa,title_en,slug,excerpt_fa,excerpt_en,content_fa,content_en,cover_image,author_id,tags,is_published) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)',
    args: [uuid(),'نگهداری لباس',"Clothing Care",'clothing-care','عمر لباس رو زیاد کنید.','Extend clothes life.','نگهداری صحیح مهمه.','Proper care matters.','https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop&q=80',adminId,'["care"]'] },
], 'write');
console.log('Blog done');

// Banners
await client.batch([
  { sql: 'INSERT OR IGNORE INTO banners (id,badge_fa,badge_en,title_fa,title_en,subtitle_fa,subtitle_en,cta_fa,cta_en,cta_link,gradient,accent_color,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    args: [uuid(),'مجموعه تابستان ۱۴۰۵','Summer 2026','استایل **مردانه** با کیفیت بی‌نظیر',"Men's **Style** Unmatched Quality",'جدیدترین مدل‌ها با بهترین کیفیت',"Latest fashion with best quality",'مشاهده محصولات','View Products','/products','radial-gradient(ellipse 70% 50% at 70% 20%, rgba(201, 168, 76, 0.12), transparent)','gold',0] },
  { sql: 'INSERT OR IGNORE INTO banners (id,badge_fa,badge_en,title_fa,title_en,subtitle_fa,subtitle_en,cta_fa,cta_en,cta_link,gradient,accent_color,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    args: [uuid(),'تخفیف‌های ویژه','Special Offers','تا **۵۰٪** تخفیف محصولات منتخب','Up to **50%** Off Selected','تخفیف‌های ویژه محدود هستند',"Don't miss special discounts",'خرید با تخفیف','Shop Sale','/products?featured=true','radial-gradient(ellipse 60% 50% at 30% 30%, rgba(220, 38, 38, 0.1), transparent)','red',1] },
  { sql: 'INSERT OR IGNORE INTO banners (id,badge_fa,badge_en,title_fa,title_en,subtitle_fa,subtitle_en,cta_fa,cta_en,cta_link,gradient,accent_color,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    args: [uuid(),'کالکشن ورزشی','Sports Collection','پوشاک **ورزشی** حرفه‌ای','Professional **Sports** Wear','مناسب تمرین و زندگی روزمره','Perfect for training and daily life','مشاهده ورزشی','View Sports','/products?category=cat-sport','radial-gradient(ellipse 50% 60% at 60% 40%, rgba(59, 130, 246, 0.1), transparent)','blue',2] },
], 'write');
console.log('Banners done');

console.log('\nSeed complete!');
