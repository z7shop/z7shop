'use client';
import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem('z7-splash');
    if (!shown) {
      setShow(true);
      document.body.style.overflow = 'hidden';
      const t1 = setTimeout(() => setFadeOut(true), 2200);
      const t2 = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
        sessionStorage.setItem('z7-splash', '1');
      }, 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ''; };
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#0a0a0d] flex items-center justify-center transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center">
        {/* Outer ring */}
        <div className="absolute w-40 h-40 rounded-full border border-gold/20 splash-ring" />
        <div className="absolute w-52 h-52 rounded-full border border-gold/10 splash-ring-outer" />

        {/* Glow */}
        <div className="absolute w-32 h-32 rounded-full bg-gold/10 blur-3xl splash-glow" />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="splash-logo">
            <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent tracking-tighter">
              Z7
            </span>
          </div>
          <div className="splash-line w-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mt-3" />
          <div className="splash-text mt-3 opacity-0">
            <span className="text-gold/60 text-sm tracking-[0.4em] uppercase font-medium">shop</span>
          </div>
        </div>

        {/* Particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold/60 splash-particle"
            style={{
              '--angle': `${i * 45}deg`,
              '--delay': `${0.8 + i * 0.1}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes splashLogo {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes splashLine {
          0% { width: 0; }
          100% { width: 80px; }
        }
        @keyframes splashText {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashRing {
          0% { transform: scale(0.5) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
        @keyframes splashRingOuter {
          0% { transform: scale(0.3) rotate(0deg); opacity: 0; }
          60% { opacity: 0.6; }
          100% { transform: scale(1) rotate(-120deg); opacity: 0.6; }
        }
        @keyframes splashGlow {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.15; }
        }
        @keyframes splashParticle {
          0% { transform: rotate(var(--angle)) translateX(0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: rotate(var(--angle)) translateX(80px) scale(0); opacity: 0; }
        }
        .splash-logo {
          animation: splashLogo 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .splash-line {
          animation: splashLine 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
        }
        .splash-text {
          animation: splashText 0.5s ease-out 0.8s forwards;
        }
        .splash-ring {
          animation: splashRing 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
          opacity: 0;
        }
        .splash-ring-outer {
          animation: splashRingOuter 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
          opacity: 0;
        }
        .splash-glow {
          animation: splashGlow 1.5s ease-out 0.2s forwards;
          opacity: 0;
        }
        .splash-particle {
          animation: splashParticle 1s ease-out var(--delay) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
