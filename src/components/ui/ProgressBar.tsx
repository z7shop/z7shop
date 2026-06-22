'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const prevPath = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setLoading(true);
      setWidth(30);

      timerRef.current = setTimeout(() => setWidth(70), 100);
      const t2 = setTimeout(() => setWidth(100), 300);
      const t3 = setTimeout(() => {
        setLoading(false);
        setWidth(0);
      }, 500);

      prevPath.current = pathname;
      return () => {
        clearTimeout(timerRef.current);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [pathname]);

  if (!loading && width === 0) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[100] h-[2.5px]">
      <div
        className="h-full bg-gradient-to-r from-gold via-gold-light to-gold transition-all duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
      <div
        className="absolute top-0 end-0 h-full w-24 opacity-80"
        style={{
          background: 'linear-gradient(to right, transparent, #C9A84C)',
          boxShadow: '0 0 10px #C9A84C, 0 0 5px #C9A84C',
        }}
      />
    </div>
  );
}
