"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ChowkiMandala, DotRule, Pagla, Vasudhara, YarnThread } from "../motifs";
import { Reveal, RiseText } from "../ui";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function WordMarquee() {
  const words = ["ऐपण", "geru", "biswar", "bel", "vasudhara", "क्रोशिया", "rib stitch", "granny square", "pom-pom", "चौकी", "likhai", "hook"];
  return (
    <div className="relative overflow-hidden py-10" aria-hidden>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {[...words, ...words].map((w, i) => (
          <span key={i} className={cn("flex items-center gap-10 text-5xl sm:text-7xl", /[\u0900-\u097F]/.test(w) ? "font-deva text-geru-600" : "font-display")}>
            {w}
            <svg viewBox="-12 -12 24 24" className="h-6 w-6 text-haldi">
              <path d="M0 -9 L7.8 4.5 L-7.8 4.5 Z M0 9 L-7.8 -4.5 L7.8 -4.5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle r="2" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Two doors. Hover one and it opens wider. */
export function TwoWorlds({ counts }: { counts: { AIPAN: number; CROCHET: number } }) {
  const [hover, setHover] = useState<"a" | "c" | null>(null);
  return (
    <section className="mx-auto max-w-[1500px] px-3 sm:px-6">
      <div className="mb-8 flex items-end justify-between px-2">
        <h2 className="font-display text-huge">
          <RiseText text="Two crafts," />
          <br />
          <span className="text-kajal-300">
            <RiseText text="one kitchen table." delay={0.15} />
          </span>
        </h2>
      </div>
      <div className="flex h-[560px] flex-col gap-3 md:h-[620px] md:flex-row" onMouseLeave={() => setHover(null)}>
        <motion.div
          onMouseEnter={() => setHover("a")}
          animate={{ flexGrow: hover === "a" ? 1.6 : hover === "c" ? 0.75 : 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="relative flex-1 basis-0 overflow-hidden rounded-[32px]"
        >
          <Link href="/shop/aipan" className="grain flex h-full flex-col justify-between bg-geru-600 p-8 text-biswar">
            <div className="flex items-start justify-between">
              <span className="eyebrow text-biswar/70">{counts.AIPAN} pieces</span>
              <span className="font-deva text-2xl text-haldi">ऐपण</span>
            </div>
            <ChowkiMandala rings={3} className="absolute left-1/2 top-1/2 w-[340px] -translate-x-1/2 -translate-y-1/2 text-biswar/80" />
            <div className="relative z-[2]">
              <p className="font-display text-6xl sm:text-7xl">Likhai</p>
              <p className="mt-3 max-w-sm text-biswar/80">
                Rice-paste lines on geru, drawn freehand on thalis, chowkis, diyas and frames — for pujas, weddings and walls.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                Enter <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </motion.div>
        <motion.div
          onMouseEnter={() => setHover("c")}
          animate={{ flexGrow: hover === "c" ? 1.6 : hover === "a" ? 0.75 : 1 }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="relative flex-1 basis-0 overflow-hidden rounded-[32px]"
        >
          <Link href="/shop/crochet" className="rib flex h-full flex-col justify-between p-8 text-biswar" style={{ ["--swatch" as string]: "#1E3A2C" }}>
            <div className="flex items-start justify-between">
              <span className="eyebrow text-biswar/70">{counts.CROCHET} pieces</span>
              <span className="font-deva text-2xl text-haldi">क्रोशिया</span>
            </div>
            <YarnBall />
            <div className="relative z-[2]">
              <p className="font-display text-6xl sm:text-7xl">Hook</p>
              <p className="mt-3 max-w-sm text-biswar/80">
                Rib-stitch beanies, long scarves, granny-square totes and tiny charms — hooked through the cold months.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                Enter <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function YarnBall() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="absolute left-1/2 top-[44%] w-[240px] -translate-x-1/2 -translate-y-1/2"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      aria-hidden
    >
      <circle cx="100" cy="100" r="80" fill="#E6A92C" />
      {[0, 30, 60, 90, 120, 150].map((r) => (
        <ellipse key={r} cx="100" cy="100" rx="78" ry="30" fill="none" stroke="#B9831B" strokeWidth="3" transform={`rotate(${r} 100 100)`} />
      ))}
      <path d="M170 140 C 200 170, 220 150, 240 190" stroke="#E6A92C" strokeWidth="4" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}

const steps = [
  { n: "01", t: "Geru", d: "Red-ochre clay is mixed with water and washed over the surface. It dries to a soft, matte brick-red — the floor everything is drawn on.", c: "bg-geru-600 text-biswar" },
  { n: "02", t: "Biswar", d: "Rice is soaked overnight, ground on a stone and thinned into a milky paste. That paste is the only white you will see.", c: "bg-biswar-200 text-kajal" },
  { n: "03", t: "Likhai", d: "The lines are drawn with the last three fingers of the right hand — no brush, no stencil. It begins with a single dot, the bindu.", c: "bg-kajal text-biswar" },
  { n: "04", t: "Hook", d: "In winter, when the paste won't dry, the wool comes out. Rib stitch, half-double, granny squares — counted under the breath.", c: "bg-pine text-biswar" },
  { n: "05", t: "Packed", d: "Wrapped in old newspaper and cotton, tied with leftover yarn, and posted from the hill. A handwritten note goes in every parcel.", c: "bg-haldi text-kajal" },
];

/** Pinned horizontal scroller — the craft, step by step. */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);

  return (
    <section ref={ref} className="relative mt-24 h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-[1400px] items-end justify-between px-6 sm:px-8">
          <div>
            <p className="eyebrow text-geru-600">How it&apos;s made</p>
            <h2 className="mt-3 font-display text-huge">Slow, on purpose.</h2>
          </div>
          <Vasudhara className="hidden h-28 text-geru-600 md:block" lines={6} height={100} />
        </div>
        <motion.div style={{ x: reduce ? 0 : x }} className="flex gap-5 pl-6 sm:pl-8">
          {steps.map((s, i) => (
            <article key={s.n} className={cn("grain relative flex h-[440px] w-[78vw] shrink-0 flex-col justify-between overflow-hidden rounded-[28px] p-8 sm:w-[440px]", s.c)}>
              <div className="relative z-[2] flex items-center justify-between">
                <span className="font-display text-xl opacity-60">{s.n}</span>
                {i === 2 && <Pagla className="h-8 text-geru-500" />}
              </div>
              <div className="relative z-[2]">
                <h3 className="font-display text-6xl">{s.t}</h3>
                <p className="mt-4 text-[16px] leading-relaxed opacity-80">{s.d}</p>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** A note, not a "brand story". */
export function MakerLetter() {
  return (
    <section className="relative mx-auto mt-28 max-w-[1400px] px-6 sm:px-8">
      <YarnThread className="absolute -top-20 left-0 right-0 h-40" />
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="relative">
          <div className="relative mx-auto aspect-[4/5] max-w-[440px] rotate-[-2.5deg] rounded-[6px] bg-white p-3 pb-14 shadow-[0_40px_80px_-30px_rgba(28,25,22,.35)]">
            <div className="rib h-full w-full rounded-[3px]" style={{ ["--swatch" as string]: "#3F5E80" }} />
            <p className="absolute bottom-4 left-0 right-0 text-center font-display text-lg text-kajal-400">winter, Almora</p>
          </div>
          <div className="absolute -bottom-6 -right-2 rotate-[8deg] rounded-full bg-haldi px-5 py-3 font-display text-lg shadow-lg sm:right-10">
            hooked by hand ✦
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="eyebrow text-geru-600">A note from the maker</p>
          <div className="mt-6 space-y-5 font-display text-[26px] leading-[1.35] sm:text-[32px]">
            <p>{site.makerNote[0]}</p>
            <p className="text-kajal-400">{site.makerNote[1]}</p>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex gap-1.5 text-geru-600">
              <Pagla className="h-7 -rotate-12" flip />
              <Pagla className="mt-3 h-7 rotate-6" />
            </div>
            <a href={site.instagram} target="_blank" rel="noreferrer" className="link-underline font-semibold">
              Follow the making on {site.instagramHandle}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Promises() {
  const items = [
    ["One pair of hands", "No workshop, no outsourcing. If it's in the shop, it was made at this table."],
    ["Small batches", "Most pieces exist once or twice. When it's gone, the next one will be a little different."],
    ["Your colour, on request", "Want the beanie in mustard and cream? Pick ‘made to order’ and tell us in the note."],
    ["Plastic-free parcel", "Cotton, paper and string. Ships in 2–4 days, or after making for custom pieces."],
  ];
  return (
    <section className="mx-auto mt-28 max-w-[1400px] px-6 sm:px-8">
      <DotRule className="text-kajal/25" id="promise-rule" />
      <div className="grid gap-x-10 gap-y-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.06}>
            <p className="font-display text-[44px] leading-none text-geru-600">{String(i + 1).padStart(2, "0")}</p>
            <p className="mt-4 text-lg font-semibold">{t}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-kajal-400">{d}</p>
          </Reveal>
        ))}
      </div>
      <DotRule className="text-kajal/25" id="promise-rule-2" />
    </section>
  );
}
