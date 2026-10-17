import { requireAdminPage } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, PageHead, Pill } from "@/components/admin/bits";
import { ReviewActions } from "@/components/admin/forms";
import { formatDate } from "@/lib/utils";

export default async function ReviewsPage() {
  await requireAdminPage();
  const reviews = await prisma.review.findMany({
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true, slug: true } } },
    take: 200,
  });
  return (
    <div className="max-w-4xl">
      <PageHead title="Reviews" sub={`${reviews.filter((r) => !r.approved).length} waiting for you`} />
      <div className="space-y-3">
        {reviews.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={`/p/${r.product.slug}`} target="_blank" className="font-semibold hover:underline">{r.product.name}</Link>
                <p className="text-[13px] text-kajal-400">{r.user.name ?? r.user.email} · {formatDate(r.createdAt)} · {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
              </div>
              <div className="flex items-center gap-2">
                {!r.approved && <Pill className="bg-haldi-200">Pending</Pill>}
                <ReviewActions id={r.id} approved={r.approved} />
              </div>
            </div>
            <p className="mt-3 text-[15px]">{r.body}</p>
          </Card>
        ))}
        {!reviews.length && <p className="text-kajal-400">No reviews yet.</p>}
      </div>
    </div>
  );
}
