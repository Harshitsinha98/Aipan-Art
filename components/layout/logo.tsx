import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: the bindu + shiv-shakti star sits where the dot of the "i" would be. */
export function Logo({ className, tone = "ink" }: { className?: string; tone?: "ink" | "paper" }) {
  return (
    <Link href="/" aria-label="Aipan Art — home" className={cn("group inline-flex items-baseline gap-1.5", className)}>
      <span className={cn("font-display text-[26px] leading-none tracking-[-0.02em]", tone === "paper" ? "text-biswar" : "text-kajal")}>
        A
        <span className="relative">
          ı
          <svg viewBox="-12 -12 24 24" className="absolute -top-[9px] left-1/2 h-[11px] w-[11px] -translate-x-1/2 text-geru-600 transition-transform duration-700 group-hover:rotate-[180deg]" aria-hidden>
            <path d="M0 -9 L7.8 4.5 L-7.8 4.5 Z M0 9 L-7.8 -4.5 L7.8 -4.5 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <circle r="2" fill="currentColor" />
          </svg>
        </span>
        pan
      </span>
      <span className={cn("font-deva text-[13px] leading-none", tone === "paper" ? "text-biswar/70" : "text-geru-600")}>ऐपण</span>
    </Link>
  );
}
