"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/account", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="flex items-center gap-1 rounded-full bg-kajal/[0.06] p-1">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} className={cn("relative rounded-full px-4 py-2 text-[14px] font-medium", active ? "text-biswar" : "text-kajal")}>
            {active && <motion.span layoutId="acct-tab" className="absolute inset-0 rounded-full bg-kajal" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">{t.label}</span>
          </Link>
        );
      })}
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.replace("/");
          router.refresh();
        }}
        className="rounded-full px-4 py-2 text-[14px] font-medium text-kajal-400 hover:text-geru-600"
      >
        Sign out
      </button>
    </nav>
  );
}
