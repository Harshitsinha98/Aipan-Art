"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User2, X } from "lucide-react";
import { Logo } from "./logo";
import { useCart, cartCount } from "@/store/cart";
import { site } from "@/lib/site";
import { ChowkiMandala } from "../motifs";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/shop/aipan", label: "Likhai", sub: "Aipan art" },
  { href: "/shop/crochet", label: "Hook", sub: "Crochet" },
  { href: "/story", label: "The craft", sub: "Story" },
  { href: "/track", label: "Track", sub: "Your order" },
];

export function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lines = useCart((s) => s.lines);
  const pulse = useCart((s) => s.pulse);
  const setOpen = useCart((s) => s.setOpen);
  const count = mounted ? cartCount(lines) : 0;

  useEffect(() => setMounted(true), []);
  useEffect(() => setMenu(false), [pathname]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 240 && y > prev && !menu);
  });

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300",
          scrolled ? "bg-biswar/90 shadow-[0_1px_0_rgba(28,25,22,.08)] backdrop-blur-md" : "bg-biswar",
        )}
      >
        <div className="overflow-hidden bg-kajal py-1.5 text-[11px] font-medium tracking-[0.18em] text-biswar/85">
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap uppercase">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-12">
                <span>Free shipping above ₹{site.freeShippingAt}</span>
                <span className="text-haldi">✦</span>
                <span>Every piece drawn or hooked by hand in Almora</span>
                <span className="text-haldi">✦</span>
                <span>UPI · Cards · Netbanking via Razorpay</span>
                <span className="text-haldi">✦</span>
                <span>Made-to-order colours welcome</span>
                <span className="text-haldi">✦</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {nav.map((n) => {
              const active = pathname?.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className="group relative py-2 text-[14px] font-medium">
                  <span className={cn("link-underline", active && "text-geru-600")}>{n.label}</span>
                  <span className="pointer-events-none absolute left-0 top-full whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-kajal-300 opacity-0 transition group-hover:opacity-100">
                    {n.sub}
                  </span>
                </Link>
              );
            })}
          </nav>
          <button className="-ml-2 p-2 lg:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
            <Menu className="h-5 w-5" />
          </button>

          <Logo />

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <Link href="/shop?focus=search" className="rounded-full p-2.5 transition hover:bg-kajal/5" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <Link href="/account" className="hidden rounded-full p-2.5 transition hover:bg-kajal/5 sm:block" aria-label="Account">
              <User2 className="h-[18px] w-[18px]" />
            </Link>
            <motion.button
              key={pulse}
              animate={pulse ? { rotate: [0, -12, 10, -6, 0], scale: [1, 1.15, 1] } : undefined}
              transition={{ duration: 0.6 }}
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-kajal px-3.5 py-2 text-biswar"
              aria-label={`Open bag, ${count} items`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="text-[13px] font-semibold tabular-nums">{count}</span>
            </motion.button>
          </div>
        </div>
      </motion.header>
      <div className="h-[92px]" aria-hidden />

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-geru-600 text-biswar lg:hidden"
            initial={{ clipPath: "circle(0% at 8% 6%)" }}
            animate={{ clipPath: "circle(150% at 8% 6%)" }}
            exit={{ clipPath: "circle(0% at 8% 6%)" }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <Logo tone="paper" />
              <button className="p-2" aria-label="Close menu" onClick={() => setMenu(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <ChowkiMandala className="pointer-events-none absolute -bottom-40 -right-40 w-[560px] text-biswar/15" />
            <nav className="relative mt-10 flex flex-col gap-2 px-6">
              {[...nav, { href: "/account", label: "Account", sub: "Orders & addresses" }].map((n, i) => (
                <motion.div key={n.href} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.06 }}>
                  <Link href={n.href} className="flex items-baseline justify-between border-b border-biswar/15 py-4">
                    <span className="font-display text-5xl">{n.label}</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-biswar/60">{n.sub}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
