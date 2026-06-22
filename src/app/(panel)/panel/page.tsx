'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PanelPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/panel/orders'); }, [router]);
  return null;
}
