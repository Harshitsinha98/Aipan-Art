"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Truck, Hand, Sparkles } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatINR, cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Button, QtyStepper } from "../ui";
import { Pagla } from "../motifs";

type Variant = { id: string; label: string; colorHex: string | null; price: number | null; stock: number };
export type BuyProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  world: "AIPAN" | "CROCHET";
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  swatch: string;
  stock: number;
  madeToOrder: boolean;
  leadTimeDays: number | null;
  customizable: boolean;
  customizationLabel: string | null;
  description: string;
  makerNote: string | null;
  materials: string | null;
  care: string | null;
  dimensions: string | null;
  rating: number | null;
  reviewCount: number;
  variants: Variant[];
};

export function ProductBuy({ p }: { p: BuyProduct }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const initial = p.variants.find((v) => v.stock > 0) ?? p.variants[0] ?? null;
  const [variant, setVariant] = useState<Variant | null>(initial);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const cta = useRef<HTMLDivElement>(null);

  const stock = variant ? variant.stock : p.stock;
  const price = variant?.price ?? p.price;
  const soldOut = !p.madeToOrder && stock <= 0;
  const maxQty = p.madeToOrder ? 10 : Math.max(1, Math.min(10, stock));
  const needsNote = p.customizable && !note.trim();
  const off = p.compareAtPrice && p.compareAtPrice > price ? p.compareAtPrice - price : 0;

  useEffect(() => {
    const el = cta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function addToBag(goCheckout = false) {
    if (soldOut || needsNote) return;
    add({
      productId: p.id,
      variantId: variant?.id ?? null,
      slug: p.slug,
      name: p.name,
      variantLabel: variant?.label ?? null,
      image: p.image,
      swatch: variant?.colorHex ?? p.swatch,
      world: p.world,
      price,
      maxQty,
      customization: p.customizable ? note.trim() : null,
      quantity: qty,
    });
    if (goCheckout) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    setOpen(true);
  }

  const shipCopy = p.madeToOrder
    ? `Made for you — ships in ${p.leadTimeDays ?? 7}–${(p.leadTimeDays ?? 7) + 3} days`
    : "Ready — ships in 2–4 days";

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <p className="eyebrow text-geru-600">{p.world === "AIPAN" ? "Likhai · Aipan" : "Hook · Crochet"}</p>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-[1] tracking-[-0.02em]">{p.name}</h1>
      {p.tagline && <p className="mt-3 text-lg text-kajal-400">{p.tagline}</p>}

      <div className="mt-6 flex items-baseline gap-3">
        <motion.span key={price} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-3xl font-semibold tabular-nums">
          {formatINR(price)}
        </motion.span>
        {off > 0 && (
          <>
            <span className="text-kajal-300 line-through tabular-nums">{formatINR(p.compareAtPrice!)}</span>
            <span className="rounded-full bg-geru-600 px-2.5 py-0.5 text-[12px] font-semibold text-biswar">Save {formatINR(off)}</span>
          </>
        )}
      </div>
      <p className="mt-1 text-[13px] text-kajal-400">Inclusive of all taxes{p.rating ? ` · ${p.rating.toFixed(1)} from ${p.reviewCount} reviews` : ""}</p>

      {p.variants.length > 0 && (
        <div className="mt-8">
          <p className="label">
            Colour — <span className="normal-case tracking-normal text-kajal">{variant?.label}</span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {p.variants.map((v) => {
              const out = !p.madeToOrder && v.stock <= 0;
              const active = variant?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setVariant(v);
                    setQty(1);
                  }}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[14px] transition",
                    active ? "bg-kajal text-biswar" : "bg-kajal/[0.06] hover:bg-kajal/10",
                    out && "opacity-45",
                  )}
                  aria-pressed={active}
                >
                  <span className="h-7 w-7 rounded-full ring-2 ring-white/60" style={{ background: v.colorHex ?? p.swatch }} />
                  {v.label}
                  {out && <span className="text-[11px]">· sold</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {p.customizable && (
        <div className="mt-6">
          <label className="label" htmlFor="custom">{p.customizationLabel || "Personalise it"}</label>
          <input
            id="custom"
            value={note}
            maxLength={60}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Sharma Niwas / your initials"
            className="field"
          />
        </div>
      )}

      <div ref={cta} className="mt-8 flex flex-wrap items-center gap-3">
        <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(maxQty, n)))} max={maxQty} />
        <Button variant="ink" className="min-w-[180px] flex-1" disabled={soldOut || needsNote} onClick={() => addToBag(false)}>
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span key="ok" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="flex items-center gap-2">
                <Check className="h-4 w-4" /> In your bag
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>
                {soldOut ? "Sold out" : needsNote ? "Add your text above" : "Add to bag"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
        <Button variant="geru" className="w-full" disabled={soldOut || needsNote} onClick={() => addToBag(true)}>
          Buy now · {formatINR(price * qty)}
        </Button>
      </div>
      {!soldOut && !p.madeToOrder && stock <= 3 && (
        <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-geru-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-geru-600" /> Only {stock} left — each one is made by hand
        </p>
      )}

      <ul className="mt-8 grid gap-3 rounded-3xl bg-white/55 p-5 text-[14px]">
        <li className="flex items-center gap-3"><Truck className="h-4 w-4 text-geru-600" /> {shipCopy}. Free above {formatINR(site.freeShippingAt)}.</li>
        <li className="flex items-center gap-3"><Hand className="h-4 w-4 text-geru-600" /> One of a kind — tiny differences are the hand, not a flaw.</li>
        <li className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-geru-600" /> Pay by UPI, card or netbanking. No account needed.</li>
      </ul>

      <div className="mt-8 divide-y divide-kajal/10 border-y border-kajal/10">
        <Fold title="The piece" open>
          <p className="whitespace-pre-line">{p.description}</p>
        </Fold>
        {p.makerNote && (
          <Fold title="From the maker">
            <div className="flex gap-4">
              <Pagla className="h-8 shrink-0 text-geru-600" />
              <p className="whitespace-pre-line font-display text-lg leading-snug">{p.makerNote}</p>
            </div>
          </Fold>
        )}
        {(p.materials || p.dimensions) && (
          <Fold title="Materials & size">
            {p.materials && <p><b>Materials:</b> {p.materials}</p>}
            {p.dimensions && <p className="mt-2"><b>Size:</b> {p.dimensions}</p>}
          </Fold>
        )}
        {p.care && (
          <Fold title="Care">
            <p>{p.care}</p>
          </Fold>
        )}
      </div>

      {/* Sticky mobile buy bar */}
      <AnimatePresence>
        {showBar && !soldOut && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-between gap-3 rounded-full bg-kajal p-2 pl-5 text-biswar shadow-2xl lg:hidden"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] text-biswar/70">{p.name}</p>
              <p className="font-semibold tabular-nums">{formatINR(price)}</p>
            </div>
            <button
              onClick={() => (needsNote ? cta.current?.scrollIntoView({ behavior: "smooth", block: "center" }) : addToBag(false))}
              className="rounded-full bg-geru-600 px-6 py-3 text-[14px] font-semibold"
            >
              Add to bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Fold({ title, children, open: initial = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-4 text-left font-medium" aria-expanded={open}>
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pb-5 text-[15px] leading-relaxed text-kajal-600">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
