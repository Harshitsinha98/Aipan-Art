"use client";

import { motion } from "framer-motion";
import { Pagla } from "../motifs";
import { cn } from "@/lib/utils";

const flow = [
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "CRAFTING", label: "Being made" },
  { key: "SHIPPED", label: "On its way" },
  { key: "DELIVERED", label: "Home" },
];

/** Footprints walk the path from our door to yours. */
export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED" || status === "PENDING") return null;
  const at = flow.findIndex((f) => f.key === status);
  return (
    <div className="rounded-[28px] bg-kajal p-6 text-biswar sm:p-8">
      <div className="relative grid grid-cols-4">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 h-[2px] bg-biswar/15" />
        <motion.div
          className="absolute left-[12.5%] top-5 h-[2px] bg-haldi"
          initial={{ width: 0 }}
          animate={{ width: `${(Math.max(0, at) / (flow.length - 1)) * 75}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        {flow.map((f, i) => {
          const done = i <= at;
          return (
            <div key={f.key} className="relative flex flex-col items-center gap-3 text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.25 }}
                className={cn("flex h-10 w-10 items-center justify-center rounded-full", done ? "bg-haldi text-kajal" : "bg-biswar/10 text-biswar/40")}
              >
                <Pagla className="h-5" flip={i % 2 === 0} />
              </motion.div>
              <span className={cn("text-[12px] font-semibold uppercase tracking-[0.14em] sm:text-[13px]", done ? "text-biswar" : "text-biswar/40")}>{f.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
