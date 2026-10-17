"use client";

import { useState, useTransition } from "react";
import { clearAttention, refundOrder, updateOrder } from "@/lib/admin-actions";
import { Card } from "./bits";
import { statusCopy } from "@/lib/utils";

const statuses = ["CONFIRMED", "CRAFTING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderControls(props: {
  id: string;
  status: string;
  paymentStatus: string;
  courier: string;
  trackingNumber: string;
  needsAttention: boolean;
}) {
  const [status, setStatus] = useState(props.status);
  const [note, setNote] = useState("");
  const [courier, setCourier] = useState(props.courier);
  const [tracking, setTracking] = useState(props.trackingNumber);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setMsg(null);
    if (status === "CANCELLED" && props.status !== "CANCELLED" && !confirm("Cancel this order? Stock will be put back. Refund separately if paid.")) return;
    start(async () => {
      const r = await updateOrder(props.id, { status: status as (typeof statuses)[number], note: note || undefined, courier, trackingNumber: tracking });
      setMsg(r.ok ? "Saved ✓" : r.error);
      if (r.ok) setNote("");
    });
  }

  return (
    <Card>
      <h2 className="font-display text-xl">Update</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-xl px-3 py-2 text-[13px] font-semibold ring-1 transition ${status === s ? "bg-kajal text-biswar ring-kajal" : "ring-kajal/10 hover:ring-kajal/30"}`}
          >
            {statusCopy[s].label}
          </button>
        ))}
      </div>
      {(status === "SHIPPED" || courier || tracking) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input className="field py-2" placeholder="Courier (e.g. India Post)" value={courier} onChange={(e) => setCourier(e.target.value)} />
          <input className="field py-2" placeholder="Tracking / AWB" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
      )}
      <textarea className="field mt-3 min-h-[70px]" placeholder="Note for the customer (shows on their order page)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button onClick={save} disabled={pending} className="mt-3 w-full rounded-full bg-geru-600 py-3 font-semibold text-biswar disabled:opacity-60">
        {pending ? "Saving…" : "Save update"}
      </button>
      {msg && <p className="mt-2 text-center text-[13px]">{msg}</p>}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-kajal/5 pt-4 text-[13px]">
        {props.needsAttention && (
          <button className="font-semibold underline" onClick={() => start(async () => { await clearAttention(props.id); })}>Mark issue resolved</button>
        )}
        {props.paymentStatus === "PAID" && (
          <button
            className="font-semibold text-geru-600 underline"
            onClick={() => {
              if (!confirm("Refund the full amount to the customer via Razorpay? This also cancels the order.")) return;
              start(async () => {
                const r = await refundOrder(props.id);
                setMsg(r.ok ? "Refund issued ✓" : r.error);
              });
            }}
          >
            Refund full amount
          </button>
        )}
      </div>
    </Card>
  );
}
