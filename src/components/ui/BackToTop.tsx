'use client';
import { useEffect, useState } from 'react';
import { HiOutlineChevronUp } from 'react-icons/hi';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 end-6 z-40 w-12 h-12 bg-gold text-white rounded-full shadow-lg shadow-gold/30 flex items-center justify-center hover:scale-110 transition-all duration-300 animate-fade-in"
    >
      <HiOutlineChevronUp className="w-5 h-5" />
    </button>
  );
}
