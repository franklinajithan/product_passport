import { redirect } from "next/navigation";
import { AppSidebar, MobileNav } from "@/components/layout/app-sidebar";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  const needsOrganisation =
    user.role === "MANUFACTURER" ||
    user.role === "DISTRIBUTOR" ||
    user.role === "RETAILER";

  if (needsOrganisation) {
    const membership = await getMembershipForUser(user.id);
    if (!membership) {
      redirect("/organisation/setup");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AppSidebar variant="manufacturer" />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav variant="manufacturer" />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
