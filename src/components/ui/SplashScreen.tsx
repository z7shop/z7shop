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
      const t1 = setTimeout(() => setFadeOut(true), 2800);
      const t2 = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = '';
        sessionStorage.setItem('z7-splash', '1');
      }, 3400);
      return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ''; };
    }
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
      style={{ transitionProperty: 'opacity, transform' }}>

      {/* Background */}
      <div className="absolute inset-0 bg-[#060608]" />
      <div className="absolute inset-0 splash-bg-shift" />

      {/* Ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] splash-ambient" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Diamond frame */}
        <div className="absolute w-36 h-36 md:w-44 md:h-44 splash-diamond">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <rect x="30" y="30" width="140" height="140" rx="8"
              fill="none" stroke="url(#goldGrad)" strokeWidth="1"
              transform="rotate(45 100 100)"
              className="splash-diamond-path" />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#E8D5A3" stopOpacity="1" />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Corner accents */}
        <div className="absolute -top-6 -left-6 w-4 h-4 splash-corner splash-corner-1">
          <div className="w-full h-[1px] bg-gradient-to-r from-gold to-transparent" />
          <div className="h-full w-[1px] bg-gradient-to-b from-gold to-transparent" />
        </div>
        <div className="absolute -top-6 -right-6 w-4 h-4 splash-corner splash-corner-2">
          <div className="w-full h-[1px] bg-gradient-to-l from-gold to-transparent" />
          <div className="h-full w-[1px] bg-gradient-to-b from-gold to-transparent ml-auto" />
        </div>
        <div className="absolute -bottom-6 -left-6 w-4 h-4 splash-corner splash-corner-3">
          <div className="h-full w-[1px] bg-gradient-to-t from-gold to-transparent" />
          <div className="w-full h-[1px] bg-gradient-to-r from-gold to-transparent mt-auto" />
        </div>
        <div className="absolute -bottom-6 -right-6 w-4 h-4 splash-corner splash-corner-4">
          <div className="h-full w-[1px] bg-gradient-to-t from-gold to-transparent ml-auto" />
          <div className="w-full h-[1px] bg-gradient-to-l from-gold to-transparent mt-auto" />
        </div>

        {/* Z7 Logo */}
        <div className="splash-logo-reveal">
          <span className="text-7xl md:text-8xl font-black tracking-tighter splash-text-shimmer">
            Z7
          </span>
        </div>

        {/* Divider line */}
        <div className="splash-divider mt-4 mb-3" />

        {/* SHOP text */}
        <div className="splash-subtitle">
          <span className="text-[11px] md:text-xs tracking-[0.5em] uppercase font-light text-gold/70">
            premium store
          </span>
        </div>

        {/* Loading bar */}
        <div className="mt-10 w-32 h-[2px] bg-white/5 rounded-full overflow-hidden splash-loader-wrap">
          <div className="h-full bg-gradient-to-r from-gold/0 via-gold to-gold/0 rounded-full splash-loader" />
        </div>
      </div>

      <style jsx>{`
        @keyframes bgShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes ambient {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          50% { opacity: 1; }
          100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes logoReveal {
          0% { opacity: 0; transform: translateY(20px) scale(0.9); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes dividerGrow {
          0% { width: 0; opacity: 0; }
          100% { width: 60px; opacity: 1; }
        }
        @keyframes subtitleIn {
          0% { opacity: 0; letter-spacing: 1em; }
          100% { opacity: 1; letter-spacing: 0.5em; }
        }
        @keyframes diamondDraw {
          0% { stroke-dashoffset: 800; opacity: 0; }
          20% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes diamondRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(90deg); }
        }
        @keyframes cornerIn {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes loaderSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes loaderWrapIn {
          0% { opacity: 0; width: 0; }
          100% { opacity: 1; width: 128px; }
        }
        .splash-bg-shift {
          background: radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.03) 0%, transparent 60%),
                      radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.02) 0%, transparent 60%);
          animation: bgShift 4s ease-in-out infinite;
          background-size: 200% 200%;
        }
        .splash-ambient {
          background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
          animation: ambient 2s ease-out 0.3s forwards;
          opacity: 0;
        }
        .splash-logo-reveal {
          animation: logoReveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
          opacity: 0;
        }
        .splash-text-shimmer {
          background: linear-gradient(
            120deg,
            #C9A84C 0%, #E8D5A3 25%, #C9A84C 50%, #E8D5A3 75%, #C9A84C 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear 1.2s infinite;
        }
        .splash-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #C9A84C, transparent);
          animation: dividerGrow 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.9s forwards;
          width: 0;
          opacity: 0;
        }
        .splash-subtitle {
          animation: subtitleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards;
          opacity: 0;
        }
        .splash-diamond {
          animation: diamondRotate 20s linear infinite;
        }
        .splash-diamond-path {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: diamondDraw 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }
        .splash-corner { opacity: 0; }
        .splash-corner-1 { animation: cornerIn 0.4s ease-out 0.6s forwards; }
        .splash-corner-2 { animation: cornerIn 0.4s ease-out 0.7s forwards; }
        .splash-corner-3 { animation: cornerIn 0.4s ease-out 0.8s forwards; }
        .splash-corner-4 { animation: cornerIn 0.4s ease-out 0.9s forwards; }
        .splash-loader-wrap {
          animation: loaderWrapIn 0.6s ease-out 1.5s forwards;
          width: 0;
          opacity: 0;
        }
        .splash-loader {
          animation: loaderSlide 1.2s ease-in-out 1.8s infinite;
        }
      `}</style>
    </div>
  );
}
