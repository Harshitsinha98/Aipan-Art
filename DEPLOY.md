# Vercel par deploy — step by step

Pura process ~15 minute ka hai. Teen cheezein chahiye: ek Postgres database, Razorpay keys, aur (Vercel ke liye) Cloudinary.

## 1. Database — Neon (free)
1. [neon.tech](https://neon.tech) par account banao → **New Project**.
2. Connection string copy karo. Woh aise dikhega:
   `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`
3. Isko sambhal kar rakho — Vercel mein `DATABASE_URL` ke roop mein daalni hai.

## 2. Razorpay keys
1. [dashboard.razorpay.com](https://dashboard.razorpay.com) → **Account & Settings → API Keys**.
2. `Key Id` aur `Key Secret` copy karo (pehle **Test Mode** mein — live baad mein).

## 3. Cloudinary — product photos ke liye (Vercel par zaroori)
> Vercel par uploaded files save nahi rehti, isliye photos ke liye Cloudinary chahiye.
1. [cloudinary.com](https://cloudinary.com) par free account banao.
2. Dashboard par **Cloud name** note karo.
3. **Settings → Upload → Upload presets → Add upload preset** → **Signing Mode = Unsigned** → save karo. Preset ka naam note karo.

## 4. Vercel par import
1. Is repo ko GitHub par push karo (ho chuka hai — `main` branch).
2. [vercel.com/new](https://vercel.com/new) → yeh repo import karo. Framework khud **Next.js** detect ho jayega. Build settings chhedne ki zaroorat nahi.
3. **Environment Variables** mein yeh daalo:

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon ki connection string (step 1) |
| `AUTH_SECRET` | koi lamba random string — terminal par `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_URL` | `https://<tumhara-project>.vercel.app` (deploy ke baad apne domain se update kar dena) |
| `RAZORPAY_KEY_ID` | step 2 |
| `RAZORPAY_KEY_SECRET` | step 2 |
| `RAZORPAY_WEBHOOK_SECRET` | step 6 mein banega — abhi kuch bhi daal do |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | step 3 |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | step 3 |
| `ADMIN_EMAIL` | tumhara email (owner login) |
| `ADMIN_PASSWORD` | ek strong password (owner login) |

4. **Deploy** dabao.

## 5. Database tables banao + sample data daalo
Deploy ke baad, apne computer par (repo clone karke) ek baar yeh chalao — `.env` mein wahi `DATABASE_URL` daal kar jo Neon ka hai:

```bash
npm install
npm run db:push     # tables banata hai
npm run db:seed     # categories, sample products, coupons, owner account
```

Ab `https://<project>.vercel.app/admin` par `ADMIN_EMAIL` / `ADMIN_PASSWORD` se login karke apne products aur photos daal sakte ho.

## 6. Razorpay webhook (payment confirm ke liye)
1. Razorpay dashboard → **Settings → Webhooks → Add New Webhook**.
2. URL: `https://<project>.vercel.app/api/checkout/webhook`
3. Events chuno: `payment.captured`, `order.paid`, `payment.failed`.
4. Ek **Secret** set karo, usko copy karo.
5. Vercel → Project → Settings → Environment Variables → `RAZORPAY_WEBHOOK_SECRET` update karo → **Redeploy** karo.

## 7. Live jaane se pehle
- Razorpay ko **Live Mode** par le jao aur live keys Vercel mein update karke redeploy karo.
- Apna domain Vercel mein jodo, aur `NEXT_PUBLIC_APP_URL` usse update kar do.

Bas. Har `git push` par Vercel apne aap naya deploy kar dega.
