export function sanitize(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
