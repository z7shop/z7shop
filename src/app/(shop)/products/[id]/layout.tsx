import type { Metadata } from 'next';

const BASE = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${BASE}/api/products/${params.id}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Product Not Found' };
    const data = await res.json();
    const p = data.product;
    if (!p) return { title: 'Product Not Found' };

    const name = p.name_fa || p.name_en;
    const desc = p.description_fa || p.description_en;
    const images: string[] = (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })();

    return {
      title: name,
      description: desc,
      openGraph: {
        title: `${name} | Z7shop`,
        description: desc,
        images: images[0] ? [images[0]] : [],
        type: 'website',
      },
    };
  } catch {
    return { title: 'Z7shop' };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
