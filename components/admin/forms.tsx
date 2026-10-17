"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { createCoupon, moderateReview, saveCategory, toggleCategory, toggleCoupon } from "@/lib/admin-actions";

export function CategoryForm({ initial }: { initial?: { id: string; name: string; slug: string; world: string; description: string | null; sortOrder: number } }) {
  const [state, action, pending] = useActionState(saveCategory, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && !initial) ref.current?.reset();
  }, [state, initial]);
  return (
    <form ref={ref} action={action} className="grid gap-2 sm:grid-cols-[1fr_1fr_140px_80px_auto]">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input name="name" defaultValue={initial?.name} placeholder="Name (e.g. Puja Thali)" className="field py-2" required />
      <input name="slug" defaultValue={initial?.slug} placeholder="slug (auto)" className="field py-2" />
      <select name="world" defaultValue={initial?.world ?? "AIPAN"} className="field py-2">
        <option value="AIPAN">Aipan</option>
        <option value="CROCHET">Crochet</option>
      </select>
      <input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} className="field py-2" title="Order" />
      <button disabled={pending} className="rounded-xl bg-kajal px-4 py-2 text-[13px] font-semibold text-biswar">{initial ? "Save" : "Add"}</button>
      <input name="description" defaultValue={initial?.description ?? ""} placeholder="Short description (optional)" className="field py-2 sm:col-span-4" />
      {state?.error && <p className="text-[13px] text-geru-600 sm:col-span-5">{state.error}</p>}
    </form>
  );
}

export function ActiveToggle({ id, active, kind }: { id: string; active: boolean; kind: "category" | "coupon" }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => (kind === "category" ? toggleCategory(id, !active) : toggleCoupon(id, !active)))}
      className={`rounded-full px-3 py-1 text-[12px] font-semibold ${active ? "bg-pine/15 text-pine" : "bg-kajal/10 text-kajal-400"}`}
    >
      {active ? "Active" : "Paused"}
    </button>
  );
}

export function CouponForm() {
  const [state, action, pending] = useActionState(createCoupon, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-2 sm:grid-cols-4">
      <input name="code" placeholder="CODE" className="field py-2 uppercase" required />
      <select name="type" className="field py-2"><option value="PERCENT">% off</option><option value="FLAT">₹ off</option></select>
      <input name="value" type="number" min={1} placeholder="Value" className="field py-2" required />
      <input name="minimumOrder" type="number" min={0} placeholder="Min order ₹" className="field py-2" />
      <input name="maxDiscount" type="number" min={0} placeholder="Max discount ₹" className="field py-2" />
      <input name="usageLimit" type="number" min={0} placeholder="Total uses" className="field py-2" />
      <input name="expiresAt" type="date" className="field py-2" />
      <button disabled={pending} className="rounded-xl bg-geru-600 px-4 py-2 text-[13px] font-semibold text-biswar">Create code</button>
      <input name="description" placeholder="Internal note (optional)" className="field py-2 sm:col-span-4" />
      {state?.error && <p className="text-[13px] text-geru-600 sm:col-span-4">{state.error}</p>}
      {state?.ok && <p className="text-[13px] text-pine sm:col-span-4">Created ✓</p>}
    </form>
  );
}

export function ReviewActions({ id, approved }: { id: string; approved: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      {!approved && (
        <button disabled={pending} onClick={() => start(() => moderateReview(id, true))} className="rounded-full bg-pine px-3 py-1 text-[12px] font-semibold text-biswar">Approve</button>
      )}
      <button disabled={pending} onClick={() => confirm("Delete this review?") && start(() => moderateReview(id, false))} className="rounded-full bg-kajal/5 px-3 py-1 text-[12px] font-semibold text-geru-600">Delete</button>
    </div>
  );
}
