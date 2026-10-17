"use client";

/**
 * Hand-built Aipan vocabulary, drawn as SVG strokes so they can be "painted" in
 * with framer-motion's pathLength — the same way biswar is laid with three fingers,
 * one continuous line at a time.
 *
 *  bindu      – the dot everything starts from
 *  shiv-shakti– two interlocked triangles around the bindu
 *  kamal      – lotus petal ring
 *  lehar      – wave ring
 *  bel        – creeper border of dots and dashes
 *  vasudhara  – vertical lines poured from a doorstep
 *  pagle      – Lakshmi's footprints walking into the home
 */

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

const ease = [0.65, 0, 0.35, 1] as const;

function polar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)] as const;
}

function waveRing(r: number, amp: number, waves: number, steps = 360) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 360;
    const rr = r + amp * Math.sin(((t * waves) * Math.PI) / 180);
    const [x, y] = polar(rr, t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return d + "Z";
}

function petal(r1: number, r2: number, w: number) {
  const mid = (r1 + r2) / 2;
  return `M0 ${-r1} Q ${w} ${-mid} 0 ${-r2} Q ${-w} ${-mid} 0 ${-r1} Z`;
}

function triangle(r: number, flip = false) {
  const pts = [0, 120, 240].map((a) => polar(r, a + (flip ? 180 : 0)));
  return `M${pts.map((p) => p.map((n) => n.toFixed(2)).join(" ")).join(" L")} Z`;
}

export function ChowkiMandala({
  className,
  stroke = "currentColor",
  delay = 0,
  play = true,
  rings = 4,
}: {
  className?: string;
  stroke?: string;
  delay?: number;
  play?: boolean;
  rings?: 1 | 2 | 3 | 4;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const go = play && inView;

  const paths = useMemo(() => {
    const p: { d: string; w: number; dur: number; at: number }[] = [];
    p.push({ d: triangle(30), w: 2.2, dur: 0.9, at: 0.15 });
    p.push({ d: triangle(30, true), w: 2.2, dur: 0.9, at: 0.4 });
    p.push({ d: waveRing(42, 0, 1), w: 1.6, dur: 1, at: 0.8 });
    if (rings >= 2) {
      for (let i = 0; i < 8; i++) p.push({ d: petal(44, 74, 14), w: 1.8, dur: 0.6, at: 1.2 + i * 0.07 });
      p.push({ d: waveRing(78, 0, 1), w: 1.4, dur: 1, at: 1.9 });
    }
    if (rings >= 3) {
      p.push({ d: waveRing(92, 4, 24), w: 1.6, dur: 1.4, at: 2.3 });
    }
    if (rings >= 4) {
      for (let i = 0; i < 16; i++) p.push({ d: petal(104, 130, 9), w: 1.4, dur: 0.5, at: 2.9 + i * 0.04 });
      p.push({ d: waveRing(134, 0, 1), w: 1.4, dur: 1.2, at: 3.6 });
    }
    return p;
  }, [rings]);

  const dots = useMemo(() => {
    const out: { x: number; y: number; r: number; at: number }[] = [];
    if (rings >= 2) for (let i = 0; i < 8; i++) {
      const [x, y] = polar(60, i * 45 + 22.5);
      out.push({ x, y, r: 2.4, at: 1.8 + i * 0.03 });
    }
    if (rings >= 3) for (let i = 0; i < 36; i++) {
      const [x, y] = polar(84.5, i * 10);
      out.push({ x, y, r: 1.6, at: 2.2 + i * 0.012 });
    }
    if (rings >= 4) for (let i = 0; i < 48; i++) {
      const [x, y] = polar(142, i * 7.5);
      out.push({ x, y, r: 1.9, at: 3.9 + i * 0.01 });
    }
    return out;
  }, [rings]);

  const size = rings >= 4 ? 150 : rings === 3 ? 100 : rings === 2 ? 82 : 46;

  return (
    <svg ref={ref} viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`} className={cn("overflow-visible", className)} aria-hidden>
      <motion.circle
        r={4}
        fill={stroke}
        initial={{ scale: reduce ? 1 : 0 }}
        animate={go ? { scale: 1 } : undefined}
        transition={{ delay, duration: 0.4, ease: "backOut" }}
      />
      {paths.map((p, i) => (
        <motion.path
          key={i}
          d={p.d}
          fill="none"
          stroke={stroke}
          strokeWidth={p.w}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
          animate={go ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ delay: delay + p.at, duration: p.dur, ease }}
        />
      ))}
      {dots.map((d, i) => (
        <motion.circle
          key={`d${i}`}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={stroke}
          initial={{ scale: reduce ? 1 : 0 }}
          animate={go ? { scale: 1 } : undefined}
          transition={{ delay: delay + d.at, duration: 0.25 }}
        />
      ))}
    </svg>
  );
}

/** Bel — a creeper border. Pure SVG pattern so it tiles to any width. */
export function BelBorder({ className, color = "currentColor", id = "bel" }: { className?: string; color?: string; id?: string }) {
  return (
    <svg className={cn("h-4 w-full", className)} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="28" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 8 Q7 1 14 8 T28 8" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="7" cy="12.5" r="1.4" fill={color} />
          <circle cx="21" cy="3.5" r="1.4" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${id})`} />
    </svg>
  );
}

