import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(rupees: number) {
  return inr.format(rupees);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const statusCopy: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Awaiting payment", tone: "bg-kajal/10 text-kajal-600" },
  CONFIRMED: { label: "Confirmed", tone: "bg-himal/25 text-himal-700" },
  CRAFTING: { label: "On the hook", tone: "bg-haldi-200 text-kajal" },
  SHIPPED: { label: "On its way", tone: "bg-pine/15 text-pine" },
  DELIVERED: { label: "Delivered", tone: "bg-pine text-biswar" },
  CANCELLED: { label: "Cancelled", tone: "bg-geru-100 text-geru-700" },
};
