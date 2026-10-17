import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AccountNav } from "@/components/account/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8">
      <div className="flex flex-col justify-between gap-6 border-b border-kajal/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-geru-600">Your account</p>
          <h1 className="mt-2 font-display text-5xl">Namaste, {session.name?.split(" ")[0] ?? "friend"}.</h1>
        </div>
        <AccountNav />
      </div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
