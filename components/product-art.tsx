import Image from "next/image";
import { StaticMandala } from "./motifs";
import { cn } from "@/lib/utils";

/**
 * Shows the product photo, or — until the owner uploads one — a hand-drawn
 * stand-in in the product's own colour: a mandala on geru for Aipan,
 * a ribbed swatch for crochet.
 */
export function ProductArt({
  src,
  alt,
  world,
  swatch,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
  seed = 0,
}: {
  src?: string | null;
  alt: string;
  world: "AIPAN" | "CROCHET";
  swatch: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  seed?: number;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-biswar-200", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={/^https?:\/\//.test(src) && !src.includes("res.cloudinary.com")}
          className="object-cover"
        />
      </div>
    );
  }
  if (world === "AIPAN") {
    return (
      <div
        className={cn("grain relative flex items-center justify-center overflow-hidden", className)}
        style={{ backgroundColor: swatch }}
        role="img"
        aria-label={alt}
      >
        <StaticMandala className="w-[78%] text-biswar/90" variant={seed} />
      </div>
    );
  }
  return (
    <div
      className={cn("rib relative flex items-end overflow-hidden", className)}
      style={{ ["--swatch" as string]: swatch }}
      role="img"
      aria-label={alt}
    >
      <svg viewBox="0 0 100 100" className="absolute -bottom-6 -right-6 w-1/2 opacity-90" aria-hidden>
        <circle cx="50" cy="50" r="38" fill={swatch} stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
        {[-24, -12, 0, 12, 24].map((o) => (
          <path key={o} d={`M${20 + o * 0.3} ${30 + o} Q 50 ${50 + o * 0.6} ${80 - o * 0.2} ${28 + o}`} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="2" />
        ))}
      </svg>
    </div>
  );
}
