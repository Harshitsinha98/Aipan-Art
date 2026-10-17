"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pagla } from "../motifs";
import { Button } from "../ui";

export function ReviewButton({ productId, name }: { productId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, rating, body }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="shrink-0 rounded-full bg-haldi-200 px-3 py-1.5 text-[12px] font-semibold">
        Review
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-kajal/40 p-3 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div
              className="w-full max-w-md rounded-[28px] bg-biswar p-6"
              initial={{ y: 40, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-2xl">How is the {name}?</h3>
              <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} role="radio" aria-checked={rating === n} onClick={() => setRating(n)} className={n <= rating ? "text-geru-600" : "text-kajal/20"}>
                    <Pagla className="h-8" flip={n % 2 === 0} />
                  </button>
                ))}
              </div>
              <textarea className="field mt-4 min-h-[110px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tell others what you loved (or didn't)." />
              {error && <p className="mt-2 text-[13px] text-geru-700">{error}</p>}
              <Button variant="ink" className="mt-4 w-full" onClick={submit} disabled={busy}>
                {busy ? "Sending…" : "Post review"}
              </Button>
              <p className="mt-2 text-center text-[12px] text-kajal-400">Reviews appear after a quick look from the maker.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
