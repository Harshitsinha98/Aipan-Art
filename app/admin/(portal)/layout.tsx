import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Owner", robots: { index: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-[#F7F2E9] lg:grid lg:grid-cols-[240px_1fr]">
      <AdminSidebar name={admin.name ?? admin.email} />
      <div className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">{children}</div>
    </div>
  );
}
