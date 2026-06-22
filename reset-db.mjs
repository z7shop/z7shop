import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const envContent = readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

const tables = [
  'push_subscriptions', 'bundle_items', 'bundles', 'stock_alerts', 'banners',
  'loyalty_points', 'chat_messages', 'chat_sessions', 'referrals',
  'verification_codes', 'blog_posts', 'notifications', 'payments',
  'ticket_messages', 'tickets', 'reviews', 'newsletter', 'wishlist',
  'coupons', 'addresses', 'orders', 'cart', 'products', 'categories', 'users'
];

for (const t of tables) {
  try {
    await client.execute(`DROP TABLE IF EXISTS ${t}`);
    console.log(`Dropped ${t}`);
  } catch (e) {
    console.log(`Skip ${t}: ${e.message}`);
  }
}
console.log('Done! All tables dropped.');