/** A thin rule of dots and diamonds, the line Aipan borders are closed with. */
export function DotRule({ className, color = "currentColor", id = "dotrule" }: { className?: string; color?: string; id?: string }) {
  return (
    <svg className={cn("h-3 w-full", className)} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="22" height="12" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="6" r="1.5" fill={color} />
          <path d="M14 2 L18 6 L14 10 L10 6 Z" fill="none" stroke={color} strokeWidth="1.1" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill={`url(#${id})`} />
    </svg>
  );
}

/** Vasudhara — parallel lines poured down from a threshold, each ending in a dot. */
export function Vasudhara({
  className,
  color = "currentColor",
  lines = 7,
  height = 180,
}: {
  className?: string;
  color?: string;
  lines?: number;
  height?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduce = useReducedMotion();
  const gap = 14;
  const width = (lines - 1) * gap + 8;
  const lengths = useMemo(
    () => Array.from({ length: lines }, (_, i) => height * (0.62 + 0.38 * Math.abs(Math.sin(i * 1.7 + 0.6)))),
    [lines, height],
  );
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${height + 8}`} className={className} aria-hidden>
      <motion.line
        x1={0}
        x2={width}
        y1={2}
        y2={2}
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={inView ? { pathLength: 1 } : undefined}
        transition={{ duration: 0.6, ease }}
      />
      {lengths.map((len, i) => {
        const x = 4 + i * gap;
        return (
          <g key={i}>
            <motion.line
              x1={x}
              x2={x}
              y1={4}
              y2={len}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={inView ? { pathLength: 1 } : undefined}
              transition={{ delay: 0.4 + i * 0.08, duration: 1.1, ease }}
            />
            <motion.circle
              cx={x}
              cy={len + 4}
              r={2.6}
              fill={color}
              initial={{ scale: reduce ? 1 : 0 }}
              animate={inView ? { scale: 1 } : undefined}
              transition={{ delay: 1.4 + i * 0.08, duration: 0.3 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** One of Lakshmi's footprints (pagle). Mirror with `flip` for the left foot. */
export function Pagla({ className, flip, filled = true }: { className?: string; flip?: boolean; filled?: boolean }) {
  return (
    <svg viewBox="0 0 28 48" className={cn(className, flip && "-scale-x-100")} aria-hidden>
      <path
        d="M14.5 46c-6 0-8.6-5.2-8.4-11.6.2-5.6 1.8-9.4 1.6-14.2C7.5 15.4 9.8 12 14 12c5 0 7.9 3.6 7.6 9.4-.3 5.2-2.2 8.2-1.4 13.2.9 6-.3 11.4-5.7 11.4Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
      />
      {[
        [8, 7.2, 2.6],
        [12.6, 4.4, 2.1],
        [16.8, 3.6, 1.8],
        [20.6, 4.8, 1.6],
        [23.6, 7.4, 1.4],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.1" />
      ))}
    </svg>
  );
}

/** A strand of yarn that hooks itself across the section as you scroll. */
export function YarnThread({ className, color = "#E6A92C" }: { className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 30%"] });
  const length = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div ref={ref} className={cn("pointer-events-none", className)} aria-hidden>
      <svg viewBox="0 0 1200 220" preserveAspectRatio="none" className="h-full w-full">
        <motion.path
          d="M-20 150 C 120 40, 220 40, 300 120 S 420 210, 500 130 C 560 70, 610 70, 640 110 C 670 150, 640 190, 605 170 C 570 150, 600 90, 660 80 S 820 150, 900 110 S 1060 20, 1220 90"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          style={{ pathLength: length }}
        />
      </svg>
    </div>
  );
}

/** Non-animated mandala for dense grids (product placeholders, stamps). */
export function StaticMandala({ className, color = "currentColor", variant = 0 }: { className?: string; color?: string; variant?: number }) {
  const petals = 8 + (variant % 3) * 4;
  return (
    <svg viewBox="-150 -150 300 300" className={className} aria-hidden>
      <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d={triangle(30)} strokeWidth={2.2} />
        <path d={triangle(30, true)} strokeWidth={2.2} />
        <circle r={42} strokeWidth={1.6} />
        {Array.from({ length: petals }, (_, i) => (
          <path key={i} d={petal(44, 74, 12)} transform={`rotate(${(360 / petals) * i})`} strokeWidth={1.8} />
        ))}
        <circle r={78} strokeWidth={1.4} />
        <path d={waveRing(92, 4, 20 + variant * 2)} strokeWidth={1.6} />
        {Array.from({ length: 16 }, (_, i) => (
          <path key={`o${i}`} d={petal(104, 130, 9)} transform={`rotate(${22.5 * i})`} strokeWidth={1.4} />
        ))}
        <circle r={134} strokeWidth={1.4} />
      </g>
      <circle r={4} fill={color} />
      {Array.from({ length: 48 }, (_, i) => {
        const [x, y] = polar(142, i * 7.5);
        return <circle key={`d${i}`} cx={x} cy={y} r={1.9} fill={color} />;
      })}
    </svg>
  );
}
