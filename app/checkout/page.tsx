import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const session = await getSession();
  const addresses = session
    ? await prisma.address.findMany({
        where: { userId: session.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: { id: true, name: true, phone: true, line1: true, line2: true, city: true, state: true, pincode: true },
      })
    : [];
  return <CheckoutClient user={session ? { email: session.email, name: session.name } : null} addresses={addresses} />;
}
