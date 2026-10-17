"use client";

import { useState, useTransition } from "react";
import { adjustStock } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

export function StockAdjust({ productId, variantId, stock, low }: { productId: string; variantId: string | null; stock: number; low: number }) {
  const [value, setValue] = useState(stock);
  const [custom, setCustom] = useState("");
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function apply(delta: number, why: string) {
    if (!delta) return;
    setErr(null);
    const prev = value;
    setValue((v) => Math.max(0, v + delta));
    start(async () => {
      const r = await adjustStock(productId, variantId, delta, why);
      if (!r.ok) {
        setValue(prev);
        setErr(r.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={() => apply(-1, "Quick −1")} disabled={pending || value === 0} className="h-8 w-8 rounded-full bg-kajal/5 font-semibold disabled:opacity-30">−</button>
      <span className={cn("w-10 text-center font-display text-xl tabular-nums", value === 0 ? "text-geru-600" : value <= low ? "text-haldi" : "")}>{value}</span>
      <button onClick={() => apply(1, "Quick +1")} disabled={pending} className="h-8 w-8 rounded-full bg-kajal/5 font-semibold">+</button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply(parseInt(custom, 10) || 0, reason || "Batch adjustment");
          setCustom("");
          setReason("");
        }}
        className="ml-2 flex items-center gap-1"
      >
        <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="+10 / −3" className="field w-20 px-2 py-1.5 text-[13px]" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="field w-32 px-2 py-1.5 text-[13px]" />
        <button className="rounded-lg bg-kajal px-2.5 py-1.5 text-[12px] font-semibold text-biswar">Apply</button>
      </form>
      {err && <span className="text-[12px] text-geru-600">{err}</span>}
    </div>
  );
}
