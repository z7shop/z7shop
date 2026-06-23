'use client';
import { useState, useCallback } from 'react';
import { formatPrice } from '@/i18n';
import type { Locale } from '@/types';

interface Props {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  locale: Locale;
}

export default function PriceRangeSlider({ min, max, value, onChange, locale }: Props) {
  const [localMin, setLocalMin] = useState(value[0]);
  const [localMax, setLocalMax] = useState(value[1]);

  const getPercent = useCallback((v: number) => ((v - min) / (max - min)) * 100, [min, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), localMax - 10000);
    setLocalMin(v);
    onChange([v, localMax]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), localMin + 10000);
    setLocalMax(v);
    onChange([localMin, v]);
  };

  const left = getPercent(localMin);
  const right = 100 - getPercent(localMax);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{formatPrice(localMin, locale)} {locale === 'fa' ? 'تومان' : 'T'}</span>
        <span>{formatPrice(localMax, locale)} {locale === 'fa' ? 'تومان' : 'T'}</span>
      </div>

      <div className="relative h-6">
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 h-1.5 w-full rounded-full bg-gray-700" />
        {/* Active track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-gold to-gold-light"
          style={{ left: `${left}%`, right: `${right}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={10000}
          value={localMin}
          onChange={handleMinChange}
          className="range-thumb absolute w-full top-1/2 -translate-y-1/2 pointer-events-none appearance-none bg-transparent z-10"
          style={{ zIndex: localMin > max - 100000 ? 20 : 10 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={10000}
          value={localMax}
          onChange={handleMaxChange}
          className="range-thumb absolute w-full top-1/2 -translate-y-1/2 pointer-events-none appearance-none bg-transparent z-10"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-600">
        <span>{formatPrice(min, locale)}</span>
        <span>{formatPrice(max, locale)}</span>
      </div>

      <style jsx>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #C9A84C;
          border: 3px solid #0a0a0d;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(201, 168, 76, 0.4);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .range-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 12px rgba(201, 168, 76, 0.6);
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: all;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #C9A84C;
          border: 3px solid #0a0a0d;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(201, 168, 76, 0.4);
        }
      `}</style>
    </div>
  );
}
