'use client';
import { useState } from 'react';

interface Props {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 'md', interactive = false, onChange }: Props) {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const gaps = { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1' };
  const cls = sizes[size];

  const displayRating = hovered || rating;

  return (
    <div
      className={`flex items-center ${gaps[size]} ${interactive ? 'cursor-pointer' : ''}`}
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayRating >= star;
        const half = !filled && displayRating >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            className={`relative ${interactive ? 'hover:scale-110 transition-transform' : ''} disabled:cursor-default`}
          >
            {/* Empty star */}
            <svg className={`${cls} text-gray-600/40`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {/* Filled overlay */}
            {(filled || half) && (
              <svg
                className={`${cls} text-gold absolute inset-0`}
                fill="currentColor"
                viewBox="0 0 20 20"
                style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
