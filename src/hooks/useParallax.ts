'use client';
import { useEffect } from 'react';

export function useParallax() {
  useEffect(() => {
    const layers = document.querySelectorAll('.parallax-layer');
    if (!layers.length) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        layers.forEach((layer) => {
          const el = layer as HTMLElement;
          const speed = parseFloat(el.dataset.speed || '0.3');
          const rect = el.parentElement?.getBoundingClientRect();
          if (rect && rect.bottom > 0 && rect.top < window.innerHeight) {
            const offset = (scrollY - (el.parentElement?.offsetTop || 0)) * speed;
            el.style.transform = `translateY(${offset}px)`;
          }
        });
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
