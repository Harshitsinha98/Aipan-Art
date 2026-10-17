"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ProductArt } from "../product-art";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  world,
  swatch,
}: {
  images: string[];
  name: string;
  world: "AIPAN" | "CROCHET";
  swatch: string;
}) {
  const shots = images.length ? images : [null];
  const [i, setI] = useState(0);

  return (
    <div>
      {/* Mobile / tablet: swipeable stage */}
      <div className="lg:hidden">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[26px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              drag={shots.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) setI((v) => (v + 1) % shots.length);
                if (info.offset.x > 60) setI((v) => (v - 1 + shots.length) % shots.length);
              }}
            >
              <ProductArt src={shots[i]} alt={name} world={world} swatch={swatch} className="h-full w-full" sizes="100vw" priority />
            </motion.div>
          </AnimatePresence>
        </div>
        {shots.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {shots.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                aria-label={`Photo ${k + 1}`}
                className={cn("h-1.5 rounded-full transition-all", k === i ? "w-6 bg-kajal" : "w-1.5 bg-kajal/25")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: editorial stack, first image full, the rest in pairs */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-2">
        {shots.map((src, k) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: k * 0.05 }}
            className={cn("overflow-hidden rounded-[26px]", k === 0 ? "col-span-2 aspect-[5/5.4]" : "aspect-[4/5]")}
          >
            <ProductArt src={src} alt={`${name} — photo ${k + 1}`} world={world} swatch={swatch} className="h-full w-full" sizes="(min-width:1024px) 55vw, 100vw" priority={k === 0} seed={k} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
