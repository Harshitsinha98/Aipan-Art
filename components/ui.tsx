"use client";

import { motion, useMotionValue, useSpring, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import Link from "next/link";
import { forwardRef, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "geru" | "ink" | "ghost" | "paper" | "pine";

const variants: Record<Variant, string> = {
  geru: "bg-geru-600 text-biswar hover:bg-geru-700",
  ink: "bg-kajal text-biswar hover:bg-kajal-600",
  pine: "bg-pine text-biswar hover:bg-pine-700",
  paper: "bg-biswar text-kajal hover:bg-white",
  ghost: "bg-transparent text-current ring-1 ring-inset ring-current/25 hover:ring-current/60",
};

const base =
  "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-[14px] font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const Button = forwardRef<HTMLButtonElement, HTMLMotionProps<"button"> & { variant?: Variant; children?: ReactNode }>(
  function Button({ variant = "ink", className, children, ...props }, ref) {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(base, variants[variant], className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

export function ButtonLink({
  href,
  variant = "ink",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], "group", className)}>
      {children}
    </Link>
  );
}

/** Pulls gently toward the cursor. Feels like picking up a ball of yarn. */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const reduce = useReducedMotion();
  const M = as === "li" ? motion.li : as === "section" ? motion.section : motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  );
}

/** Headline whose words rise out of a mask, one after another. */
export function RiseText({ text, className, delay = 0, stagger = 0.06 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={cn("inline", className)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: reduce ? 0 : "105%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function QtyStepper({
  value,
  onChange,
  max = 20,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const s = size === "sm" ? "h-8 w-8 text-sm" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-full bg-kajal/[0.06] p-1">
      <button type="button" aria-label="Decrease" className={cn(s, "rounded-full transition hover:bg-white")} onClick={() => onChange(value - 1)}>
        −
      </button>
      <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </motion.span>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        className={cn(s, "rounded-full transition hover:bg-white disabled:opacity-30")}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} />
  );
}
