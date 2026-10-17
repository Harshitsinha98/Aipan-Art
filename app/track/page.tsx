"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import { Pagla } from "@/components/motifs";

export default function TrackPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setError(data.error);
    router.push(data.url);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-16">
      <div className="flex gap-2 text-geru-600">
        <Pagla className="h-9 -rotate-6" flip />
        <Pagla className="mt-4 h-9 rotate-6" />
        <Pagla className="h-9 -rotate-3 opacity-50" flip />
        <Pagla className="mt-4 h-9 rotate-3 opacity-25" />
      </div>
      <h1 className="mt-6 font-display text-5xl">Where&apos;s my parcel?</h1>
      <p className="mt-3 text-kajal-400">Your order number is in the confirmation email — it looks like AA-2610-XXXX.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="label">Order number</span>
          <input name="orderNumber" required className="field uppercase tracking-wider" placeholder="AA-2610-7KQ3" />
        </label>
        <label className="block">
          <span className="label">Email used at checkout</span>
          <input name="email" type="email" required className="field" />
        </label>
        {error && <p className="rounded-xl bg-geru-50 px-4 py-3 text-[14px] text-geru-700">{error}</p>}
        <Button variant="ink" className="w-full" disabled={busy}>{busy ? "Looking…" : "Find my order"}</Button>
      </form>
    </div>
  );
}
