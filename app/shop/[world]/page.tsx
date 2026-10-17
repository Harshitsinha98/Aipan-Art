import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { worldFromSlug, worlds } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ world: string }> }): Promise<Metadata> {
  const w = worldFromSlug((await params).world);
  return w ? { title: `${worlds[w].name} — ${w === "AIPAN" ? "Aipan art" : "Crochet"}`, description: worlds[w].blurb } : {};
}

export default async function WorldPage({
  params,
  searchParams,
}: {
  params: Promise<{ world: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const world = worldFromSlug((await params).world);
  if (!world) notFound();
  return (
    <Suspense>
      <ShopView world={world} params={await searchParams} />
    </Suspense>
  );
}
