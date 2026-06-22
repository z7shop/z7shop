'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/types';

interface AppState {
  locale: Locale;
  theme: 'light' | 'dark';
  cartCount: number;
  cartOpen: boolean;
  quickView: string | null;
  recentlyViewed: string[];
  compareIds: string[];
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
  setCartCount: (count: number) => void;
  setCartOpen: (open: boolean) => void;
  setQuickView: (id: string | null) => void;
  addRecentlyViewed: (id: string) => void;
  addCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'fa',
      theme: 'dark',
      cartCount: 0,
      cartOpen: false,
      quickView: null,
      recentlyViewed: [],
      compareIds: [],
      setLocale: (locale) => set({ locale }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setCartCount: (count) => set({ cartCount: count }),
      setCartOpen: (open) => set({ cartOpen: open }),
      setQuickView: (id) => set({ quickView: id }),
      addRecentlyViewed: (id) =>
        set((s) => ({
          recentlyViewed: [id, ...s.recentlyViewed.filter((v) => v !== id)].slice(0, 10),
        })),
      addCompare: (id) =>
        set((s) => {
          if (s.compareIds.includes(id) || s.compareIds.length >= 4) return s;
          return { compareIds: [...s.compareIds, id] };
        }),
      removeCompare: (id) =>
        set((s) => ({ compareIds: s.compareIds.filter((c) => c !== id) })),
      clearCompare: () => set({ compareIds: [] }),
    }),
    { name: 'z7shop-store' }
  )
);
