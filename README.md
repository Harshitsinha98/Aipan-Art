# Aipan Art — ऐपण

Online shop for two Kumaoni hand-crafts: **Likhai** (Aipan art) and **Hook** (crochet).
Built with Next.js 15 (App Router), Tailwind, Framer Motion, Prisma + Postgres, and Razorpay.

## What's inside

**Storefront**
- Home page: a chowki mandala that draws itself, a "two doors" split between the crafts, a pinned horizontal "how it's made" scroller, and a note from the maker.
- Shop pages for each craft (`/shop/aipan`, `/shop/crochet`) and `/shop`, with category chips, live search, sorting and a "ready to ship" filter.
- Product page:
  - colour variants
  - personalisation text (for nameplates)
  - made-to-order lead times
  - low-stock nudges
  - sticky buy bar on mobile
  - approved reviews
- Cart drawer with a free-shipping progress bar. The bag is kept in localStorage.
- **One-page checkout, no account needed.** Typing a pincode fills in city and state, and guest details are remembered for next time. Gift wrap and a gift note are optional, and coupons work. The page shows Lakshmi-footprint progress, then the Razorpay modal opens.
- After payment, the order page shows a footprint timeline. Guests can turn the order into an account with one password.
- `/track` looks up an order by order number + email.

**Customer account** (`/account`): orders (with reviews once delivered), saved addresses, profile and password.

**Owner panel** (`/admin`)
- Today: sales today, last 7 days and last 30 days, a 30-day chart, what's left to make or pack, low stock, and paid orders that are short on stock.
- Orders: filters, search, status updates (Confirmed → Being made → Shipped → Delivered), courier/AWB, customer notes, cancelling (puts stock back) and full refunds through Razorpay.
- Payments: every Razorpay attempt (paid, failed, abandoned, refunded) with dashboard links.
- Products: create and edit, photo upload (drag and drop, reorder), colour variants with their own stock and price, made-to-order, personalisation, featured, draft/live/archived.
- Inventory: quick +/− or batch adjustments with a reason, and a stock history log.
- Categories, coupons (% or flat, minimum order, cap, usage limit, expiry), review moderation, customers (guests and accounts).

**Payment safety**
- Prices are always recalculated on the server.
- Razorpay signatures are checked with HMAC.
- The webhook is a backstop with idempotency.
- Stock is taken off in the same transaction that marks the order paid, so it can't be sold twice.
- A CSRF origin check runs on every API write.
- The admin cookie is separate and re-checked against the database on every page.

## Setup

```bash
cp .env.example .env        # fill DATABASE_URL, AUTH_SECRET, Razorpay keys, ADMIN_EMAIL/ADMIN_PASSWORD
npm install
npm run db:push             # create tables
npm run db:seed             # categories, sample products, coupons PEHLA10 / PAHAD150, owner account
npm run dev
```

Owner panel: `http://localhost:3000/admin` (log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### Razorpay
1. Get the test keys from Dashboard → Account & Settings → API Keys, and put them in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
2. Add a webhook: Dashboard → Webhooks → `https://<your-domain>/api/checkout/webhook`, with events `payment.captured`, `order.paid` and `payment.failed`. Put its secret in `RAZORPAY_WEBHOOK_SECRET`.
3. Switch to live keys when you go live.

### Product photos
- **Cloudinary (recommended, required on Vercel):** create an *unsigned* upload preset, then set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
- Without Cloudinary, uploads are saved to `./uploads` and served from `/media/*`. This works on a VPS or Railway with a volume.

Until a product has photos, it shows a hand-drawn placeholder in its own colour: a mandala for Aipan, a rib texture for crochet.

### Deploy (Vercel + Neon)
- Create a Neon Postgres database and put its URL in `DATABASE_URL`.
- Add the remaining env vars in Vercel.
- Run `npm run db:push && npm run db:seed` once from your machine against the production database.

## Make it yours
- `lib/site.ts`: brand name, Instagram, email, shipping rules, gift wrap price, and the home-page maker note.
- The sample product copy and maker notes in `prisma/seed.ts` are placeholders. Edit them from the admin panel.
- `tailwind.config.ts`: palette (geru, biswar, kajal, pine, haldi, himal).
