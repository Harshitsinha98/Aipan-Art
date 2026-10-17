"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { X, ArrowRight, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCart, cartSubtotal, cartCount } from "@/store/cart";
import { computeTotals } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";
import { site } from "@/lib/site";
import { ProductArt } from "../product-art";
import { Pagla } from "../motifs";
import { QtyStepper } from "../ui";

export function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname, setOpen]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  if (!mounted) return null;
  const subtotal = cartSubtotal(lines);
  const totals = computeTotals(subtotal);
  const progress = Math.min(1, subtotal / site.freeShippingAt);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-kajal/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Your bag"
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[440px] flex-col bg-biswar shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <h2 className="font-display text-3xl">
                Your bag <span className="align-top text-base text-kajal-300">{cartCount(lines)}</span>
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-kajal/5" aria-label="Close bag">
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length > 0 && (
              <div className="mx-6 rounded-2xl bg-white/60 p-4">
                <p className="text-[13px]">
                  {totals.toFreeShipping > 0 ? (
                    <>
                      <b>{formatINR(totals.toFreeShipping)}</b> away from free shipping
                    </>
                  ) : (
                    <>
                      <b>Free shipping</b> unlocked — it&apos;s on us.
                    </>
                  )}
                </p>
                {/* A strand of yarn that winds itself as the bag fills */}
                <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-kajal/10">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background:
                        "repeating-linear-gradient(115deg,#E6A92C 0 6px,#d39520 6px 9px)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex gap-3 text-geru-600/70">
                    <Pagla className="h-12 -rotate-6" flip />
                    <Pagla className="mt-6 h-12 rotate-6" />
                  </div>
                  <p className="mt-6 font-display text-2xl">Nothing here yet.</p>
                  <p className="mt-2 max-w-[260px] text-sm text-kajal-400">
                    In Kumaon, Lakshmi&apos;s footprints are drawn leading into the home. Let&apos;s bring something in.
                  </p>
                  <div className="mt-6 flex gap-2">
                    <Link href="/shop/aipan" className="rounded-full bg-geru-600 px-5 py-2.5 text-sm font-semibold text-biswar">Likhai</Link>
                    <Link href="/shop/crochet" className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-biswar">Hook</Link>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-kajal/10">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.key}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0 }}
                        className="flex gap-4 py-4"
                      >
                        <Link href={`/p/${l.slug}`} className="shrink-0">
                          <ProductArt src={l.image} alt={l.name} world={l.world} swatch={l.swatch} className="h-24 w-20 rounded-xl" sizes="80px" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link href={`/p/${l.slug}`} className="block truncate font-medium">{l.name}</Link>
                              {l.variantLabel && <p className="text-[13px] text-kajal-400">{l.variantLabel}</p>}
                              {l.customization && <p className="text-[12px] text-geru-600">“{l.customization}”</p>}
                            </div>
                            <p className="font-semibold tabular-nums">{formatINR(l.price * l.quantity)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QtyStepper size="sm" value={l.quantity} max={l.maxQty} onChange={(n) => setQty(l.key, n)} />
                            <button onClick={() => remove(l.key)} className="p-2 text-kajal-300 hover:text-geru-600" aria-label={`Remove ${l.name}`}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-kajal/10 bg-white/50 px-6 pb-6 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-kajal-400">Subtotal</span>
                  <span className="tabular-nums">{formatINR(subtotal)}</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-kajal-400">Shipping</span>
                  <span className="tabular-nums">{totals.shippingFee ? formatINR(totals.shippingFee) : "Free"}</span>
                </div>
                <button
                  onClick={() => router.push("/checkout")}
                  className="group mt-4 flex w-full items-center justify-between rounded-full bg-geru-600 py-4 pl-6 pr-2 text-biswar transition hover:bg-geru-700"
                >
                  <span className="font-semibold">Checkout</span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold tabular-nums">{formatINR(totals.total)}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-biswar text-geru-600 transition group-hover:translate-x-0.5">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </span>
                </button>
                <p className="mt-3 text-center text-[12px] text-kajal-400">No account needed · Prices include GST</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
