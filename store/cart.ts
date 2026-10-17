"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantLabel: string | null;
  image: string | null;
  swatch: string;
  world: "AIPAN" | "CROCHET";
  price: number;
  quantity: number;
  maxQty: number;
  customization: string | null;
};

type CartState = {
  lines: CartLine[];
  open: boolean;
  pulse: number; // bumps on every add, the header bag reacts to it
  add: (line: Omit<CartLine, "key" | "quantity"> & { quantity?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const lineKey = (productId: string, variantId: string | null, customization: string | null) =>
  [productId, variantId ?? "-", (customization ?? "").trim().toLowerCase()].join("|");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      pulse: 0,
      add: ({ quantity = 1, ...line }) =>
        set((s) => {
          const key = lineKey(line.productId, line.variantId, line.customization);
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) =>
                l.key === key ? { ...l, quantity: Math.min(l.maxQty, l.quantity + quantity) } : l,
              )
            : [...s.lines, { ...line, key, quantity: Math.min(line.maxQty, quantity) }];
          return { lines, pulse: s.pulse + 1 };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.key === key ? { ...l, quantity: Math.max(0, Math.min(l.maxQty, qty)) } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "aipan-bag",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0);
