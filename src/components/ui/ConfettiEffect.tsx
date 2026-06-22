'use client';
import { useEffect, useState } from 'react';

interface Props {
  active: boolean;
}

export default function ConfettiEffect({ active }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 3500);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!show) return null;

  const colors = ['#C9A84C', '#D4B96A', '#fff', '#A88B3A', '#f5d78e', '#e8c84a'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotate: Math.random() * 360,
    type: Math.random() > 0.5 ? 'rect' : 'circle',
  }));

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-5%',
            width: p.type === 'rect' ? `${p.size}px` : `${p.size}px`,
            height: p.type === 'rect' ? `${p.size * 0.6}px` : `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.type === 'circle' ? '50%' : '2px',
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        .confetti-piece {
          animation: confettiFall var(--dur, 3s) ease-in forwards;
          opacity: 1;
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
