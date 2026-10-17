import { cn } from "@/lib/utils";

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-kajal-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl bg-white p-5 shadow-[0_1px_0_rgba(28,25,22,.06)]", className)}>{children}</div>;
}

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "geru" | "pine" | "haldi" }) {
  return (
    <Card className={cn(tone === "geru" && "bg-geru-600 text-biswar", tone === "pine" && "bg-pine text-biswar", tone === "haldi" && "bg-haldi")}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] opacity-60">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-[13px] opacity-70">{hint}</p>}
    </Card>
  );
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead className="border-b border-kajal/10 text-[11px] uppercase tracking-[0.14em] text-kajal-400">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-kajal/5">{children}</tbody>
      </table>
    </div>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold", className)}>{children}</span>;
}

export const payTone: Record<string, string> = {
  PENDING: "bg-kajal/10 text-kajal-600",
  PAID: "bg-pine/15 text-pine",
  FAILED: "bg-geru-100 text-geru-700",
  REFUNDED: "bg-himal/25 text-himal-700",
};
