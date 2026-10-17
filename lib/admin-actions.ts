"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type OrderStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./prisma";
import { endAdminSession, getAdmin, startAdminSession, verifyPassword } from "./auth";
import { productSchema, type ProductInput } from "./validators";
import { slugify } from "./utils";
import { getRazorpay } from "./razorpay";

type Result = { ok: true; id?: string } | { ok: false; error: string };

async function guard() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised");
  return admin;
}

/* ---------------- session ---------------- */

export async function adminLogin(_: unknown, form: FormData): Promise<{ error?: string }> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.role === "ADMIN" && user.passwordHash && (await verifyPassword(password, user.passwordHash));
  if (!user || !ok) return { error: "Those details don't match an owner account." };
  await startAdminSession(user);
  redirect("/admin");
}

export async function adminLogout() {
  await endAdminSession();
  redirect("/admin/login");
}

/* ---------------- products ---------------- */

export async function saveProduct(id: string | null, input: ProductInput): Promise<Result> {
  await guard();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: `${i.path.join(".")}: ${i.message}` };
  }
  const d = parsed.data;
  const slug = slugify(d.slug || d.name);
  const data = {
    name: d.name,
    slug,
    sku: d.sku.toUpperCase(),
    categoryId: d.categoryId,
    world: d.world,
    tagline: d.tagline || null,
    description: d.description,
    makerNote: d.makerNote || null,
    materials: d.materials || null,
    care: d.care || null,
    dimensions: d.dimensions || null,
    price: d.price,
    compareAtPrice: d.compareAtPrice || null,
    images: d.images,
    swatch: d.swatch,
    stock: d.stock,
    lowStockAt: d.lowStockAt,
    madeToOrder: d.madeToOrder,
    leadTimeDays: d.leadTimeDays ?? null,
    customizable: d.customizable,
    customizationLabel: d.customizationLabel || null,
    featured: d.featured,
    status: d.status,
    weightGrams: d.weightGrams ?? null,
  };

  try {
    const saved = await prisma.$transaction(async (tx) => {
      const before = id ? await tx.product.findUnique({ where: { id }, include: { variants: true } }) : null;
      const product = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });

      if (before && before.stock !== d.stock) {
        await tx.inventoryLog.create({ data: { productId: product.id, delta: d.stock - before.stock, reason: "Edited in product form" } });
      }

      // variants: upsert the submitted ones, delete the rest (unless they've been ordered — then just zero them)
      const keep: string[] = [];
      for (const [i, v] of d.variants.entries()) {
        const vData = { label: v.label, colorHex: v.colorHex ?? null, sku: v.sku.toUpperCase(), price: v.price ?? null, stock: v.stock, sortOrder: i };
        const old = v.id ? before?.variants.find((x) => x.id === v.id) : undefined;
        const row = old
          ? await tx.productVariant.update({ where: { id: old.id }, data: vData })
          : await tx.productVariant.create({ data: { ...vData, productId: product.id } });
        if (!old || old.stock !== v.stock) {
          await tx.inventoryLog.create({
            data: { productId: product.id, variantId: row.id, delta: v.stock - (old?.stock ?? 0), reason: old ? "Edited in product form" : "Variant created" },
          });
        }
        keep.push(row.id);
      }
      const stale = before?.variants.filter((v) => !keep.includes(v.id)) ?? [];
      for (const v of stale) {
        const used = await tx.orderItem.count({ where: { variantId: v.id } });
        if (used) await tx.productVariant.update({ where: { id: v.id }, data: { stock: 0, label: `${v.label} (retired)` } });
        else await tx.productVariant.delete({ where: { id: v.id } });
      }
      return product;
    });
    revalidatePath("/", "layout");
    return { ok: true, id: saved.id };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, error: `That ${String((e.meta?.target as string[] | undefined)?.join(", ") ?? "slug/SKU")} is already used by another product.` };
    }
    console.error(e);
    return { ok: false, error: "Couldn't save. Check the fields and try again." };
  }
}

export async function setProductStatus(id: string, status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  await guard();
  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath("/", "layout");
}

export async function deleteProduct(id: string): Promise<Result> {
  await guard();
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used) {
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
    revalidatePath("/", "layout");
    return { ok: false, error: "This piece has orders, so it was archived instead of deleted." };
  }
  await prisma.product.delete({ where: { id } });
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------------- inventory ---------------- */

export async function adjustStock(productId: string, variantId: string | null, delta: number, reason: string): Promise<Result> {
  await guard();
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 10000) return { ok: false, error: "Invalid quantity" };
  await prisma.$transaction(async (tx) => {
    if (variantId) {
      const v = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } });
      await tx.productVariant.update({ where: { id: variantId }, data: { stock: Math.max(0, v.stock + delta) } });
    } else {
      const p = await tx.product.findUniqueOrThrow({ where: { id: productId } });
      await tx.product.update({ where: { id: productId }, data: { stock: Math.max(0, p.stock + delta) } });
    }
    await tx.inventoryLog.create({ data: { productId, variantId, delta, reason: reason.slice(0, 80) || "Manual adjustment" } });
  });
  revalidatePath("/admin/inventory");
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------------- orders & payments ---------------- */

