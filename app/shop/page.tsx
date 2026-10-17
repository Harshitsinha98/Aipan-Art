import { Suspense } from "react";
import { ShopView } from "@/components/shop/shop-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  return (
    <Suspense>
      <ShopView params={params} />
    </Suspense>
  );
}
