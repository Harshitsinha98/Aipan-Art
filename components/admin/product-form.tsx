"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { saveProduct, deleteProduct } from "@/lib/admin-actions";
import type { ProductInput } from "@/lib/validators";
import { slugify, cn } from "@/lib/utils";
import { ProductArt } from "../product-art";
import { Card } from "./bits";

type Category = { id: string; name: string; world: "AIPAN" | "CROCHET" };
type Variant = ProductInput["variants"][number];

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function uploadOne(file: File): Promise<string> {
  if (CLOUD && PRESET) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", PRESET);
    fd.append("folder", "aipan-art");
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error?.message ?? "Upload failed");
    // auto format + quality, capped width
    return String(d.secure_url).replace("/upload/", "/upload/f_auto,q_auto,w_1600/");
  }
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error ?? "Upload failed");
  return d.url;
}

export function ProductForm({ id, initial, categories }: { id: string | null; initial: ProductInput; categories: Category[] }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setSaved(false);
    setP((x) => ({ ...x, [k]: v }));
  };
  const cats = categories.filter((c) => c.world === p.world);

  async function onFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, 10 - p.images.length);
    setUploading((n) => n + list.length);
    for (const f of list) {
      try {
        const url = await uploadOne(f);
        setP((x) => ({ ...x, images: [...x.images, url] }));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function moveImage(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= p.images.length) return;
    const next = [...p.images];
    [next[i], next[j]] = [next[j], next[i]];
    set("images", next);
  }

  function setVariant(i: number, patch: Partial<Variant>) {
    set("variants", p.variants.map((v, k) => (k === i ? { ...v, ...patch } : v)));
  }

  function submit() {
    setError(null);
    start(async () => {
      const r = await saveProduct(id, p);
      if (!r.ok) return setError(r.error);
      setSaved(true);
      if (!id && r.id) router.replace(`/admin/products/${r.id}`);
      else router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <Card>
          <div className="mb-4 inline-flex rounded-full bg-kajal/5 p-1">
            {(["AIPAN", "CROCHET"] as const).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  set("world", w);
                  const first = categories.find((c) => c.world === w);
                  if (first && !categories.find((c) => c.id === p.categoryId && c.world === w)) set("categoryId", first.id);
                }}
                className={cn("rounded-full px-4 py-1.5 text-[13px] font-semibold", p.world === w ? (w === "AIPAN" ? "bg-geru-600 text-biswar" : "bg-pine text-biswar") : "")}
              >
                {w === "AIPAN" ? "Aipan · Likhai" : "Crochet · Hook"}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <L label="Name" className="sm:col-span-2">
              <input className="field" value={p.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
            </L>
            <L label="URL slug"><input className="field" value={p.slug ?? ""} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} /></L>
            <L label="SKU"><input className="field uppercase" value={p.sku} onChange={(e) => set("sku", e.target.value)} placeholder="CR-BEANIE-01" /></L>
            <L label="Category">
              <select className="field" value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">Choose…</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </L>
            <L label="One-line tagline"><input className="field" value={p.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} placeholder="Rib-stitch, double brim" /></L>
            <L label="Description" className="sm:col-span-2"><textarea className="field min-h-[130px]" value={p.description} onChange={(e) => set("description", e.target.value)} /></L>
            <L label="Note from the maker (optional)" className="sm:col-span-2"><textarea className="field min-h-[80px]" value={p.makerNote ?? ""} onChange={(e) => set("makerNote", e.target.value)} placeholder="A line about how or why you made it" /></L>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Photos</h2>
            <span className="text-[12px] text-kajal-400">{CLOUD && PRESET ? "Uploading to Cloudinary" : "Saved on the server (/media)"} · first photo is the cover</span>
          </div>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
            className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5"
          >
            {p.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl bg-biswar">
                <ProductArt src={src} alt="" world={p.world} swatch={p.swatch} className="h-full w-full" sizes="160px" />
                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-kajal px-2 py-0.5 text-[10px] font-semibold text-biswar">Cover</span>}
                <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100">
                  <button type="button" onClick={() => moveImage(i, -1)} className="rounded-full bg-white p-1"><ArrowLeft className="h-3 w-3" /></button>
                  <button type="button" onClick={() => set("images", p.images.filter((_, k) => k !== i))} className="rounded-full bg-white p-1 text-geru-600"><X className="h-3 w-3" /></button>
                  <button type="button" onClick={() => moveImage(i, 1)} className="rounded-full bg-white p-1"><ArrowRight className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
            {Array.from({ length: uploading }).map((_, i) => <div key={`u${i}`} className="aspect-square animate-pulse rounded-xl bg-kajal/10" />)}
            {p.images.length < 10 && (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-kajal/15 text-[12px] text-kajal-400 hover:border-geru-600 hover:text-geru-600">
                <ImagePlus className="h-5 w-5" /> Add / drop
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
          <details className="mt-3 text-[13px]">
            <summary className="cursor-pointer text-kajal-400">Or paste an image URL</summary>
            <form onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get("u"); if (v) set("images", [...p.images, String(v)]); e.currentTarget.reset(); }} className="mt-2 flex gap-2">
              <input name="u" className="field py-2" placeholder="https://res.cloudinary.com/…" />
              <button className="rounded-xl bg-kajal px-4 text-biswar">Add</button>
            </form>
          </details>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">Colours / variants</h2>
            <button
              type="button"
              onClick={() => set("variants", [...p.variants, { label: "", colorHex: p.swatch, sku: `${p.sku || "SKU"}-${p.variants.length + 1}`, price: null, stock: 0 }])}
              className="flex items-center gap-1 rounded-full bg-kajal/5 px-3 py-1.5 text-[13px] font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Add colour
            </button>
          </div>
          <p className="mt-1 text-[13px] text-kajal-400">Leave empty for one-of-a-kind pieces. With variants, stock is tracked per colour.</p>
          {p.variants.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-[44px_1fr_1fr_100px_80px_32px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-kajal-400">
                <span /> <span>Label</span> <span>SKU</span> <span>Price (opt.)</span> <span>Stock</span> <span />
              </div>
              {p.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[44px_1fr_1fr_100px_80px_32px] items-center gap-2">
                  <input type="color" value={v.colorHex ?? "#000000"} onChange={(e) => setVariant(i, { colorHex: e.target.value })} className="h-10 w-11 cursor-pointer rounded-lg border-0 bg-transparent" />
                  <input className="field py-2" value={v.label} onChange={(e) => setVariant(i, { label: e.target.value })} placeholder="Forest & cream" />
                  <input className="field py-2 uppercase" value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} />
                  <input className="field py-2" type="number" min={1} value={v.price ?? ""} onChange={(e) => setVariant(i, { price: e.target.value ? Number(e.target.value) : null })} placeholder="—" />
                  <input className="field py-2" type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: Number(e.target.value) })} />
                  <button type="button" onClick={() => set("variants", p.variants.filter((_, k) => k !== i))} className="text-kajal-300 hover:text-geru-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-xl">Details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <L label="Materials"><input className="field" value={p.materials ?? ""} onChange={(e) => set("materials", e.target.value)} placeholder="Acrylic-wool blend yarn" /></L>
            <L label="Size / dimensions"><input className="field" value={p.dimensions ?? ""} onChange={(e) => set("dimensions", e.target.value)} placeholder="Fits 54–60 cm head" /></L>
            <L label="Care"><input className="field" value={p.care ?? ""} onChange={(e) => set("care", e.target.value)} /></L>
            <L label="Weight (grams, for shipping)"><input className="field" type="number" value={p.weightGrams ?? ""} onChange={(e) => set("weightGrams", e.target.value ? Number(e.target.value) : null)} /></L>
          </div>
        </Card>
      </div>

      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <Card>
          <h2 className="font-display text-xl">Price</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <L label="Price ₹"><input className="field" type="number" min={1} value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} /></L>
            <L label="Was ₹ (optional)"><input className="field" type="number" min={0} value={p.compareAtPrice ?? ""} onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : null)} /></L>
          </div>
          <p className="mt-2 text-[12px] text-kajal-400">GST-inclusive. “Was” shows a strike-through and % off.</p>
        </Card>

        <Card>
          <h2 className="font-display text-xl">Inventory</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <L label="In stock">
              <input className="field disabled:opacity-40" type="number" min={0} value={p.stock} disabled={p.variants.length > 0} onChange={(e) => set("stock", Number(e.target.value))} />
            </L>
            <L label="Warn when ≤"><input className="field" type="number" min={0} value={p.lowStockAt} onChange={(e) => set("lowStockAt", Number(e.target.value))} /></L>
          </div>
          {p.variants.length > 0 && <p className="mt-2 text-[12px] text-kajal-400">Stock is set per colour below.</p>}
          <Toggle className="mt-4" label="Made to order" hint="Can be bought at 0 stock" checked={p.madeToOrder} onChange={(v) => set("madeToOrder", v)} />
          {p.madeToOrder && (
            <L label="Days to make" className="mt-3"><input className="field" type="number" min={0} value={p.leadTimeDays ?? ""} onChange={(e) => set("leadTimeDays", e.target.value ? Number(e.target.value) : null)} placeholder="7" /></L>
          )}
          <Toggle className="mt-3" label="Personalisable" hint="Shopper types a name / initials" checked={p.customizable} onChange={(v) => set("customizable", v)} />
          {p.customizable && (
            <L label="What to ask for" className="mt-3"><input className="field" value={p.customizationLabel ?? ""} onChange={(e) => set("customizationLabel", e.target.value)} placeholder="Name for the nameplate" /></L>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-xl">Visibility</h2>
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-kajal/5 p-1">
            {(["DRAFT", "ACTIVE", "ARCHIVED"] as const).map((s) => (
              <button key={s} type="button" onClick={() => set("status", s)} className={cn("rounded-lg py-2 text-[12px] font-semibold", p.status === s ? "bg-white shadow-sm" : "text-kajal-400")}>
                {s === "ACTIVE" ? "Live" : s[0] + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <Toggle className="mt-4" label="Feature on home page" checked={p.featured} onChange={(v) => set("featured", v)} />
          <L label="Placeholder colour (used until photos are added)" className="mt-4">
            <div className="flex items-center gap-3">
              <input type="color" value={p.swatch} onChange={(e) => set("swatch", e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent" />
              <ProductArt src={null} alt="" world={p.world} swatch={p.swatch} className="h-12 w-12 rounded-lg" />
            </div>
          </L>
        </Card>

        {error && <p className="rounded-xl bg-geru-50 px-4 py-3 text-[14px] text-geru-700">{error}</p>}
        <button onClick={submit} disabled={pending || uploading > 0} className="w-full rounded-full bg-geru-600 py-4 font-semibold text-biswar disabled:opacity-60">
          {pending ? "Saving…" : uploading ? "Waiting for photos…" : saved ? "Saved ✓" : id ? "Save changes" : "Create product"}
        </button>
        {id && (
          <button
            onClick={() => {
              if (!confirm("Delete this product? (If it has orders it will be archived instead.)")) return;
              start(async () => {
                const r = await deleteProduct(id);
                if (!r.ok) setError(r.error);
                router.push("/admin/products");
              });
            }}
            className="w-full text-center text-[13px] font-semibold text-geru-600 underline"
          >
            Delete product
          </button>
        )}
      </div>
    </div>
  );
}

function L({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, hint, checked, onChange, className }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; className?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={cn("flex w-full items-center justify-between gap-3 text-left", className)}>
      <span>
        <span className="block text-[14px] font-medium">{label}</span>
        {hint && <span className="text-[12px] text-kajal-400">{hint}</span>}
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-pine" : "bg-kajal/15")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}
