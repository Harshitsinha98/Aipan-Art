"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Spinner } from "../ui";

export function ShopControls({ total, autoFocus }: { total: number; autoFocus?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("focus");
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update("q", q.trim() || null);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="my-8 flex flex-col gap-3 border-y border-kajal/10 py-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative flex flex-1 items-center sm:max-w-sm">
        <Search className="absolute left-4 h-4 w-4 text-kajal-300" />
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search beanies, thali, tote…"
          className="w-full rounded-full bg-kajal/[0.05] py-2.5 pl-11 pr-4 text-[15px] outline-none ring-geru-600/20 transition focus:bg-white focus:ring-4"
          aria-label="Search products"
        />
      </label>
      <div className="flex items-center gap-4 text-[14px]">
        <span className="flex items-center gap-2 text-kajal-400">
          {pending && <Spinner className="h-3 w-3" />} {total} {total === 1 ? "piece" : "pieces"}
        </span>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={params.get("instock") === "1"}
            onChange={(e) => update("instock", e.target.checked ? "1" : null)}
            className="h-4 w-4 accent-geru-600"
          />
          Ready to ship
        </label>
        <select
          value={params.get("sort") ?? "new"}
          onChange={(e) => update("sort", e.target.value === "new" ? null : e.target.value)}
          className="rounded-full bg-kajal/[0.05] px-4 py-2 outline-none"
          aria-label="Sort"
        >
          <option value="new">Newest</option>
          <option value="loved">Most loved</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
    </div>
  );
}
