import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, ""))
  .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a 10-digit Indian mobile number");

export const pincodeSchema = z.string().trim().regex(/^[1-9]\d{5}$/, "6-digit pincode");

export const addressSchema = z.object({
  name: z.string().trim().min(2, "Your name, please").max(80),
  phone: phoneSchema,
  line1: z.string().trim().min(4, "House / street").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2, "City").max(60),
  state: z.string().trim().min(2, "State").max(60),
  pincode: pincodeSchema,
});

export const cartLineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).nullable().optional(),
  quantity: z.number().int().min(1).max(20),
  customization: z.string().trim().max(60).nullable().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email, please"),
  address: addressSchema,
  items: z.array(cartLineSchema).min(1, "Your bag is empty").max(30),
  couponCode: z.string().trim().toUpperCase().max(30).optional().or(z.literal("")),
  giftWrap: z.boolean().optional(),
  giftNote: z.string().trim().max(240).optional().or(z.literal("")),
  saveAddress: z.boolean().optional(),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, "At least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(100),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(90).optional().or(z.literal("")),
  sku: z.string().trim().min(2).max(40),
  categoryId: z.string().min(1),
  world: z.enum(["AIPAN", "CROCHET"]),
  tagline: z.string().trim().max(140).optional().or(z.literal("")),
  description: z.string().trim().min(10).max(5000),
  makerNote: z.string().trim().max(1200).optional().or(z.literal("")),
  materials: z.string().trim().max(300).optional().or(z.literal("")),
  care: z.string().trim().max(300).optional().or(z.literal("")),
  dimensions: z.string().trim().max(200).optional().or(z.literal("")),
  price: z.coerce.number().int().min(1).max(1_000_000),
  compareAtPrice: z.coerce.number().int().min(0).max(1_000_000).nullable().optional(),
  images: z.array(z.string().trim().min(1)).max(10),
  swatch: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  stock: z.coerce.number().int().min(0).max(100000),
  lowStockAt: z.coerce.number().int().min(0).max(1000),
  madeToOrder: z.boolean(),
  leadTimeDays: z.coerce.number().int().min(0).max(120).nullable().optional(),
  customizable: z.boolean(),
  customizationLabel: z.string().trim().max(60).optional().or(z.literal("")),
  featured: z.boolean(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  weightGrams: z.coerce.number().int().min(0).max(50000).nullable().optional(),
  variants: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().trim().min(1).max(60),
        colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
        sku: z.string().trim().min(2).max(50),
        price: z.coerce.number().int().min(1).nullable().optional(),
        stock: z.coerce.number().int().min(0).max(100000),
      }),
    )
    .max(20),
});

export type ProductInput = z.infer<typeof productSchema>;
