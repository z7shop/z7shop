'use client';
import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const raf = useRef<number>(0);
  const target = useRef({ x: -100, y: -100 });
  const current = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;
    setIsMobile(false);

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const checkHover = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const isInteractive = el.closest('a, button, input, textarea, select, [role="button"], label');
      setHovering(!!isInteractive);
    };

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.15;
      current.current.y += (target.current.y - current.current.y) * 0.15;
      setPos({ x: current.current.x, y: current.current.y });
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousemove', checkHover);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousemove', checkHover);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, [visible]);

  if (isMobile) return null;

  return (
    <>
      {/* Outer ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference"
        style={{
          transform: `translate(${pos.x - (hovering ? 20 : 16)}px, ${pos.y - (hovering ? 20 : 16)}px)`,
          width: hovering ? 40 : 32,
          height: hovering ? 40 : 32,
          opacity: visible ? 1 : 0,
          transition: 'width 0.3s, height 0.3s, opacity 0.3s',
        }}
      >
        <div
          className="w-full h-full rounded-full border border-gold/50"
          style={{
            transition: 'transform 0.3s',
            transform: hovering ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      </div>
      {/* Inner dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          transform: `translate(${pos.x - 3}px, ${pos.y - 3}px)`,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        <div className={`w-1.5 h-1.5 rounded-full bg-gold transition-transform duration-300 ${hovering ? 'scale-0' : 'scale-100'}`} />
      </div>
    </>
  );
}
