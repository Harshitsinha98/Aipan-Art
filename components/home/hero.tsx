"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { CardProduct } from "@/lib/catalog";
import { ChowkiMandala } from "../motifs";
import { ProductArt } from "../product-art";
import { formatINR } from "@/lib/utils";

export function Hero({ picks }: { picks: CardProduct[] }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const rotMandala = useTransform(sx, [-1, 1], [-6, 6]);
  const p1x = useTransform(sx, [-1, 1], [-18, 18]);
  const p1y = useTransform(sy, [-1, 1], [-12, 12]);
  const p2x = useTransform(sx, [-1, 1], [14, -14]);
  const p2y = useTransform(sy, [-1, 1], [10, -10]);

  const a = picks.find((p) => p.world === "CROCHET") ?? picks[0];
  const b = picks.find((p) => p.world === "AIPAN" && p.id !== a?.id) ?? picks[1];

  return (
    <section
      className="relative px-3 sm:px-6"
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        mx.set((e.clientX / window.innerWidth) * 2 - 1);
        my.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
    >
      <div className="grain relative mx-auto min-h-[calc(100svh-110px)] max-w-[1500px] overflow-hidden rounded-[28px] bg-geru-600 text-biswar sm:rounded-[40px]">
        {/* the chowki being drawn */}
        <motion.div style={{ rotate: rotMandala, y: "-50%" }} className="absolute -right-[30%] top-[62%] w-[110vw] max-w-[900px] opacity-40 sm:-right-[12%] sm:opacity-70 lg:right-[-4%] lg:top-[46%] lg:w-[56vw] lg:opacity-90">
          <ChowkiMandala className="w-full text-biswar/85" delay={0.2} />
        </motion.div>

        <div className="relative z-[2] flex min-h-[calc(100svh-110px)] flex-col justify-between p-6 sm:p-10 lg:p-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="eyebrow flex items-center gap-3 text-biswar/75"
          >
            <span className="font-deva text-[15px] normal-case tracking-normal text-haldi">कुमाऊँ</span>
            Almora, Uttarakhand
          </motion.p>

          <div className="max-w-[880px] py-10 lg:py-6">
            <h1 className="font-display text-[clamp(3.1rem,8.4vw,7.6rem)] leading-[0.9] tracking-[-0.035em]">
              {["Rice paste", "on red clay.", "Wool on", "a hook."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.04em]">
                  <motion.span
                    className={i >= 2 ? "block text-haldi" : "block"}
                    initial={{ y: reduce ? 0 : "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.05, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 max-w-[440px] text-[17px] leading-relaxed text-biswar/80"
            >
              Two Kumaoni hand-crafts, made by one pair of hands in the hills. Nothing printed, nothing
              from a factory. Pick a world.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.7 }}
            className="grid gap-3 sm:max-w-[620px] sm:grid-cols-2"
          >
            <WorldLink href="/shop/aipan" title="Likhai" deva="ऐपण" sub="Aipan thalis, chowkis & wall art" tone="paper" />
            <WorldLink href="/shop/crochet" title="Hook" deva="क्रोशिया" sub="Beanies, scarves, totes & charms" tone="haldi" />
          </motion.div>
        </div>

        {/* two pieces pinned to the floor like polaroids */}
        {a && (
          <motion.div style={{ x: p1x, y: p1y }} className="absolute bottom-[14%] right-[30%] z-[3] hidden w-[230px] lg:block">
            <motion.div
              initial={{ opacity: 0, rotate: 0, y: 60 }}
              animate={{ opacity: 1, rotate: -7, y: 0 }}
              transition={{ delay: 1.4, type: "spring", stiffness: 70, damping: 14 }}
            >
              <Polaroid p={a} note="just off the hook" />
            </motion.div>
          </motion.div>
        )}
        {b && (
          <motion.div style={{ x: p2x, y: p2y }} className="absolute right-[7%] top-[16%] z-[3] hidden w-[210px] lg:block">
            <motion.div
              initial={{ opacity: 0, rotate: 0, y: 60 }}
              animate={{ opacity: 1, rotate: 6, y: 0 }}
              transition={{ delay: 1.6, type: "spring", stiffness: 70, damping: 14 }}
            >
              <Polaroid p={b} note="dried in the sun" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function WorldLink({ href, title, deva, sub, tone }: { href: string; title: string; deva: string; sub: string; tone: "paper" | "haldi" }) {
  return (
    <Link
      href={href}
      className={
        "group relative flex items-center justify-between overflow-hidden rounded-2xl px-5 py-4 transition-transform duration-300 hover:-translate-y-0.5 " +
        (tone === "paper" ? "bg-biswar text-kajal" : "bg-haldi text-kajal")
      }
    >
      <span>
        <span className="flex items-baseline gap-2">
          <span className="font-display text-3xl">{title}</span>
          <span className="font-deva text-sm text-geru-600">{deva}</span>
        </span>
        <span className="block text-[13px] text-kajal-600">{sub}</span>
      </span>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-kajal text-biswar transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight className="h-5 w-5" />
      </span>
    </Link>
  );
}

function Polaroid({ p, note }: { p: CardProduct; note: string }) {
  return (
    <Link href={`/p/${p.slug}`} className="block rounded-md bg-biswar-50 p-2.5 pb-3 text-kajal shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)] transition-transform hover:scale-[1.03]">
      <ProductArt src={p.images[0]} alt={p.name} world={p.world} swatch={p.swatch} className="aspect-square w-full rounded-[3px]" sizes="230px" priority />
      <p className="mt-2.5 px-1 text-[13px] font-medium leading-tight">{p.name}</p>
      <p className="flex justify-between px-1 text-[12px] text-kajal-400">
        <span className="italic">{note}</span>
        <span className="tabular-nums">{formatINR(p.price)}</span>
      </p>
    </Link>
  );
}
