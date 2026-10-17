import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { AddressBook } from "@/components/account/address-book";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await requireSession();
  const addresses = await prisma.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return <AddressBook addresses={addresses.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))} />;
}
