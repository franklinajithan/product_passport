import { redirect } from "next/navigation";
import { AppSidebar, MobileNav } from "@/components/layout/app-sidebar";
import { WorkspaceTopbar } from "@/components/layout/workspace-topbar";
import { getCurrentUser } from "@/authentication/session";
import { canAccessAdmin } from "@/authentication/permissions";
import { prisma } from "@/database/client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) {
    redirect("/login");
  }

  const pending = await prisma.organisation.count({ where: { status: "PENDING_VERIFICATION" } });

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AppSidebar variant="admin" />
      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceTopbar organisationName="Platform admin" notificationCount={pending} />
        <MobileNav variant="admin" />
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
