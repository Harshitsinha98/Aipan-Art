"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Gift, Lock, Tag, X, AlertCircle } from "lucide-react";
import { useCart, cartSubtotal } from "@/store/cart";
import { addressSchema } from "@/lib/validators";
import { computeTotals } from "@/lib/pricing";
import { formatINR, cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { ProductArt } from "../product-art";
import { Pagla } from "../motifs";
import { Spinner } from "../ui";

type Addr = { id?: string; name: string; phone: string; line1: string; line2?: string | null; city: string; state: string; pincode: string };
type Quote = {
  lines: { productId: string; variantId: string | null; unitPrice: number; quantity: number; problem: string | null; available: number }[];
  hasProblems: boolean;
  couponError: string | null;
  appliedCoupon: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  giftWrapFee: number;
  total: number;
};

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

const GUEST_KEY = "aipan-guest";
const blank: Addr = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export function CheckoutClient({ user, addresses }: { user: { email: string; name: string | null } | null; addresses: Addr[] }) {
  const router = useRouter();
  const { lines, setQty, remove, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [selected, setSelected] = useState<string | "new">(addresses[0]?.id ?? "new");
  const [addr, setAddr] = useState<Addr>({ ...blank, name: user?.name ?? "" });
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [pinState, setPinState] = useState<"idle" | "loading" | "ok" | "bad">("idle");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const pinReq = useRef(0);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      try {
        const saved = JSON.parse(localStorage.getItem(GUEST_KEY) ?? "null");
        if (saved?.email) setEmail(saved.email);
        if (saved?.addr) setAddr({ ...blank, ...saved.addr });
      } catch {}
    }
  }, [user]);

  const items = useMemo(
    () => lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity, customization: l.customization })),
    [lines],
  );

  const refreshQuote = useCallback(async () => {
    if (!items.length) return setQuote(null);
    const res = await fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items, couponCode: coupon, giftWrap }),
    });
    if (res.ok) setQuote(await res.json());
  }, [items, coupon, giftWrap]);

  useEffect(() => {
    if (mounted) refreshQuote();
  }, [mounted, refreshQuote]);

  // pincode → city/state
  useEffect(() => {
    if (selected !== "new" || !/^[1-9]\d{5}$/.test(addr.pincode)) {
      setPinState("idle");
      return;
    }
    const id = ++pinReq.current;
    setPinState("loading");
    fetch(`/api/pincode/${addr.pincode}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (id !== pinReq.current) return;
        setAddr((a) => ({ ...a, city: a.city || d.city, state: d.state }));
        setPinState("ok");
      })
      .catch(() => id === pinReq.current && setPinState("bad"));
  }, [addr.pincode, selected]);

  const activeAddr: Addr = selected === "new" ? addr : addresses.find((a) => a.id === selected) ?? addr;
  const localSubtotal = cartSubtotal(lines);
  const totals = quote ?? { ...computeTotals(localSubtotal, 0, giftWrap), discount: 0 };
  const problemFor = (productId: string, variantId: string | null) =>
    quote?.lines.find((l) => l.productId === productId && l.variantId === variantId)?.problem ?? null;

  const contactDone = /.+@.+\..+/.test(email);
  const addressDone = addressSchema.safeParse(activeAddr).success;

  function setField<K extends keyof Addr>(k: K, v: Addr[K]) {
    setAddr((a) => ({ ...a, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function pay() {
    setFormError(null);
    const errs: Record<string, string> = {};
    if (!contactDone) errs.email = "We'll send your receipt here";
    const parsed = addressSchema.safeParse(activeAddr);
    if (!parsed.success) parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (quote?.hasProblems) {
      setFormError("A piece in your bag needs attention — see the summary.");
      return;
    }
    if (!window.Razorpay) {
      setFormError("The payment window is still loading. Give it a second and try again.");
      return;
    }

    setPaying(true);
    if (!user) localStorage.setItem(GUEST_KEY, JSON.stringify({ email, addr: { ...activeAddr, id: undefined } }));

    const res = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        address: { ...activeAddr, id: undefined, line2: activeAddr.line2 ?? "" },
        items,
        couponCode: coupon ?? "",
        giftWrap,
        giftNote,
        saveAddress: !!user && selected === "new",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPaying(false);
      setFormError(data.error ?? "Something went wrong.");
      if (data.quote) setQuote(data.quote);
      return;
    }

    const rzp = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: data.name,
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: data.prefill,
      notes: { orderNumber: data.orderNumber },
      theme: { color: "#9B2D20" },
      modal: {
        ondismiss: () => {
          setPaying(false);
          setFormError("Payment window closed. Nothing was charged — your bag is right here.");
        },
      },
      handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const v = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(r),
        });
        const out = await v.json();
        if (!v.ok) {
          setPaying(false);
          setFormError(out.error);
          return;
        }
        clear();
        router.replace(`/order/${out.orderNumber}?t=${out.accessToken}&new=1`);
      },
    });
    rzp.on("payment.failed", () => {
      setFormError("The payment didn't go through. You can try again or use another method.");
    });
    rzp.open();
  }

  if (!mounted) return <div className="min-h-[70vh]" />;

  if (!lines.length) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="flex gap-3 text-geru-600/70">
          <Pagla className="h-14 -rotate-6" flip />
          <Pagla className="mt-8 h-14 rotate-6" />
        </div>
        <h1 className="mt-6 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-2 text-kajal-400">Pick something handmade and come back — checkout takes under a minute.</p>
        <Link href="/shop" className="mt-6 rounded-full bg-kajal px-6 py-3 font-semibold text-biswar">Go to the shop</Link>
      </div>
    );
  }

  const steps = [contactDone, addressDone, true];

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-24 sm:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-5xl sm:text-6xl">Checkout</h1>
        <FootstepProgress done={steps} />
      </div>

      {/* Mobile summary toggle */}
      <button
        onClick={() => setSummaryOpen(!summaryOpen)}
        className="mb-6 flex w-full items-center justify-between rounded-2xl bg-white/70 px-5 py-4 lg:hidden"
      >
        <span className="flex items-center gap-2 text-[14px] font-medium">
          {summaryOpen ? "Hide" : "Show"} order summary <ChevronDown className={cn("h-4 w-4 transition", summaryOpen && "rotate-180")} />
        </span>
        <span className="font-semibold tabular-nums">{formatINR(totals.total)}</span>
      </button>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Section n={1} title="Where should we send the receipt?" done={contactDone}>
            {user ? (
              <p className="text-[15px]">
                Signed in as <b>{user.email}</b>
              </p>
            ) : (
              <>
                <Field label="Email" error={errors.email}>
                  <input className="field" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: "" })); }} placeholder="you@example.com" />
                </Field>
                <p className="mt-3 text-[13px] text-kajal-400">
                  No account needed. Have one? <Link href="/login?next=/checkout" className="font-semibold text-kajal underline underline-offset-2">Sign in</Link>
                </p>
              </>
            )}
          </Section>

          <Section n={2} title="Delivery address" done={addressDone}>
            {addresses.length > 0 && (
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelected(a.id!)}
                    className={cn(
                      "rounded-2xl p-4 text-left text-[14px] ring-1 transition",
                      selected === a.id ? "bg-white ring-2 ring-geru-600" : "bg-white/50 ring-kajal/10 hover:ring-kajal/30",
                    )}
                  >
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-kajal-400">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                    <p className="text-kajal-400">{a.city}, {a.state} {a.pincode}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelected("new")}
                  className={cn("rounded-2xl border-2 border-dashed p-4 text-[14px] font-medium transition", selected === "new" ? "border-geru-600 text-geru-600" : "border-kajal/15")}
                >
                  + New address
                </button>
              </div>
            )}
            {selected === "new" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}>
                  <input className="field" autoComplete="name" value={addr.name} onChange={(e) => setField("name", e.target.value)} />
                </Field>
                <Field label="Mobile" error={errors.phone}>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-kajal-400">+91</span>
                    <input className="field pl-12" type="tel" autoComplete="tel-national" inputMode="numeric" maxLength={14} value={addr.phone} onChange={(e) => setField("phone", e.target.value)} />
                  </div>
                </Field>
                <Field label="Pincode" error={errors.pincode} hint={pinState === "loading" ? "Finding your town…" : pinState === "ok" ? "✓ Found it" : pinState === "bad" ? "Couldn't look it up — type city & state" : undefined}>
                  <input className="field tracking-[0.2em]" inputMode="numeric" autoComplete="postal-code" maxLength={6} value={addr.pincode} onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, ""))} />
                </Field>
                <Field label="City" error={errors.city}>
                  <input className="field" autoComplete="address-level2" value={addr.city} onChange={(e) => setField("city", e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="House, street, area" error={errors.line1}>
                    <input className="field" autoComplete="address-line1" value={addr.line1} onChange={(e) => setField("line1", e.target.value)} />
                  </Field>
                </div>
                <Field label="Landmark (optional)">
                  <input className="field" autoComplete="address-line2" value={addr.line2 ?? ""} onChange={(e) => setField("line2", e.target.value)} />
                </Field>
                <Field label="State" error={errors.state}>
                  <input className="field" autoComplete="address-level1" value={addr.state} onChange={(e) => setField("state", e.target.value)} />
                </Field>
              </div>
            )}
          </Section>

          <Section n={3} title="A little extra" done optional>
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-white/60 p-4">
              <span className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-geru-600" />
                <span>
                  <span className="block font-medium">Gift wrap it</span>
                  <span className="text-[13px] text-kajal-400">Hand-printed paper, yarn tie, no prices inside · {formatINR(site.giftWrapFee)}</span>
                </span>
              </span>
              <Toggle checked={giftWrap} onChange={setGiftWrap} />
            </label>
            <AnimatePresence>
              {giftWrap && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <textarea className="field mt-3 min-h-[90px]" maxLength={240} placeholder="A note for them — we'll write it by hand" value={giftNote} onChange={(e) => setGiftNote(e.target.value)} />
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          <div className="hidden lg:block">
            <PayButton total={totals.total} paying={paying} onClick={pay} error={formError} />
          </div>
        </div>

        <aside className={cn("lg:block", summaryOpen ? "block" : "hidden")}>
          <div className="rounded-[28px] bg-white/65 p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-2xl">Your bag</h2>
            <ul className="mt-5 max-h-[340px] space-y-4 overflow-y-auto pr-1">
              {lines.map((l) => {
                const problem = problemFor(l.productId, l.variantId);
                return (
                  <li key={l.key} className="flex gap-3">
                    <div className="relative">
                      <ProductArt src={l.image} alt={l.name} world={l.world} swatch={l.swatch} className="h-16 w-14 rounded-lg" sizes="56px" />
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-kajal px-1 text-[11px] font-semibold text-biswar">{l.quantity}</span>
                    </div>
                    <div className="min-w-0 flex-1 text-[14px]">
                      <p className="truncate font-medium">{l.name}</p>
                      <p className="text-[12px] text-kajal-400">{[l.variantLabel, l.customization && `“${l.customization}”`].filter(Boolean).join(" · ")}</p>
                      {problem && (
                        <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-geru-600">
                          <AlertCircle className="h-3 w-3" /> {problem}
                          {problem.startsWith("Only") ? (
                            <button className="underline" onClick={() => setQty(l.key, quote!.lines.find((q) => q.productId === l.productId && q.variantId === l.variantId)!.available)}>fix</button>
                          ) : (
                            <button className="underline" onClick={() => remove(l.key)}>remove</button>
                          )}
                        </p>
                      )}
                    </div>
                    <p className="text-[14px] font-medium tabular-nums">{formatINR(l.price * l.quantity)}</p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 border-t border-kajal/10 pt-5">
              {coupon && quote?.appliedCoupon ? (
                <div className="flex items-center justify-between rounded-xl bg-pine/10 px-4 py-3 text-[14px]">
                  <span className="flex items-center gap-2 font-medium text-pine"><Tag className="h-4 w-4" /> {quote.appliedCoupon} applied</span>
                  <button onClick={() => { setCoupon(null); setCouponInput(""); }} aria-label="Remove code"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (couponInput.trim()) setCoupon(couponInput.trim().toUpperCase());
                  }}
                  className="flex gap-2"
                >
                  <input className="field py-2.5 uppercase" placeholder="Discount code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                  <button className="rounded-xl bg-kajal px-4 text-[14px] font-semibold text-biswar">Apply</button>
                </form>
              )}
              {coupon && quote?.couponError && <p className="mt-2 text-[13px] text-geru-600">{quote.couponError}</p>}
            </div>

            <dl className="mt-5 space-y-2 text-[14px]">
              <Row k="Subtotal" v={formatINR(totals.subtotal)} />
              {totals.discount > 0 && <Row k="Discount" v={`− ${formatINR(totals.discount)}`} className="text-pine" />}
              <Row k="Shipping" v={totals.shippingFee ? formatINR(totals.shippingFee) : "Free"} />
              {totals.giftWrapFee > 0 && <Row k="Gift wrap" v={formatINR(totals.giftWrapFee)} />}
              <div className="flex items-baseline justify-between border-t border-kajal/10 pt-3">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-3xl tabular-nums">{formatINR(totals.total)}</dd>
              </div>
              <p className="text-[12px] text-kajal-400">Inclusive of GST. No surprises later.</p>
            </dl>
          </div>
        </aside>
      </div>

      {/* Mobile pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-kajal/10 bg-biswar/95 p-3 backdrop-blur lg:hidden">
        <PayButton total={totals.total} paying={paying} onClick={pay} error={formError} compact />
      </div>
    </div>
  );
}

function PayButton({ total, paying, onClick, error, compact }: { total: number; paying: boolean; onClick: () => void; error: string | null; compact?: boolean }) {
  return (
    <div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-3 rounded-xl bg-geru-50 px-4 py-3 text-[14px] text-geru-700">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        disabled={paying}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-geru-600 py-4 text-[16px] font-semibold text-biswar transition hover:bg-geru-700 disabled:opacity-80"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        {paying ? <Spinner /> : <Lock className="h-4 w-4" />}
        {paying ? "Opening secure payment…" : `Pay ${formatINR(total)}`}
      </motion.button>
      {!compact && (
        <p className="mt-3 text-center text-[12px] text-kajal-400">
          UPI · Cards · Netbanking · Wallets — secured by Razorpay
        </p>
      )}
    </div>
  );
}

/** Lakshmi's footprints walk toward the door as each step is completed. */
function FootstepProgress({ done }: { done: boolean[] }) {
  const labels = ["Contact", "Address", "Pay"];
  return (
    <ol className="flex items-end gap-4 sm:gap-6" aria-label="Checkout progress">
      {labels.map((label, i) => {
        const complete = done.slice(0, i + 1).every(Boolean);
        return (
          <li key={label} className="flex flex-col items-center gap-1.5">
            <div className="flex gap-1">
              <motion.span animate={{ opacity: complete ? 1 : 0.2, y: complete ? 0 : 3 }} className="text-geru-600">
                <Pagla className="h-6 -rotate-6" flip />
              </motion.span>
              <motion.span animate={{ opacity: complete ? 1 : 0.2, y: complete ? -4 : 0 }} transition={{ delay: 0.1 }} className="text-geru-600">
                <Pagla className="h-6 rotate-6" />
              </motion.span>
            </div>
            <span className={cn("text-[11px] font-semibold uppercase tracking-[0.16em]", complete ? "text-kajal" : "text-kajal-300")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Section({ n, title, done, optional, children }: { n: number; title: string; done: boolean; optional?: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-white/45 p-5 sm:p-7">
      <header className="mb-5 flex items-center gap-3">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold transition", done && !optional ? "bg-pine text-biswar" : "bg-kajal/10")}>
          {done && !optional ? "✓" : n}
        </span>
        <h2 className="font-display text-2xl">{title}</h2>
        {optional && <span className="text-[12px] text-kajal-300">optional</span>}
      </header>
      {children}
    </section>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div data-error={!!error}>
      <span className="label">{label}</span>
      {children}
      {error ? <p className="mt-1.5 text-[13px] text-geru-600">{error}</p> : hint ? <p className="mt-1.5 text-[13px] text-kajal-400">{hint}</p> : null}
    </div>
  );
}

function Row({ k, v, className }: { k: string; v: string; className?: string }) {
  return (
    <div className={cn("flex justify-between", className)}>
      <dt className="text-kajal-400">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-geru-600" : "bg-kajal/20")}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow", checked ? "right-1" : "left-1")} />
    </button>
  );
}
