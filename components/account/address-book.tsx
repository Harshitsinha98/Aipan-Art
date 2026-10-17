"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui";

type A = { id: string; name: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; isDefault: boolean };

export function AddressBook({ addresses }: { addresses: A[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(addresses.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function call(method: string, body?: unknown, query = "") {
    const res = await fetch(`/api/account/addresses${query}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    router.refresh();
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await call("POST", Object.fromEntries(new FormData(e.currentTarget)));
      setAdding(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {addresses.map((a) => (
        <div key={a.id} className="rounded-[24px] bg-white/60 p-5 text-[15px]">
          <div className="flex items-start justify-between">
            <p className="font-semibold">{a.name}</p>
            {a.isDefault && <span className="rounded-full bg-pine px-2.5 py-0.5 text-[11px] font-semibold text-biswar">Default</span>}
          </div>
          <p className="mt-2 text-kajal-600">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
          <p className="text-kajal-600">{a.city}, {a.state} {a.pincode}</p>
          <p className="text-kajal-400">+91 {a.phone}</p>
          <div className="mt-4 flex gap-4 text-[13px] font-semibold">
            {!a.isDefault && <button onClick={() => call("PATCH", { id: a.id })} className="underline underline-offset-2">Make default</button>}
            <button onClick={() => confirm("Remove this address?") && call("DELETE", undefined, `?id=${a.id}`)} className="text-geru-600 underline underline-offset-2">Remove</button>
          </div>
        </div>
      ))}
      {adding ? (
        <form onSubmit={add} className="grid gap-3 rounded-[24px] bg-white/60 p-5 md:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" placeholder="Full name" required className="field" />
            <input name="phone" placeholder="Mobile" required className="field" inputMode="numeric" />
            <input name="line1" placeholder="House, street, area" required className="field sm:col-span-2" />
            <input name="line2" placeholder="Landmark (optional)" className="field sm:col-span-2" />
            <input name="pincode" placeholder="Pincode" required className="field" inputMode="numeric" maxLength={6} />
            <input name="city" placeholder="City" required className="field" />
            <input name="state" placeholder="State" required className="field" />
          </div>
          {error && <p className="text-[13px] text-geru-700">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ink" disabled={busy}>{busy ? "Saving…" : "Save address"}</Button>
            {addresses.length > 0 && <Button type="button" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>}
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="flex min-h-[160px] items-center justify-center rounded-[24px] border-2 border-dashed border-kajal/15 font-semibold hover:border-geru-600 hover:text-geru-600">
          + Add an address
        </button>
      )}
    </div>
  );
}
