import { dbAll, dbRun } from './db';

let webpushModule: any = null;
let vapidConfigured = false;

async function getWebPush() {
  if (!webpushModule) {
    try {
      webpushModule = await import('web-push');
      const pub = process.env.VAPID_PUBLIC_KEY || '';
      const priv = process.env.VAPID_PRIVATE_KEY || '';
      const email = process.env.VAPID_EMAIL || 'mailto:z7shop.ir@gmail.com';
      if (pub && priv && !vapidConfigured) {
        webpushModule.setVapidDetails(email, pub, priv);
        vapidConfigured = true;
      }
    } catch {
      return null;
    }
  }
  return webpushModule;
}

export async function sendPushToUser(userId: string, title: string, body: string, url?: string) {
  const wp = await getWebPush();
  if (!wp) return;

  const subs = await dbAll('SELECT * FROM push_subscriptions WHERE user_id = ?', userId);

  for (const sub of subs) {
    try {
      await wp.sendNotification(
        { endpoint: (sub as any).endpoint, keys: { p256dh: (sub as any).p256dh, auth: (sub as any).auth } },
        JSON.stringify({ title, body, url: url || '/' })
      );
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await dbRun('DELETE FROM push_subscriptions WHERE id = ?', (sub as any).id);
      }
    }
  }
}
