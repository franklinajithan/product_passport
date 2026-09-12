import { redirect } from "next/navigation";
import { AppSidebar, MobileNav } from "@/components/layout/app-sidebar";
import { WorkspaceTopbar } from "@/components/layout/workspace-topbar";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";

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

  const membership = await getMembershipForUser(user.id);
  if (needsOrganisation && !membership) {
    redirect("/organisation/setup");
  }

  const attention = membership
    ? await prisma.product.count({
        where: {
          organisationId: membership.organisationId,
          OR: [{ completenessScore: { lt: 100 } }, { status: "RECALLED" }, { status: "DRAFT" }],
        },
      })
    : 0;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AppSidebar variant="manufacturer" />
      <div className="flex min-w-0 flex-1 flex-col bg-muted/10">
        <WorkspaceTopbar
          organisationName={membership?.organisation.name ?? "Workspace"}
          notificationCount={attention}
        />
        <MobileNav variant="manufacturer" />
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
