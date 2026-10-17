"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, CreditCard, FolderTree, LogOut, Menu, MessageSquare, Package, ShoppingCart, Ticket, Users, X, ExternalLink } from "lucide-react";
import { adminLogout } from "@/lib/admin-actions";
import { Logo } from "../layout/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Today", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav className="flex flex-col gap-0.5">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition", active ? "bg-kajal text-biswar" : "text-kajal-600 hover:bg-kajal/5")}
          >
            <l.icon className="h-4 w-4" /> {l.label}
          </Link>
        );
      })}
    </nav>
  );
  const foot = (
    <div className="space-y-1 border-t border-kajal/10 pt-4 text-[13px]">
      <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-kajal-600 hover:bg-kajal/5">
        <ExternalLink className="h-4 w-4" /> View shop
      </Link>
      <form action={adminLogout}>
        <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-kajal-600 hover:bg-kajal/5">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-kajal-300">{name}</p>
    </div>
  );
  return (
    <>
      <div className="flex items-center justify-between border-b border-kajal/10 bg-biswar px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-kajal/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-72 flex-col justify-between bg-biswar p-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="mb-6 flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
              {nav}
            </div>
            {foot}
          </aside>
        </div>
      )}
      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-kajal/10 bg-biswar p-4 lg:flex">
        <div>
          <div className="mb-8 px-3 pt-2"><Logo /></div>
          {nav}
        </div>
        {foot}
      </aside>
    </>
  );
}
