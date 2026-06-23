const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL = 5 * 60_000;

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) rateLimitMap.delete(key);
  });
}

export function rateLimit(ip: string, maxAttempts: number = 5): { allowed: boolean; remaining: number } {
  cleanup();
  const now = Date.now();
  const key = ip;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxAttempts - entry.count };
}

export function getRateLimitResponse() {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  );
}