const orderUpdate = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CRAFTING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  note: z.string().trim().max(300).optional(),
  courier: z.string().trim().max(60).optional(),
  trackingNumber: z.string().trim().max(60).optional(),
});

export async function updateOrder(id: string, input: z.infer<typeof orderUpdate>): Promise<Result> {
  await guard();
  const parsed = orderUpdate.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid update" };
  const { status, note, courier, trackingNumber } = parsed.data;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { ok: false, error: "Order not found" };

  await prisma.$transaction(async (tx) => {
    // Cancelling a paid order puts its stock back on the shelf.
    if (status === "CANCELLED" && order.status !== "CANCELLED" && order.stockCommitted) {
      for (const it of order.items) {
        if (it.variantId) await tx.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } }).catch(() => null);
        else await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
        await tx.inventoryLog.create({ data: { productId: it.productId, variantId: it.variantId, delta: it.quantity, reason: "Order cancelled — restocked", reference: order.orderNumber } });
      }
    }
    await tx.order.update({
      where: { id },
      data: {
        status,
        courier: courier || order.courier,
        trackingNumber: trackingNumber || order.trackingNumber,
        stockCommitted: status === "CANCELLED" ? false : order.stockCommitted,
        ...(status !== order.status || note ? { events: { create: { status, note: note || null } } } : {}),
      },
    });
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function refundOrder(id: string): Promise<Result> {
  await guard();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.paymentStatus !== "PAID" || !order.razorpayPaymentId) return { ok: false, error: "Only paid orders can be refunded." };
  const rzp = getRazorpay();
  if (!rzp) return { ok: false, error: "Razorpay keys are missing." };
  try {
    await rzp.payments.refund(order.razorpayPaymentId, { amount: order.total * 100, notes: { orderNumber: order.orderNumber } });
  } catch (e) {
    console.error("[refund]", e);
    const msg = (e as { error?: { description?: string } })?.error?.description;
    return { ok: false, error: msg ?? "Razorpay refused the refund." };
  }
  await prisma.order.update({
    where: { id },
    data: { paymentStatus: "REFUNDED", events: { create: { status: order.status, note: "Full refund issued to the original payment method." } } },
  });
  if (order.status !== "CANCELLED") await updateOrder(id, { status: "CANCELLED", note: "Cancelled with refund." });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/payments");
  return { ok: true };
}

export async function clearAttention(id: string) {
  await guard();
  await prisma.order.update({ where: { id }, data: { needsAttention: null } });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

/* ---------------- categories ---------------- */

export async function saveCategory(_: unknown, form: FormData): Promise<{ error?: string; ok?: boolean }> {
  await guard();
  const id = String(form.get("id") ?? "") || null;
  const name = String(form.get("name") ?? "").trim();
  const world = String(form.get("world")) as "AIPAN" | "CROCHET";
  const description = String(form.get("description") ?? "").trim() || null;
  const sortOrder = Number(form.get("sortOrder") ?? 0) || 0;
  if (name.length < 2 || !["AIPAN", "CROCHET"].includes(world)) return { error: "Name and craft are required." };
  try {
    const data = { name, world, description, sortOrder, slug: slugify(String(form.get("slug") || name)) };
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
  } catch {
    return { error: "A category with this slug already exists." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleCategory(id: string, active: boolean) {
  await guard();
  await prisma.category.update({ where: { id }, data: { active } });
  revalidatePath("/", "layout");
}

/* ---------------- coupons ---------------- */

export async function createCoupon(_: unknown, form: FormData): Promise<{ error?: string; ok?: boolean }> {
  await guard();
  const schema = z.object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,20}$/, "Code: 3–20 letters/numbers"),
    type: z.enum(["PERCENT", "FLAT"]),
    value: z.coerce.number().int().min(1),
    minimumOrder: z.coerce.number().int().min(0).optional(),
    maxDiscount: z.coerce.number().int().min(0).optional(),
    usageLimit: z.coerce.number().int().min(0).optional(),
    expiresAt: z.string().optional(),
    description: z.string().trim().max(120).optional(),
  });
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => v !== ""));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;
  if (d.type === "PERCENT" && d.value > 90) return { error: "Percent can't exceed 90." };
  try {
    await prisma.coupon.create({
      data: {
        ...d,
        minimumOrder: d.minimumOrder || null,
        maxDiscount: d.maxDiscount || null,
        usageLimit: d.usageLimit || null,
        expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T23:59:59+05:30`) : null,
      },
    });
  } catch {
    return { error: "That code already exists." };
  }
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCoupon(id: string, active: boolean) {
  await guard();
  await prisma.coupon.update({ where: { id }, data: { active } });
  revalidatePath("/admin/coupons");
}

/* ---------------- reviews ---------------- */

export async function moderateReview(id: string, approve: boolean) {
  await guard();
  if (approve) await prisma.review.update({ where: { id }, data: { approved: true } });
  else await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}

export async function setOrderStatusQuick(id: string, status: OrderStatus) {
  return updateOrder(id, { status });
}
