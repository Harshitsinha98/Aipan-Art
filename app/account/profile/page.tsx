import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await requireSession();
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { name: true, email: true, phone: true } });
  return <ProfileForm user={{ name: user?.name ?? "", email: user?.email ?? session.email, phone: user?.phone ?? "" }} />;
}
